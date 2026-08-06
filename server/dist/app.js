import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyEnv from '@fastify/env';
import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';
import { sanitizeNoSQLInject } from './middleware/nosqlSanitize.js';
import { authRoutes } from './routes/authRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { studentRoutes } from './routes/studentRoutes.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function buildApp() {
    const fastify = Fastify({
        logger: env.NODE_ENV === 'development'
            ? {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                },
            }
            : true,
    });
    // Task 3: Fastify Env validation plugin
    fastify.register(fastifyEnv, {
        confKey: 'config',
        schema: {
            type: 'object',
            required: ['PORT', 'JWT_SECRET', 'MONGO_URI'],
            properties: {
                PORT: { type: 'number' },
                HOST: { type: 'string' },
                NODE_ENV: { type: 'string' },
                MONGO_URI: { type: 'string' },
                MONGODB_URI: { type: 'string' },
                JWT_SECRET: { type: 'string' },
                CLIENT_ORIGIN: { type: 'string' },
            },
        },
        data: env,
    });
    // Task 1: Register Helmet for Secure HTTP Headers
    fastify.register(helmet, {
        contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    });
    // Task 2: Global Rate Limit (100 requests / minute)
    fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        errorResponseBuilder: (_request, context) => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Maximum ${context.max} requests per ${context.after} allowed.`,
            date: new Date().toISOString(),
        }),
    });
    // Task 4: Global NoSQL Injection Sanitization preHandler hook
    fastify.addHook('preHandler', sanitizeNoSQLInject);
    // Register CORS
    fastify.register(cors, {
        origin: env.CLIENT_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    // Register Multipart for Cloudinary Uploads
    fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB file size limit
        },
    });
    // Setup Error Handler
    setupErrorHandler(fastify);
    // Health check route
    fastify.get('/health', async () => {
        return {
            status: 'ok',
            service: 'Code With Curious (CWC) Season 4 Backend',
            theme: '🎪 Carnival Coding Extravaganza',
            timestamp: new Date().toISOString(),
        };
    });
    // Base API route greeting
    fastify.get('/api/v1', async () => {
        return {
            message: 'Welcome to CWC Season 4 Carnival API 🎪🏆',
            docs: '/api/v1/health',
            version: '1.0.0',
        };
    });
    // Public Grand Finale status route
    fastify.get('/api/v1/settings/grand-finale', async () => {
        const { Setting } = await import('./models/Setting.js');
        let settingDoc = await Setting.findOne({ key: 'isGrandFinale' });
        return { isGrandFinale: Boolean(settingDoc?.value) };
    });
    // Register Route Plugins
    fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    fastify.register(adminRoutes, { prefix: '/api/v1/admin' });
    fastify.register(studentRoutes, { prefix: '/api/v1/student' });
    // Serve Frontend Static Files in Production (Render)
    const clientDistPath = path.resolve(__dirname, '../../client/dist');
    if (fs.existsSync(clientDistPath)) {
        fastify.register(fastifyStatic, {
            root: clientDistPath,
            prefix: '/',
            wildcard: false,
        });
        // SPA Routing Fallback: send index.html for non-API requests
        fastify.setNotFoundHandler((request, reply) => {
            if (request.raw.url?.startsWith('/api')) {
                reply.status(404).send({ error: 'API route not found' });
            }
            else {
                reply.sendFile('index.html');
            }
        });
    }
    return fastify;
}
