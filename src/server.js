const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  // eslint-disable-next-line no-console
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server;
