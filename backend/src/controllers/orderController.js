const prisma = require('../config/prisma');
const { createCashfreeOrder } = require('../services/cashfree');

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
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;
        orderItemsData.push({ productId: product.id, product_code: product.product_code, product_name: product.product_name, quantity: item.quantity, unitPrice: product.price, subtotal: itemSubtotal });
      }
      const shippingFee = subtotal > 750 ? 0 : 60;
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
    if (search) where.OR = [{ orderNumber: { contains: search, mode:'insensitive' } }, { customer: { name: { contains: search, mode:'insensitive' } } }];
    const orders = await prisma.order.findMany({ where, include: { items: { include: { product: true } }, customer: true }, orderBy: { createdAt: 'desc' }, skip: (Number(page)-1)*Number(limit), take: Number(limit) });
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
module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
