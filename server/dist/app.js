import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyEnv from '@fastify/env';
import fastifyStatic from '@fastify/static';
import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fastifyJwt from '@fastify/jwt';
import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';
import { sanitizeNoSQLInject } from './middleware/nosqlSanitize.js';
import { authRoutes } from './routes/authRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { studentRoutes } from './routes/studentRoutes.js';
import { publicRoutes } from './routes/publicRoutes.js';
import { superadminRoutes } from './routes/superadminRoutes.js';
import { getActiveSocketsCount } from './socket.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function buildApp() {
    // Task 1 & 4: Configure Pino logger and Correlation ID generator
    const fastify = Fastify({
        logger: env.NODE_ENV === 'development'
            ? {
                level: process.env.LOG_LEVEL || 'info',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                },
            }
            : {
                level: process.env.LOG_LEVEL || 'info',
            },
        genReqId: (req) => {
            const existingId = req.headers['x-correlation-id'] ||
                req.headers['x-request-id'];
            return existingId || crypto.randomUUID();
        },
        requestIdHeader: 'x-correlation-id',
        requestIdLogLabel: 'correlationId',
    });
    // Task 4: Add correlation ID header to every HTTP response
    fastify.addHook('onRequest', async (request, reply) => {
        reply.header('x-correlation-id', request.id);
    });
    // Fastify Env validation plugin
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
    // Register Helmet for Secure HTTP Headers
    fastify.register(helmet, {
        contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    });
    // Register Fastify JWT plugin
    fastify.register(fastifyJwt, {
        secret: env.JWT_SECRET,
    });
    // Global Rate Limit (100 requests / minute)
    fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        errorResponseBuilder: (request, context) => ({
            status: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Maximum ${context.max} requests per ${context.after} allowed.`,
            correlationId: request.id,
            date: new Date().toISOString(),
        }),
    });
    // Global NoSQL Injection Sanitization preHandler hook
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
    // Task 2: Setup Centralized Error Handler
    setupErrorHandler(fastify);
    // Task 3: Health check endpoint (/healthz) for load balancers & uptime monitors
    fastify.get('/healthz', async (request, reply) => {
        const mongoState = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const isDbConnected = mongoState === 1;
        const mongoStateMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        const healthStatus = {
            status: isDbConnected ? 'ok' : 'degraded',
            activeSockets: getActiveSocketsCount(),
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            correlationId: request.id,
            services: {
                api: 'healthy',
                database: mongoStateMap[mongoState] || 'unknown',
            },
        };
        if (!isDbConnected) {
            return reply.status(503).send(healthStatus);
        }
        return reply.status(200).send(healthStatus);
    });
    // Legacy /health endpoint
    fastify.get('/health', async (request, reply) => {
        const mongoState = mongoose.connection.readyState;
        const isDbConnected = mongoState === 1;
        return reply.status(isDbConnected ? 200 : 503).send({
            status: isDbConnected ? 'ok' : 'degraded',
            service: 'Code With Curious (CWC) Season 4 Backend',
            theme: '🎪 Carnival Coding Extravaganza',
            timestamp: new Date().toISOString(),
            correlationId: request.id,
            database: isDbConnected ? 'connected' : 'disconnected',
        });
    });
    // Base API route greeting
    fastify.get('/api/v1', async (request) => {
        return {
            message: 'Welcome to CWC Season 4 Carnival API 🎪🏆',
            healthz: '/healthz',
            version: '1.0.0',
            correlationId: request.id,
        };
    });
    // Public Grand Finale status route
    fastify.get('/api/v1/settings/grand-finale', async () => {
        const { Setting } = await import('./models/Setting.js');
        let settingDoc = await Setting.findOne({ key: 'isGrandFinale' });
        return { isGrandFinale: Boolean(settingDoc?.value) };
    });
    // Register Route Plugins
    fastify.register(publicRoutes, { prefix: '/api/v1/public' });
    fastify.register(publicRoutes, { prefix: '/api/v1' });
    fastify.register(publicRoutes, { prefix: '/api' });
    fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(adminRoutes, { prefix: '/api/v1/admin' });
    fastify.register(adminRoutes, { prefix: '/api/admin' });
    fastify.register(superadminRoutes, { prefix: '/api/v1/superadmin' });
    fastify.register(superadminRoutes, { prefix: '/api/superadmin' });
    fastify.register(studentRoutes, { prefix: '/api/v1/student' });
    fastify.register(studentRoutes, { prefix: '/api/student' });
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
                reply.status(404).send({
                    status: 404,
                    error: 'Not Found',
                    message: 'API route not found',
                    correlationId: request.id,
                });
            }
            else {
                reply.sendFile('index.html');
            }
        });
    }
    return fastify;
}
