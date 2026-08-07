import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import logger from './src/config/logger.js';
import { initSocket } from './src/config/socket.js';

let server;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    // winston's file transports write asynchronously — exit only once the log has actually flushed,
    // otherwise the fatal reason never makes it into the log files.
    logger.error(`MongoDB connection failed: ${error.message}`, () => process.exit(1));
    return;
  }

  server = app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  initSocket(server);
};

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`, () => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`, () => process.exit(1));
});

startServer();
