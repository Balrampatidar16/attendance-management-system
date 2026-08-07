import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import logger from './logger.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        next(new Error('Authentication required'));
        return;
      }
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded._id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Per-user room — createNotification() emits to this room so only that user's
    // browser tabs receive the event, without the server needing a client registry.
    socket.join(String(socket.userId));
    logger.info(`Socket connected: user ${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => io;
