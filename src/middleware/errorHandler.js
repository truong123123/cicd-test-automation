/**
 * Global error handler middleware
 * Must have 4 parameters to be recognized by Express as error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${statusCode}: ${message}`);
    if (err.stack) {
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
