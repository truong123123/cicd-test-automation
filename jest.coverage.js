const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
