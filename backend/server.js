const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
dotenv.config();
const app = express();
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s=>s.trim());
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(null, true); }, credentials: true }));
const limiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
app.use('/api/', limiter);
// Webhooks need raw body
app.use('/api/webhooks', require('./src/routes/webhookRoutes'));
app.use(express.json());
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.get('/api/health', (req,res)=> res.json({ success:true, message:'Server is healthy', uptime: process.uptime() }));
app.get('/health', (req,res)=> res.json({ success:true, message:'Server is healthy' })); // for Render health check
app.use((req,res)=> res.status(404).json({ success:false, error:{code:'NOT_FOUND', message:'Route not found'}}));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({success:false, error:{code:'SERVER_ERROR', message:'Internal server error'}}); });
const PORT = process.env.PORT || 5000;
// Keep Neon + Render free tier awake: self-ping every 4 min
if (process.env.NODE_ENV === 'production' && process.env.API_URL) {
  setInterval(()=> fetch(`${process.env.API_URL}/api/health`).catch(()=>{}), 4*60*1000);
}
if (process.env.NODE_ENV !== 'test') app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
module.exports = app;
