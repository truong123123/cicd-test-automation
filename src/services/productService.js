const { v4: uuidv4 } = require('uuid');

// In-memory data store
let products = [
  { id: '1', name: 'Laptop Pro 15', category: 'electronics', price: 1299.99, stock: 50, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', name: 'Wireless Mouse', category: 'electronics', price: 29.99, stock: 200, createdAt: '2024-01-02T00:00:00.000Z' },
  { id: '3', name: 'Standing Desk', category: 'furniture', price: 499.99, stock: 30, createdAt: '2024-01-03T00:00:00.000Z' },
  { id: '4', name: 'Office Chair', category: 'furniture', price: 349.99, stock: 45, createdAt: '2024-01-04T00:00:00.000Z' },
];

const VALID_CATEGORIES = ['electronics', 'furniture', 'clothing', 'books', 'sports'];

/**
 * Get all products, optionally filtered by category
 * @param {string|null} category
 * @returns {Array}
 */
const getAllProducts = (category = null) => {
  if (category) {
    return products.filter((p) => p.category === category);
  }
  return [...products];
};

/**
 * Get product by ID
 * @param {string} id
 * @returns {Object|null}
 */
const getProductById = (id) => {
  return products.find((p) => p.id === id) || null;
};

/**
 * Create a new product
 * @param {Object} data - { name, category, price, stock }
 * @returns {Object} created product
 * @throws {Error} on validation failure
 */
const createProduct = (data) => {
  const { name, category, price, stock = 0 } = data;

  if (!name || !category || price === undefined) {
    throw new Error('Name, category, and price are required');
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a non-negative number');
  }

  if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    throw new Error('Stock must be a non-negative integer');
  }

  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    category,
    price: Math.round(price * 100) / 100,
    stock,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  return newProduct;
};

/**
 * Update a product
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null}
 */
const updateProduct = (id, updates) => {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const { name, category, price, stock } = updates;

  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    throw new Error('Price must be a non-negative number');
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
    throw new Error('Stock must be a non-negative integer');
  }

  products[index] = {
    ...products[index],
    ...(name && { name: name.trim() }),
    ...(category && { category }),
    ...(price !== undefined && { price: Math.round(price * 100) / 100 }),
    ...(stock !== undefined && { stock }),
    updatedAt: new Date().toISOString(),
  };

  return products[index];
};

/**
 * Delete a product
 * @param {string} id
 * @returns {boolean}
 */
const deleteProduct = (id) => {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};

/**
 * Get product statistics
 * @returns {Object} stats
 */
const getProductStats = () => {
  const total = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const avgPrice = total > 0
    ? Math.round((products.reduce((sum, p) => sum + p.price, 0) / total) * 100) / 100
    : 0;
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return { total, totalStock, avgPrice, byCategory };
};

/**
 * Reset the data store (used in tests)
 */
const resetProducts = () => {
  products = [
    { id: '1', name: 'Laptop Pro 15', category: 'electronics', price: 1299.99, stock: 50, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: '2', name: 'Wireless Mouse', category: 'electronics', price: 29.99, stock: 200, createdAt: '2024-01-02T00:00:00.000Z' },
    { id: '3', name: 'Standing Desk', category: 'furniture', price: 499.99, stock: 30, createdAt: '2024-01-03T00:00:00.000Z' },
    { id: '4', name: 'Office Chair', category: 'furniture', price: 349.99, stock: 45, createdAt: '2024-01-04T00:00:00.000Z' },
  ];
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  resetProducts,
  VALID_CATEGORIES,
};
