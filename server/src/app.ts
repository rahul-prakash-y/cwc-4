import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { studentRoutes } from './routes/studentRoutes.js';

export function buildApp(): FastifyInstance {
  const fastify = Fastify({
    logger:
      env.NODE_ENV === 'development'
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

  return fastify;
}
