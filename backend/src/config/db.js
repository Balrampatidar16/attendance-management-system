import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

export const connectDB = async () => {
  const conn = await mongoose.connect(env.MONGO_URI);
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};
