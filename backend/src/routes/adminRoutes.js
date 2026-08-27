const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const prisma = require('../config/prisma');
const router = express.Router();
router.use(protect, admin);
router.get('/orders', getAllOrders);
router.get('/orders/:id', async (req,res)=>{
  const { id } = req.params;
  let order = await prisma.order.findUnique({ where:{orderNumber:id}, include:{items:{include:{product:true}}, customer:true, payments:true}});
  if(!order) order = await prisma.order.findUnique({ where:{id}, include:{items:{include:{product:true}}, customer:true, payments:true}});
  if(!order) return res.status(404).json({success:false, error:{code:'NOT_FOUND', message:'Order not found'}});
  res.json({success:true, data:order});
});
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/customers', async (req,res)=>{
  const customers = await prisma.customer.findMany({ include:{ user:{select:{role:true}}}, orderBy:{createdAt:'desc'}});
  res.json({success:true, data:customers});
});
router.get('/products', async (req,res)=>{
  const products = await prisma.product.findMany({ orderBy:{createdAt:'desc'}});
  res.json({success:true, data:products});
});
module.exports = router;
