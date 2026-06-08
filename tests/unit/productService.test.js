const productService = require('../../src/services/productService');

beforeEach(() => {
  productService.resetProducts();
});

describe('ProductService - getAllProducts', () => {
  test('should return all products when no filter', () => {
    const products = productService.getAllProducts();
    expect(products).toHaveLength(4);
  });

  test('should filter by category', () => {
    const electronics = productService.getAllProducts('electronics');
    expect(electronics).toHaveLength(2);
    electronics.forEach((p) => expect(p.category).toBe('electronics'));
  });

  test('should return empty array for category with no products', () => {
    const sports = productService.getAllProducts('sports');
    expect(sports).toHaveLength(0);
  });

  test('should return a copy, not the original array', () => {
    const p1 = productService.getAllProducts();
    const p2 = productService.getAllProducts();
    expect(p1).not.toBe(p2);
  });
});

describe('ProductService - getProductById', () => {
  test('should return product with existing id', () => {
    const product = productService.getProductById('1');
    expect(product).not.toBeNull();
    expect(product.name).toBe('Laptop Pro 15');
  });

  test('should return null for non-existent id', () => {
    expect(productService.getProductById('999')).toBeNull();
  });
});

describe('ProductService - createProduct', () => {
  test('should create a valid product', () => {
    const data = { name: 'Keyboard', category: 'electronics', price: 79.99, stock: 100 };
    const product = productService.createProduct(data);
    expect(product).toHaveProperty('id');
    expect(product.name).toBe('Keyboard');
    expect(product.price).toBe(79.99);
    expect(product.stock).toBe(100);
  });

  test('should default stock to 0 if not provided', () => {
    const product = productService.createProduct({ name: 'Book', category: 'books', price: 15.99 });
    expect(product.stock).toBe(0);
  });

  test('should throw if name is missing', () => {
    expect(() => productService.createProduct({ category: 'electronics', price: 10 })).toThrow('required');
  });

  test('should throw if category is missing', () => {
    expect(() => productService.createProduct({ name: 'Test', price: 10 })).toThrow('required');
  });

  test('should throw if price is missing', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'books' })).toThrow('required');
  });

  test('should throw for invalid category', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'invalid', price: 10 }))
      .toThrow('Category must be one of');
  });

  test('should throw for negative price', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'books', price: -5 }))
      .toThrow('Price must be a non-negative number');
  });

  test('should throw for non-number price', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'books', price: 'free' }))
      .toThrow('Price must be a non-negative number');
  });

  test('should throw for non-integer stock', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'books', price: 10, stock: 1.5 }))
      .toThrow('Stock must be a non-negative integer');
  });

  test('should throw for negative stock', () => {
    expect(() => productService.createProduct({ name: 'Test', category: 'books', price: 10, stock: -1 }))
      .toThrow('Stock must be a non-negative integer');
  });

  test('should trim name whitespace', () => {
    const product = productService.createProduct({ name: '  Monitor  ', category: 'electronics', price: 299.99 });
    expect(product.name).toBe('Monitor');
  });

  test('should round price to 2 decimal places', () => {
    const product = productService.createProduct({ name: 'Test', category: 'books', price: 9.999 });
    expect(product.price).toBe(10);
  });
});

describe('ProductService - updateProduct', () => {
  test('should update product name', () => {
    const updated = productService.updateProduct('1', { name: 'Laptop Pro 16' });
    expect(updated.name).toBe('Laptop Pro 16');
    expect(updated).toHaveProperty('updatedAt');
  });

  test('should update product price', () => {
    const updated = productService.updateProduct('1', { price: 999.99 });
    expect(updated.price).toBe(999.99);
  });

  test('should update product stock', () => {
    const updated = productService.updateProduct('1', { stock: 75 });
    expect(updated.stock).toBe(75);
  });

  test('should return null for non-existent product', () => {
    expect(productService.updateProduct('999', { name: 'Ghost' })).toBeNull();
  });

  test('should throw for invalid category on update', () => {
    expect(() => productService.updateProduct('1', { category: 'invalid' })).toThrow('Category must be one of');
  });

  test('should throw for invalid price on update', () => {
    expect(() => productService.updateProduct('1', { price: -10 })).toThrow('Price must be a non-negative number');
  });

  test('should throw for invalid stock on update', () => {
    expect(() => productService.updateProduct('1', { stock: -5 })).toThrow('Stock must be a non-negative integer');
  });
});

describe('ProductService - deleteProduct', () => {
  test('should delete existing product and return true', () => {
    const result = productService.deleteProduct('1');
    expect(result).toBe(true);
    expect(productService.getProductById('1')).toBeNull();
    expect(productService.getAllProducts()).toHaveLength(3);
  });

  test('should return false for non-existent product', () => {
    expect(productService.deleteProduct('999')).toBe(false);
  });
});

describe('ProductService - getProductStats', () => {
  test('should return correct total count', () => {
    const stats = productService.getProductStats();
    expect(stats.total).toBe(4);
  });

  test('should return correct total stock', () => {
    const stats = productService.getProductStats();
    expect(stats.totalStock).toBe(325); // 50 + 200 + 30 + 45
  });

  test('should calculate average price', () => {
    const stats = productService.getProductStats();
    const expectedAvg = Math.round(((1299.99 + 29.99 + 499.99 + 349.99) / 4) * 100) / 100;
    expect(stats.avgPrice).toBe(expectedAvg);
  });

  test('should group products by category', () => {
    const stats = productService.getProductStats();
    expect(stats.byCategory).toHaveProperty('electronics', 2);
    expect(stats.byCategory).toHaveProperty('furniture', 2);
  });

  test('should return zero avg price when no products', () => {
    productService.deleteProduct('1');
    productService.deleteProduct('2');
    productService.deleteProduct('3');
    productService.deleteProduct('4');
    const stats = productService.getProductStats();
    expect(stats.avgPrice).toBe(0);
    expect(stats.total).toBe(0);
  });
});
