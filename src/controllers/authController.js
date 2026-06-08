const userService = require('../services/userService');

/**
 * POST /api/auth/login
 */
const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = userService.verifyPassword(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate a mock JWT for testing purposes
    const mockToken = `mock_jwt_token_for_${user.id}_${Buffer.from(user.email).toString('base64')}`;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: mockToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
