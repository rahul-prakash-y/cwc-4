import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';

export function buildApp(): FastifyInstance {
  const fastify = Fastify({
    logger: env.NODE_ENV === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    } : true,
  });

  // Task 2: Register CORS
  fastify.register(cors, {
    origin: env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Task 2: Basic Error Handler
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

  return fastify;
}
