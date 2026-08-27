const express = require('express');
const { getProducts, getProductBySlug, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductBySlug);
router.post('/', protect, admin, createProduct);

module.exports = router;
