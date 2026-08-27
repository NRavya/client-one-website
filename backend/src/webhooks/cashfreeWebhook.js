const prisma = require('../config/prisma');
const crypto = require('crypto');

const handleCashfreeWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody; // Assumes raw body is saved by express middleware
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    // Verify signature
    const tsBody = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(tsBody)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.warn('Webhook signature verification failed');
      return res.status(401).send('Invalid signature');
    }

    const payload = req.body;

    // Handle different webhook events
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = payload.data.order.order_id;
      const payment = payload.data.payment;

      if (payment.payment_status === 'SUCCESS') {
        const order = await prisma.order.findUnique({ where: { orderNumber: orderId } });
        if (order) {
           await prisma.payment.updateMany({
             where: { orderId: order.id },
             data: { status: 'SUCCESS', providerPaymentId: String(payment.cf_payment_id) }
           });

           await prisma.order.update({
             where: { id: order.id },
             data: { paymentStatus: 'SUCCESS', status: 'PROCESSING' }
           });
        }
      }
    } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK') {
        const orderId = payload.data.order.order_id;
        const order = await prisma.order.findUnique({ where: { orderNumber: orderId } });
        if (order) {
           await prisma.payment.updateMany({
             where: { orderId: order.id },
             data: { status: 'FAILED' }
           });
           await prisma.order.update({
             where: { id: order.id },
             data: { paymentStatus: 'FAILED', status: 'FAILED' }
           });
        }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook Error');
  }
};

module.exports = { handleCashfreeWebhook };
