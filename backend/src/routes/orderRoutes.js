const express = require('express');
const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    verifyPayment,
    deleteOrder
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

router.get('/admin/all', protect, admin, getAllOrders);
router.patch('/admin/:id/status', protect, admin, updateOrderStatus);
router.delete('/admin/:id', protect, admin, deleteOrder);

router.get('/:id/verify-payment', protect, verifyPayment);
router.get('/:id', protect, getOrderById);

module.exports = router;