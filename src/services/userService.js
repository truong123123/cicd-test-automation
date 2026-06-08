const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Hash a password using SHA-256
 * @param {string} password
 * @returns {string} hashed password
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Seed users with default password 'password123'
const DEFAULT_PASSWORD_HASH = hashPassword('password123');

// In-memory data store
let users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-02T00:00:00.000Z' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-03T00:00:00.000Z' },
];

/**
 * Get all users
 * @returns {Array} list of users
 */
const getAllUsers = () => {
  // Exclude passwordHash from returned objects for security
  return users.map(({ passwordHash: _, ...user }) => user);
};

/**
 * Get user by ID
 * @param {string} id
 * @returns {Object|null} user or null
 */
const getUserById = (id) => {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by email (internal method, includes passwordHash)
 * @param {string} email
 * @returns {Object|null} user or null
 */
const getUserByEmailInternal = (email) => {
  return users.find((u) => u.email === email) || null;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Object|null} user or null
 */
const getUserByEmail = (email) => {
  const user = getUserByEmailInternal(email);
  if (!user) return null;
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Create a new user
 * @param {Object} data - { name, email, role, password }
 * @returns {Object} created user
 * @throws {Error} if email already exists or required fields missing
 */
const createUser = (data) => {
  const name = data.name ? data.name.trim() : data.name;
  const email = data.email ? data.email.trim().toLowerCase() : data.email;
  const role = data.role || 'user';
  const password = data.password || 'password123'; // Default fallback password

  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  if (getUserByEmailInternal(email)) {
    throw new Error('Email already exists');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const validRoles = ['admin', 'user'];
  if (!validRoles.includes(role)) {
    throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Update a user
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} updated user or null
 */
const updateUser = (id, updates) => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const { name, email, role, password } = updates;

  if (email && email !== users[index].email) {
    if (getUserByEmailInternal(email)) {
      throw new Error('Email already exists');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  if (role) {
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(role)) {
      throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
    }
  }

  users[index] = {
    ...users[index],
    ...(name && { name: name.trim() }),
    ...(email && { email: email.trim().toLowerCase() }),
    ...(role && { role }),
    ...(password && { passwordHash: hashPassword(password) }),
    updatedAt: new Date().toISOString(),
  };

  const { passwordHash: _, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
};

/**
 * Delete a user
 * @param {string} id
 * @returns {boolean} true if deleted, false if not found
 */
const deleteUser = (id) => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};

/**
 * Verify a user's password
 * @param {string} email
 * @param {string} password
 * @returns {Object|null} User details without password if verified, else null
 */
const verifyPassword = (email, password) => {
  if (!email || !password) return null;
  const user = getUserByEmailInternal(email.trim().toLowerCase());
  if (!user) return null;

  const inputHash = hashPassword(password);
  if (user.passwordHash === inputHash) {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

/**
 * Reset the data store (used in tests)
 */
const resetUsers = () => {
  users = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-02T00:00:00.000Z' },
    { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user', passwordHash: DEFAULT_PASSWORD_HASH, createdAt: '2024-01-03T00:00:00.000Z' },
  ];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  verifyPassword,
  resetUsers,
};

