const prisma = require('../config/prisma');
const { createCashfreeOrder, verifyCashfreePayment } = require('../services/cashfree');
const { getDeliveryFee } = require('../utils/shipping');
const { getSalePrice } = require('../utils/discount');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ORDER', message: 'No items in order' } });
    }
    // validate quantities
    for (const it of items) {
      if (!it.productId || !Number.isInteger(it.quantity) || it.quantity < 1) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_QUANTITY', message: 'Invalid productId or quantity' } });
      }
    }

    // --- DB-only transaction: no network calls inside ---
    const order = await prisma.$transaction(async (tx) => {
      // Batch fetch all products in 2 queries max (by id + by slug) instead of N*2 sequential queries
      const ids = [...new Set(items.map((i) => i.productId))];
      const [byId, bySlug] = await Promise.all([
        tx.product.findMany({ where: { id: { in: ids } } }),
        tx.product.findMany({ where: { slug: { in: ids } } }),
      ]);
      const productById = new Map(byId.map((p) => [p.id, p]));
      const productBySlug = new Map(bySlug.map((p) => [p.slug, p]));

      let subtotal = 0;
      const orderItemsData = [];
      for (const item of items) {
        const product = productById.get(item.productId) || productBySlug.get(item.productId);
        if (!product || !product.active) {
          throw Object.assign(new Error(`Product ${item.productId} not found`), { code: 'PRODUCT_NOT_FOUND' });
        }
        if (product.stock < item.quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { code: 'OUT_OF_STOCK' });
        }
        // 10% off on the three discounted frames only — same list as frontend utils/discount.js
        const unitPrice = getSalePrice(product, product.price);
        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;
        orderItemsData.push({ productId: product.id, product_code: product.product_code, product_name: product.product_name, quantity: item.quantity, unitPrice, subtotal: itemSubtotal });
      }
      // Minimum order value — orders above ₹200 only (subtotal before shipping)
      if (subtotal < 200) {
        throw Object.assign(new Error(`Minimum order value is ₹200. Your cart subtotal is ₹${subtotal}. Please add more items.`), { code: 'MINIMUM_ORDER' });
      }
      // Shared slab (subtotal BEFORE delivery): ₹200–349 → ₹70 | ₹350–699 → ₹35 | ₹700+ → FREE
      const shippingFee = getDeliveryFee(subtotal);
      const total = subtotal + shippingFee;
      const orderNumber = `ESK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

      const created = await tx.order.create({
        data: {
          orderNumber, customerId: req.user.customerId, subtotal, shippingFee, total,
          status: 'PENDING_PAYMENT', paymentStatus: 'PENDING',
          items: { create: orderItemsData },
        },
        include: { items: { include: { product: true } } },
      });

      // Atomic stock decrement with guard to prevent race-condition oversell.
      // Run in parallel inside the same tx (still atomic, faster than sequential for loop)
      const decResults = await Promise.all(
        orderItemsData.map((oi) =>
          tx.product.updateMany({
            where: { id: oi.productId, stock: { gte: oi.quantity } },
            data: { stock: { decrement: oi.quantity } },
          })
        )
      );
      for (let i = 0; i < decResults.length; i++) {
        if (decResults[i].count === 0) {
          throw Object.assign(new Error(`Insufficient stock for ${orderItemsData[i].product_name} (concurrent update)`), { code: 'OUT_OF_STOCK' });
        }
      }
      return created;
    }, { maxWait: 10000, timeout: 15000 });

     // create Cashfree payment order - auto-fill from logged-in user or checkout form body
    // --- Cashfree AFTER transaction commit (never inside $transaction) ---
    let cashfreeData = null;
    console.log('Cashfree env check:', {
      hasAppId: Boolean(process.env.CASHFREE_APP_ID),
      appIdPlaceholder: process.env.CASHFREE_APP_ID === 'your_cashfree_app_id',
      hasSecretKey: Boolean(process.env.CASHFREE_SECRET_KEY),
      environment: process.env.CASHFREE_ENVIRONMENT
    });
    if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_APP_ID !== 'your_cashfree_app_id') {
      try {
        const { customerDetails } = req.body;
        const cf = await createCashfreeOrder({ amount: order.total, orderId: order.orderNumber, customerId: req.user.customerId, customerName: customerDetails?.name || req.user.name, customerEmail: customerDetails?.email || req.user.email, customerPhone: customerDetails?.phone || req.user.phone });
        cashfreeData = { payment_session_id: cf.payment_session_id, payment_link: cf.payment_link, cf_order_id: cf.cf_order_id };
        await prisma.payment.create({ data: { orderId: order.id, providerOrderId: String(cf.cf_order_id), amount: order.total, status: 'PENDING' } });
      } catch (e) {
        const cfErr = e.response?.data || e.data || e.message;
        console.error('Cashfree create failed:', JSON.stringify(cfErr, null, 2));
        const isAuthError = cfErr?.message?.toLowerCase?.().includes('auth') || cfErr?.code === 'authentication_failed' || e.response?.status === 401;
        // Compensating transaction: restore stock + mark FAILED so no dangling PENDING_PAYMENT / oversell
        await prisma.$transaction(async (tx2) => {
          await tx2.order.update({ where: { id: order.id }, data: { status: 'FAILED', paymentStatus: 'FAILED' } });
          await Promise.all(
            order.items.map((it) => tx2.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } }))
          );
        }).catch(() => {});
        return res.status(502).json({
          success: false,
          error: {
            code: isAuthError ? 'PAYMENT_AUTH_FAILED' : 'PAYMENT_PROVIDER_ERROR',
            message: isAuthError
              ? 'Payment provider auth failed. Check CASHFREE_ENVIRONMENT vs key (PRODUCTION key requires ENVIRONMENT=PRODUCTION).'
              : 'Order created but payment session failed. Stock restored. Please retry.',
            details: process.env.NODE_ENV !== 'production' ? cfErr : undefined,
          },
          data: { order, cashfree: null },
        });
      }
    }
    res.status(201).json({ success: true, data: { ...order, cashfree: cashfreeData }, message: 'Order created successfully' });
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: error.message } });
    if (error.code === 'OUT_OF_STOCK') return res.status(400).json({ success: false, error: { code: 'OUT_OF_STOCK', message: error.message } });
    if (error.code === 'MINIMUM_ORDER') return res.status(400).json({ success: false, error: { code: 'MINIMUM_ORDER', message: error.message } });
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ where: { customerId: req.user.customerId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: orders });
  } catch (e) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }); }
};
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await prisma.order.findUnique({ where: { orderNumber: id }, include: { items: { include: { product: true } }, customer: true, payments: true } });
    if (!order) order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, customer: true, payments: true } });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (order.customerId !== req.user.customerId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    res.json({ success: true, data: order });
  } catch (e) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }); }
};
const getAllOrders = async (req, res) => {
  try {
    const { status, search, page=1, limit=20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.OR = [{ orderNumber: { contains: search, mode:'insensitive' } }, { customer: { name: { contains: search, mode:'insensitive' } } }, { customer: { email: { contains: search, mode:'insensitive' } } }];
    const orders = await prisma.order.findMany({ where, include: { items: { include: { product: true } }, customer: true, payments: true }, orderBy: { createdAt: 'desc' }, skip: (Number(page)-1)*Number(limit), take: Number(limit) });
    const total = await prisma.order.count({ where });
    res.json({ success: true, data: { orders, total, page: Number(page), limit: Number(limit) } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }); }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; const { status } = req.body;
    const allowed = ['PENDING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','FAILED','REFUNDED'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid status' } });
    let order = await prisma.order.findUnique({ where: { orderNumber: id } });
    if (!order) order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }); }
};
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: { items: { include: { product: true } }, customer: true, payments: true },
    });
    if (!order) order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, customer: true, payments: true } });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (order.customerId !== req.user.customerId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    if (order.paymentStatus === 'SUCCESS' || order.status === 'PROCESSING' || order.status === 'PAID') return res.json({ success: true, data: order, verified: true });
    const cashfreePayments = await verifyCashfreePayment(order.orderNumber);
    const payments = Array.isArray(cashfreePayments) ? cashfreePayments : cashfreePayments?.data || [];
    const successfulPayment = payments.find((p) => String(p.payment_status || '').toUpperCase() === 'SUCCESS');
    if (successfulPayment) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({ where: { orderId: order.id }, data: { status: 'SUCCESS', providerPaymentId: String(successfulPayment.cf_payment_id) } });
        await tx.order.update({ where: { id: order.id }, data: { paymentStatus: 'SUCCESS', status: 'PROCESSING' } });
      });
      const updatedOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { product: true } }, customer: true, payments: true } });
      return res.json({ success: true, verified: true, data: updatedOrder });
    }
    return res.json({ success: true, verified: false, data: order, message: 'Payment is still being processed.' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(502).json({ success: false, error: { code: 'PAYMENT_VERIFICATION_FAILED', message: 'Unable to verify payment right now.' } });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await prisma.order.findUnique({ where: { orderNumber: id }, include: { items: true, payments: true } });
    if (!order) order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
    }
    await prisma.$transaction(async (tx) => {
      const shouldRestore = !['FAILED', 'CANCELLED', 'REFUNDED'].includes(order.status);
      if (shouldRestore && order.items.length > 0) {
        await Promise.all(
          order.items.map((it) =>
            tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } }).catch(() => {})
          )
        );
      }
      if (order.payments.length > 0) {
        await tx.payment.deleteMany({ where: { orderId: order.id } });
      }
      if (order.items.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      }
      await tx.order.delete({ where: { id: order.id } });
    });
    res.json({ success: true, message: 'Order deleted successfully', data: { orderNumber: order.orderNumber, id: order.id } });
  } catch (e) {
    console.error('deleteOrder error:', e);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete order' } });
  }
};
module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, verifyPayment, deleteOrder };
