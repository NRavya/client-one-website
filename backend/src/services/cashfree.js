const { Cashfree, CFEnvironment } = require('cashfree-pg');

const env =
    (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase() === 'PRODUCTION'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(
    env,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

function toHttps(url) {
  if (!url) return url;

  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  return url;
}


/**
 * Create Cashfree payment order
 */
async function createCashfreeOrder({
                                     amount,
                                     orderId,
                                     customerId,
                                     customerName,
                                     customerEmail,
                                     customerPhone,
                                   }) {
  const isProd =
      (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase() ===
      'PRODUCTION';

  /*
   * Cashfree replaces {order_id} with the actual order ID.
   */
  let effectiveReturnUrl =
      `${process.env.FRONTEND_URL}/thank-you?order_id={order_id}`;

  let effectiveNotifyUrl =
      `${process.env.API_URL}/api/webhooks/cashfree`;

  if (isProd) {
    effectiveReturnUrl = toHttps(effectiveReturnUrl);
    effectiveNotifyUrl = toHttps(effectiveNotifyUrl);
  }

  const orderMeta = {
    return_url: effectiveReturnUrl,
  };

  if (
      effectiveNotifyUrl &&
      !effectiveNotifyUrl.includes('localhost') &&
      !effectiveNotifyUrl.includes('127.0.0.1')
  ) {
    orderMeta.notify_url = effectiveNotifyUrl;
  }

  const req = {
    order_amount: Number(amount),
    order_currency: 'INR',

    order_id: orderId,

    customer_details: {
      customer_id: String(customerId),
      customer_name: customerName || 'Customer',
      customer_email: customerEmail || 'test@eskraft.com',
      customer_phone: String(customerPhone || '9999999999'),
    },

    order_meta: orderMeta,
  };

  const res = await cashfree.PGCreateOrder(req);

  return res.data;
}


/**
 * Verify payment directly with Cashfree
 *
 * This is used when the customer returns to the website.
 * We do NOT trust the frontend/redirect itself as proof of payment.
 */
async function verifyCashfreePayment(orderId) {
  const response = await cashfree.PGOrderFetchPayments(orderId);

  return response.data;
}


module.exports = {
  cashfree,
  createCashfreeOrder,
  verifyCashfreePayment,
};