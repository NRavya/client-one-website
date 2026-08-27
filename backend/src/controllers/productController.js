const prisma = require('../config/prisma');

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { id } = req.params; // Using 'id' in route, but it's a slug
    const product = await prisma.product.findUnique({
      where: { slug: id }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

// Admin endpoints
const createProduct = async (req, res) => {
  try {
    const { product_code, product_name } = req.body;
    // strict validation against master catalog
    try {
      const { validateProduct } = await import('../catalog/validateCatalog.js');
      const r = validateProduct(product_code, product_name);
      if (!r.valid) return res.status(400).json({ success: false, error: { code: 'INVALID_CATALOG', message: r.reason } });
    } catch {}
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

module.exports = { getProducts, getProductBySlug, createProduct };
