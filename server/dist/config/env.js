import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().default('mongodb://localhost:27017/cwc-season-4'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
    CLOUDINARY_API_KEY: z.string().optional().default(''),
    CLOUDINARY_API_SECRET: z.string().optional().default(''),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
}
export const env = _env.data;
