const request = require('supertest');
const app = require('../../src/app');
const userService = require('../../src/services/userService');

beforeEach(() => {
  userService.resetUsers();
});

describe('Users API - GET /api/users', () => {
  test('should return 200 with all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(3);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('should return users with correct fields', async () => {
    const res = await request(app).get('/api/users');
    const user = res.body.data[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('createdAt');
  });
});

describe('Users API - GET /api/users/:id', () => {
  test('should return 200 with a specific user', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
    expect(res.body.data.name).toBe('Alice Johnson');
  });

  test('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User not found');
  });
});

describe('Users API - POST /api/users', () => {
  test('should create a new user and return 201', async () => {
    const payload = { name: 'New User', email: 'newuser@example.com', role: 'user' };
    const res = await request(app)
      .post('/api/users')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New User');
    expect(res.body.data.email).toBe('newuser@example.com');
    expect(res.body.data).toHaveProperty('id');
  });

  test('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  test('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'No Email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('should return 400 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Duplicate', email: 'alice@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already exists');
  });

  test('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'not-valid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  test('should return 400 for invalid role', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com', role: 'superuser' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/role/i);
  });
});

describe('Users API - PUT /api/users/:id', () => {
  test('should update user and return 200', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ name: 'Alice Updated' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Updated');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  test('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/999')
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('should return 400 for duplicate email on update', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already exists');
  });
});

describe('Users API - DELETE /api/users/:id', () => {
  test('should delete user and return 200', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User deleted successfully');
  });

  test('should return 404 for non-existent user', async () => {
    const res = await request(app).delete('/api/users/999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('should actually remove user from list', async () => {
    await request(app).delete('/api/users/1');
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(404);
  });
});
