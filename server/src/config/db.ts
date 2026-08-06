import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Global Mongoose hardening against NoSQL injection
mongoose.set('sanitizeFilter', true);

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info({ host: conn.connection.host }, `🎪 [CWC Season 4] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error({ err: error }, '❌ MongoDB Connection Error');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('🎪 [CWC Season 4] MongoDB Disconnected');
};

