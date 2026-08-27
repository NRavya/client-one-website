const prisma = require('../config/prisma');

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

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];
      for (const item of items) {
        // support id or slug as productId
        let product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) product = await tx.product.findUnique({ where: { slug: item.productId } });
        if (!product || !product.active) {
          throw Object.assign(new Error(`Product ${item.productId} not found`), { code: 'PRODUCT_NOT_FOUND' });
        }
        if (product.stock < item.quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { code: 'OUT_OF_STOCK' });
        }
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;
        orderItemsData.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price, subtotal: itemSubtotal });
      }
      const shippingFee = subtotal >= 500 ? 0 : 60;
      const total = subtotal + shippingFee;
      const orderNumber = `ESK-${Date.now()}-${Math.floor(Math.random()*900+100)}`;

      const created = await tx.order.create({
        data: {
          orderNumber, customerId: req.user.customerId, subtotal, shippingFee, total,
          status: 'PENDING_PAYMENT', paymentStatus: 'PENDING',
          items: { create: orderItemsData }
        },
        include: { items: { include: { product: true } } }
      });
      // decrement stock
      for (const oi of orderItemsData) {
        await tx.product.update({ where: { id: oi.productId }, data: { stock: { decrement: oi.quantity } } });
      }
      return created;
    });

    res.status(201).json({ success: true, data: order, message: 'Order created successfully' });
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
