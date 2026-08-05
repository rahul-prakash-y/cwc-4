"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    HOST: zod_1.z.string().default('0.0.0.0'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/cwc-season-4'),
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    CLIENT_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_KEY: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional().default(''),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
}
exports.env = _env.data;
