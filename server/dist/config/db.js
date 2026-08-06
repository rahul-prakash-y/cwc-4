import mongoose from 'mongoose';
import { env } from './env.js';
// Global Mongoose hardening against NoSQL injection
mongoose.set('sanitizeFilter', true);
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`🎪 [CWC Season 4] MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
export const disconnectDB = async () => {
    await mongoose.disconnect();
    console.log('🎪 [CWC Season 4] MongoDB Disconnected');
};
