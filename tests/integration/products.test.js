const request = require('supertest');
const app = require('../../src/app');
const productService = require('../../src/services/productService');

beforeEach(() => {
  productService.resetProducts();
});

describe('Products API - GET /api/products', () => {
  test('should return 200 with all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(4);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('should filter by category query param', async () => {
    const res = await request(app).get('/api/products?category=electronics');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    res.body.data.forEach((p) => expect(p.category).toBe('electronics'));
  });

  test('should return empty array for non-matching category', async () => {
    const res = await request(app).get('/api/products?category=sports');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toHaveLength(0);
  });

  test('should return products with correct fields', async () => {
    const res = await request(app).get('/api/products');
    const product = res.body.data[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('stock');
  });
});

describe('Products API - GET /api/products/stats', () => {
  test('should return product statistics', async () => {
    const res = await request(app).get('/api/products/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total', 4);
    expect(res.body.data).toHaveProperty('totalStock');
    expect(res.body.data).toHaveProperty('avgPrice');
    expect(res.body.data).toHaveProperty('byCategory');
  });

  test('should correctly count by category', async () => {
    const res = await request(app).get('/api/products/stats');
    expect(res.body.data.byCategory).toHaveProperty('electronics', 2);
    expect(res.body.data.byCategory).toHaveProperty('furniture', 2);
  });
});

describe('Products API - GET /api/products/:id', () => {
  test('should return 200 with a specific product', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Laptop Pro 15');
  });

  test('should return 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});

describe('Products API - POST /api/products', () => {
  test('should create a new product and return 201', async () => {
    const payload = { name: 'USB Hub', category: 'electronics', price: 49.99, stock: 150 };
    const res = await request(app).post('/api/products').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('USB Hub');
    expect(res.body.data).toHaveProperty('id');
  });

  test('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/products').send({ name: 'No Category' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('should return 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test', category: 'invalid', price: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/category/i);
  });

  test('should return 400 for negative price', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test', category: 'books', price: -5 });
    expect(res.status).toBe(400);
  });
});

describe('Products API - PUT /api/products/:id', () => {
  test('should update product and return 200', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: 1099.99, stock: 40 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(1099.99);
    expect(res.body.data.stock).toBe(40);
  });

  test('should return 404 for non-existent product', async () => {
    const res = await request(app).put('/api/products/999').send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('should return 400 for invalid update values', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ category: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('Products API - DELETE /api/products/:id', () => {
  test('should delete product and return 200', async () => {
    const res = await request(app).delete('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted successfully');
  });

  test('should return 404 for non-existent product', async () => {
    const res = await request(app).delete('/api/products/999');
    expect(res.status).toBe(404);
  });

  test('stats should update after delete', async () => {
    await request(app).delete('/api/products/1');
    const res = await request(app).get('/api/products/stats');
    expect(res.body.data.total).toBe(3);
  });
});
