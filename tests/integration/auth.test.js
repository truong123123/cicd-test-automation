const request = require('supertest');
const app = require('../../src/app');
const userService = require('../../src/services/userService');

beforeEach(() => {
  userService.resetUsers();
});

describe('Auth API - POST /api/auth/login', () => {
  test('should return 200 and a token for valid credentials', async () => {
    const payload = {
      email: 'alice@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('should return 401 for incorrect password', async () => {
    const payload = {
      email: 'alice@example.com',
      password: 'wrongpassword',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password');
    expect(res.body).not.toHaveProperty('token');
  });

  test('should return 401 for non-existent user email', async () => {
    const payload = {
      email: 'nobody@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('should return 400 if email is missing', async () => {
    const payload = {
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/email and password are required/i);
  });

  test('should return 400 if password is missing', async () => {
    const payload = {
      email: 'alice@example.com',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/email and password are required/i);
  });

  test('should verify login for newly created users', async () => {
    // 1. Create a user with a custom password
    const newUserPayload = {
      name: 'Custom User',
      email: 'custom@example.com',
      password: 'custompassword123',
    };

    await request(app)
      .post('/api/users')
      .send(newUserPayload);

    // 2. Try to login with the custom password
    const loginPayload = {
      email: 'custom@example.com',
      password: 'custompassword123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe('Custom User');
  });
});
