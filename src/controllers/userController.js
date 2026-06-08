const userService = require('../services/userService');

/**
 * GET /api/users
 */
const getAll = (req, res, next) => {
  try {
    const users = userService.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 */
const getById = (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users
 */
const create = (req, res, next) => {
  try {
    const user = userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.message === 'Email already exists' || err.message.includes('required') || err.message.includes('Invalid') || err.message.includes('Role')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * PUT /api/users/:id
 */
const update = (req, res, next) => {
  try {
    const user = userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err.message.includes('Email') || err.message.includes('Invalid') || err.message.includes('Role')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 */
const remove = (req, res, next) => {
  try {
    const deleted = userService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
