"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const env_js_1 = require("./config/env.js");
const errorHandler_js_1 = require("./plugins/errorHandler.js");
const authRoutes_js_1 = require("./routes/authRoutes.js");
const adminRoutes_js_1 = require("./routes/adminRoutes.js");
const studentRoutes_js_1 = require("./routes/studentRoutes.js");
function buildApp() {
    const fastify = (0, fastify_1.default)({
        logger: env_js_1.env.NODE_ENV === 'development'
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
    // Register CORS
    fastify.register(cors_1.default, {
        origin: env_js_1.env.CLIENT_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    // Register Multipart for Cloudinary Uploads
    fastify.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB file size limit
        },
    });
    // Setup Error Handler
    (0, errorHandler_js_1.setupErrorHandler)(fastify);
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
    // Register Route Plugins
    fastify.register(authRoutes_js_1.authRoutes, { prefix: '/api/v1/auth' });
    fastify.register(adminRoutes_js_1.adminRoutes, { prefix: '/api/v1/admin' });
    fastify.register(studentRoutes_js_1.studentRoutes, { prefix: '/api/v1/student' });
    return fastify;
}
