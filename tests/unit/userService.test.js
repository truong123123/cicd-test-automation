const userService = require('../../src/services/userService');

// Reset store before each test to ensure isolation
beforeEach(() => {
  userService.resetUsers();
});

describe('UserService - getAllUsers', () => {
  test('should return all users', () => {
    const users = userService.getAllUsers();
    expect(users).toHaveLength(3);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('role');
  });

  test('should return a copy, not the original array', () => {
    const users1 = userService.getAllUsers();
    const users2 = userService.getAllUsers();
    expect(users1).not.toBe(users2);
  });
});

describe('UserService - getUserById', () => {
  test('should return user with existing id', () => {
    const user = userService.getUserById('1');
    expect(user).not.toBeNull();
    expect(user.id).toBe('1');
    expect(user.name).toBe('Alice Johnson');
  });

  test('should return null for non-existent id', () => {
    const user = userService.getUserById('999');
    expect(user).toBeNull();
  });
});

describe('UserService - getUserByEmail', () => {
  test('should return user by email', () => {
    const user = userService.getUserByEmail('alice@example.com');
    expect(user).not.toBeNull();
    expect(user.name).toBe('Alice Johnson');
  });

  test('should return null for non-existent email', () => {
    const user = userService.getUserByEmail('nobody@example.com');
    expect(user).toBeNull();
  });
});

describe('UserService - createUser', () => {
  test('should create a new user with valid data', () => {
    const data = { name: 'Dave Wilson', email: 'dave@example.com', role: 'user' };
    const user = userService.createUser(data);

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Dave Wilson');
    expect(user.email).toBe('dave@example.com');
    expect(user.role).toBe('user');
    expect(user).toHaveProperty('createdAt');
  });

  test('should default role to "user" if not provided', () => {
    const user = userService.createUser({ name: 'Eve', email: 'eve@example.com' });
    expect(user.role).toBe('user');
  });

  test('should create admin role', () => {
    const user = userService.createUser({ name: 'Admin User', email: 'admin2@example.com', role: 'admin' });
    expect(user.role).toBe('admin');
  });

  test('should throw if name is missing', () => {
    expect(() => userService.createUser({ email: 'test@example.com' })).toThrow('Name and email are required');
  });

  test('should throw if email is missing', () => {
    expect(() => userService.createUser({ name: 'Test' })).toThrow('Name and email are required');
  });

  test('should throw if email already exists', () => {
    expect(() => userService.createUser({ name: 'Duplicate', email: 'alice@example.com' })).toThrow('Email already exists');
  });

  test('should throw for invalid email format', () => {
    expect(() => userService.createUser({ name: 'Test', email: 'not-an-email' })).toThrow('Invalid email format');
  });

  test('should throw for invalid role', () => {
    expect(() => userService.createUser({ name: 'Test', email: 'test@example.com', role: 'superuser' })).toThrow('Role must be one of');
  });

  test('should trim whitespace from name and email', () => {
    const user = userService.createUser({ name: '  Frank  ', email: '  frank@example.com  ' });
    expect(user.name).toBe('Frank');
    expect(user.email).toBe('frank@example.com');
  });

  test('should persist the new user', () => {
    userService.createUser({ name: 'George', email: 'george@example.com' });
    const all = userService.getAllUsers();
    expect(all).toHaveLength(4);
  });
});

describe('UserService - updateUser', () => {
  test('should update user name', () => {
    const updated = userService.updateUser('1', { name: 'Alice Updated' });
    expect(updated.name).toBe('Alice Updated');
    expect(updated).toHaveProperty('updatedAt');
  });

  test('should return null for non-existent user', () => {
    const result = userService.updateUser('999', { name: 'Ghost' });
    expect(result).toBeNull();
  });

  test('should throw if updating to existing email', () => {
    expect(() => userService.updateUser('1', { email: 'bob@example.com' })).toThrow('Email already exists');
  });

  test('should allow updating email to same value', () => {
    const updated = userService.updateUser('1', { email: 'alice@example.com' });
    expect(updated.email).toBe('alice@example.com');
  });

  test('should throw for invalid email on update', () => {
    expect(() => userService.updateUser('1', { email: 'bad-email' })).toThrow('Invalid email format');
  });

  test('should throw for invalid role on update', () => {
    expect(() => userService.updateUser('1', { role: 'manager' })).toThrow('Role must be one of');
  });
});

describe('UserService - deleteUser', () => {
  test('should delete existing user and return true', () => {
    const result = userService.deleteUser('1');
    expect(result).toBe(true);
    expect(userService.getUserById('1')).toBeNull();
    expect(userService.getAllUsers()).toHaveLength(2);
  });

  test('should return false for non-existent user', () => {
    const result = userService.deleteUser('999');
    expect(result).toBe(false);
  });
});

describe('UserService - resetUsers', () => {
  test('should restore default users after modifications', () => {
    userService.deleteUser('1');
    userService.deleteUser('2');
    userService.resetUsers();
    expect(userService.getAllUsers()).toHaveLength(3);
  });
});

describe('UserService - verifyPassword', () => {
  test('should return user details on valid password', () => {
    const user = userService.verifyPassword('alice@example.com', 'password123');
    expect(user).not.toBeNull();
    expect(user.id).toBe('1');
    expect(user.email).toBe('alice@example.com');
    expect(user).not.toHaveProperty('passwordHash');
  });

  test('should return null on invalid password', () => {
    const user = userService.verifyPassword('alice@example.com', 'wrongpassword');
    expect(user).toBeNull();
  });

  test('should return null if user does not exist', () => {
    const user = userService.verifyPassword('nobody@example.com', 'password123');
    expect(user).toBeNull();
  });

  test('should return null if email or password missing', () => {
    expect(userService.verifyPassword('', 'password123')).toBeNull();
    expect(userService.verifyPassword('alice@example.com', '')).toBeNull();
    expect(userService.verifyPassword(null, null)).toBeNull();
  });

  test('should verify password for newly created user', () => {
    userService.createUser({
      name: 'Tester',
      email: 'tester@example.com',
      password: 'custompassword',
    });
    const user = userService.verifyPassword('tester@example.com', 'custompassword');
    expect(user).not.toBeNull();
    expect(user.name).toBe('Tester');

    const wrong = userService.verifyPassword('tester@example.com', 'password123');
    expect(wrong).toBeNull();
  });
});

