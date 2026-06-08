/**
 * E2E Tests - Full API workflow scenarios
 *
 * These tests simulate real-world usage flows:
 * - Complete CRUD lifecycle
 * - Cross-resource interactions
 * - System health checks
 * - Error recovery scenarios
 */
const request = require('supertest');
const app = require('../../src/app');
const userService = require('../../src/services/userService');
const productService = require('../../src/services/productService');

beforeEach(() => {
  userService.resetUsers();
  productService.resetProducts();
});

describe('E2E - Health Check', () => {
  test('GET /health should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });
});

describe('E2E - 404 Route Handling', () => {
  test('unknown route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});

describe('E2E - Full User Lifecycle', () => {
  test('create → read → update → delete user', async () => {
    // 1. Create
    const createRes = await request(app)
      .post('/api/users')
      .send({ name: 'E2E User', email: 'e2e@test.com', role: 'user' });
    expect(createRes.status).toBe(201);
    const userId = createRes.body.data.id;

    // 2. Read
    const readRes = await request(app).get(`/api/users/${userId}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.name).toBe('E2E User');

    // 3. Appears in list
    const listRes = await request(app).get('/api/users');
    expect(listRes.body.count).toBe(4); // 3 seed + 1 new

    // 4. Update
    const updateRes = await request(app)
      .put(`/api/users/${userId}`)
      .send({ name: 'E2E User Updated', role: 'admin' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('E2E User Updated');
    expect(updateRes.body.data.role).toBe('admin');

    // 5. Delete
    const deleteRes = await request(app).delete(`/api/users/${userId}`);
    expect(deleteRes.status).toBe(200);

    // 6. Verify gone
    const verifyRes = await request(app).get(`/api/users/${userId}`);
    expect(verifyRes.status).toBe(404);

    // 7. Back to original count
    const finalList = await request(app).get('/api/users');
    expect(finalList.body.count).toBe(3);
  });
});

describe('E2E - Full Product Lifecycle', () => {
  test('create → filter → stats → update → delete product', async () => {
    // 1. Create a new product
    const createRes = await request(app)
      .post('/api/products')
      .send({ name: 'E2E Headphones', category: 'electronics', price: 199.99, stock: 75 });
    expect(createRes.status).toBe(201);
    const productId = createRes.body.data.id;

    // 2. Filter by category
    const filterRes = await request(app).get('/api/products?category=electronics');
    expect(filterRes.body.count).toBe(3); // 2 seed + 1 new

    // 3. Check stats updated
    const statsRes = await request(app).get('/api/products/stats');
    expect(statsRes.body.data.total).toBe(5);
    expect(statsRes.body.data.byCategory.electronics).toBe(3);

    // 4. Update price and stock
    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .send({ price: 179.99, stock: 50 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.price).toBe(179.99);

    // 5. Delete
    await request(app).delete(`/api/products/${productId}`);

    // 6. Verify gone and stats restored
    const finalStats = await request(app).get('/api/products/stats');
    expect(finalStats.body.data.total).toBe(4);
  });
});

describe('E2E - Error Scenarios', () => {
  test('should reject creating user with invalid data gracefully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '', email: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('error');
  });

  test('should reject malformed JSON gracefully', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect(res.status).toBe(400);
  });

  test('should prevent creating product with invalid price', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Invalid', category: 'books', price: 'free' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });
});

describe('E2E - Concurrent Operations', () => {
  test('multiple creates should all succeed independently', async () => {
    const creates = [
      request(app).post('/api/users').send({ name: 'User A', email: 'usera@test.com' }),
      request(app).post('/api/users').send({ name: 'User B', email: 'userb@test.com' }),
      request(app).post('/api/users').send({ name: 'User C', email: 'userc@test.com' }),
    ];

    const results = await Promise.all(creates);
    results.forEach((res) => expect(res.status).toBe(201));

    const listRes = await request(app).get('/api/users');
    expect(listRes.body.count).toBe(6); // 3 seed + 3 new
  });
});

describe('E2E - Authentication Flow', () => {
  test('should register a new user → login → get user profile', async () => {
    const userPayload = {
      name: 'Auth E2E User',
      email: 'auth_e2e@example.com',
      password: 'mypassword123',
    };

    // 1. Register
    const registerRes = await request(app)
      .post('/api/users')
      .send(userPayload);
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.email).toBe('auth_e2e@example.com');

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'auth_e2e@example.com',
        password: 'mypassword123',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.name).toBe('Auth E2E User');

    // 3. Login with wrong password should fail
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'auth_e2e@example.com',
        password: 'wrongpassword',
      });
    expect(badLoginRes.status).toBe(401);
    expect(badLoginRes.body.success).toBe(false);
  });
});

