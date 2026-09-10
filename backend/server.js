const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
dotenv.config();
const app = express();
app.use(helmet());
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://eskraft.netlify.app'];
const envOrigins = (process.env.FRONTEND_URL || '').split(',').map(s=>s.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const u = new URL(origin);
    // Allow any Netlify deploy preview / production deploy + any eskraft domain
    if (u.hostname.endsWith('.netlify.app')) return true;
    if (u.hostname.endsWith('eskraft.in') || u.hostname.endsWith('eskraft.com')) return true;
  } catch { /* ignore */ }
  return false;
};
app.use(cors({ origin: (origin, cb) => { if (isAllowedOrigin(origin)) cb(null, true); else cb(null, false); }, credentials: true }));
const limiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
app.use('/api/', limiter);
// Webhooks need raw body
app.use('/api/webhooks', require('./src/routes/webhookRoutes'));
app.use(express.json());
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/whatsapp', require('./src/routes/whatsappRoutes'));
// WhatsApp Automation routes
app.use('/api/otp', require('./src/routes/waOtpRoutes'));
app.use('/api', require('./src/routes/waCommerceRoutes'));
app.use('/webhook', require('./src/routes/waWebhookRoutes'));
app.get('/api/health', (req,res)=> res.json({ success:true, message:'Server is healthy', uptime: process.uptime() }));
app.get('/health', (req,res)=> res.json({ success:true, message:'Server is healthy' })); // for Render health check
app.use((req,res)=> res.status(404).json({ success:false, error:{code:'NOT_FOUND', message:'Route not found'}}));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({success:false, error:{code:'SERVER_ERROR', message:'Internal server error'}}); });
const PORT = process.env.PORT || 5000;
// Start WhatsApp abandoned cart cron
require('./src/cron/waAbandonedCartCron').startAbandonedCartCron();
// Keep Neon + Render free tier awake: self-ping every 4 min
if (process.env.NODE_ENV === 'production' && process.env.API_URL) {
  setInterval(()=> fetch(`${process.env.API_URL}/api/health`).catch(()=>{}), 4*60*1000);
}
if (process.env.NODE_ENV !== 'test') app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
module.exports = app;
