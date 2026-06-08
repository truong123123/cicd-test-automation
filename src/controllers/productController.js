const productService = require('../services/productService');

/**
 * GET /api/products
 * Supports ?category=electronics query param
 */
const getAll = (req, res, next) => {
  try {
    const { category } = req.query;
    const products = productService.getAllProducts(category || null);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/stats
 */
const getStats = (_req, res, next) => {
  try {
    const stats = productService.getProductStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 */
const getById = (req, res, next) => {
  try {
    const product = productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products
 */
const create = (req, res, next) => {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('Category') || err.message.includes('Price') || err.message.includes('Stock')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * PUT /api/products/:id
 */
const update = (req, res, next) => {
  try {
    const product = productService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    if (err.message.includes('Category') || err.message.includes('Price') || err.message.includes('Stock')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * DELETE /api/products/:id
 */
const remove = (req, res, next) => {
  try {
    const deleted = productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, getStats, create, update, remove };
