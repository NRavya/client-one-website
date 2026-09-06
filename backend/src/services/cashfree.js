const { Cashfree, CFEnvironment } = require('cashfree-pg');
const env = (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase() === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
const cashfree = new Cashfree(env, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

function toHttps(url) {
  if (!url) return url;
  // Cashfree PRODUCTION rejects http return_url/notify_url - must be https
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
}

async function createCashfreeOrder({ amount, orderId, customerId, customerName, customerEmail, customerPhone, returnUrl }) {
  const isProd = (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase() === 'PRODUCTION';
  let effectiveReturnUrl = returnUrl || `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`;
  let effectiveNotifyUrl = `${process.env.API_URL}/api/webhooks/cashfree`;
  if (isProd) {
    effectiveReturnUrl = toHttps(effectiveReturnUrl);
    effectiveNotifyUrl = toHttps(effectiveNotifyUrl);
  }
  const orderMeta = { return_url: effectiveReturnUrl };
  // Cashfree Sandbox validates notify_url is reachable - localhost causes 404 Route Not Found
  if (effectiveNotifyUrl && !effectiveNotifyUrl.includes('localhost') && !effectiveNotifyUrl.includes('127.0.0.1')) {
    orderMeta.notify_url = effectiveNotifyUrl;
  }
  const req = {
    order_amount: Number(amount),
    order_currency: 'INR',
    order_id: orderId,
    customer_details: { customer_id: String(customerId), customer_name: customerName || 'Customer', customer_email: customerEmail || 'test@eskraft.com', customer_phone: String(customerPhone || '9999999999') },
    order_meta: orderMeta,
  };
  const res = await cashfree.PGCreateOrder(req);
  return res.data;
}
module.exports = { cashfree, createCashfreeOrder };
