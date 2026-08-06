import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Populate fallback aliases so either MONGO_URI or MONGODB_URI satisfies the requirement
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const rawEnv = {
    ...process.env,
    MONGO_URI: mongoUri,
    MONGODB_URI: mongoUri,
};
const envSchema = z.object({
    PORT: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z
        .number({
        required_error: 'PORT environment variable is required and missing',
        invalid_type_error: 'PORT must be a valid number',
    })
        .min(1)
        .max(65535)),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGO_URI: z
        .string({
        required_error: 'MONGO_URI (or MONGODB_URI) environment variable is required and missing',
    })
        .min(1, 'MONGO_URI (or MONGODB_URI) cannot be empty'),
    MONGODB_URI: z
        .string({
        required_error: 'MONGODB_URI (or MONGO_URI) environment variable is required and missing',
    })
        .min(1, 'MONGODB_URI (or MONGO_URI) cannot be empty'),
    JWT_SECRET: z
        .string({
        required_error: 'JWT_SECRET environment variable is required and missing',
    })
        .min(1, 'JWT_SECRET environment variable cannot be empty'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
    CLOUDINARY_API_KEY: z.string().optional().default(''),
    CLOUDINARY_API_SECRET: z.string().optional().default(''),
    REDIS_URL: z.string().optional().default('redis://127.0.0.1:6379'),
    SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
    SMTP_PORT: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().optional().default(587)),
    SMTP_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(false)),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    SMTP_FROM: z.string().optional().default('CWC Season 4 Carnival <noreply@cwcseason4.com>'),
});
const _env = envSchema.safeParse(rawEnv);
if (!_env.success) {
    process.stderr.write(JSON.stringify({
        level: 'error',
        time: new Date().toISOString(),
        msg: '❌ FATAL: Environment Variable Validation Failed!',
        errors: _env.error.format(),
    }) + '\n');
    // Crash server process immediately on startup if missing required env vars
    process.exit(1);
}
export const env = _env.data;
