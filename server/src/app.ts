import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyEnv from "@fastify/env";
import fastifyStatic from "@fastify/static";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env.js";
import { setupErrorHandler } from "./plugins/errorHandler.js";
import { sanitizeNoSQLInject } from "./middleware/nosqlSanitize.js";
import { authRoutes } from "./routes/authRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { studentRoutes } from "./routes/studentRoutes.js";
import { publicRoutes } from "./routes/publicRoutes.js";
import { superadminRoutes } from "./routes/superadminRoutes.js";
import { settingsRoutes } from "./routes/settings.js";
import { getActiveSocketsCount } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildApp(): FastifyInstance {
  // Task 1 & 4: Configure Pino logger, trustProxy for Anti-DDoS real IP capture, and Correlation ID generator
  const fastify = Fastify({
    trustProxy: true,
    logger:
      env.NODE_ENV === "development"
        ? {
            level: process.env.LOG_LEVEL || "info",
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }
        : {
            level: process.env.LOG_LEVEL || "info",
          },
    genReqId: (req) => {
      const existingId =
        (req.headers["x-correlation-id"] as string) ||
        (req.headers["x-request-id"] as string);
      return existingId || crypto.randomUUID();
    },
    requestIdHeader: "x-correlation-id",
    requestIdLogLabel: "correlationId",
  });

  // Task 4: Add correlation ID header to every HTTP response
  fastify.addHook("onRequest", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });

  // Fastify Env validation plugin
  fastify.register(fastifyEnv, {
    confKey: "config",
    schema: {
      type: "object",
      required: ["PORT", "JWT_SECRET", "MONGO_URI"],
      properties: {
        PORT: { type: "number" },
        HOST: { type: "string" },
        NODE_ENV: { type: "string" },
        MONGO_URI: { type: "string" },
        MONGODB_URI: { type: "string" },
        JWT_SECRET: { type: "string" },
        CLIENT_ORIGIN: { type: "string" },
      },
    },
    data: env,
  });

  // Register Helmet for Secure HTTP Headers
  // Register Helmet for Secure HTTP Headers
  fastify.register(helmet, {
    contentSecurityPolicy:
      env.NODE_ENV === "production"
        ? {
            useDefaults: true,
            directives: {
              // Override the default img-src to include your external domains
              "img-src": [
                "'self'",
                "data:",
                "https://res.cloudinary.com",
                "https://images.unsplash.com",
              ],
            },
          }
        : false, // Disables CSP completely in development
  });

  // Register Fastify JWT plugin
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  // Register Fastify Cookie plugin
  fastify.register(fastifyCookie, {
    secret: env.JWT_SECRET,
    hook: "onRequest",
  });

  // Global Rate Limit (500 requests / 5 minutes per IP)
  fastify.register(rateLimit, {
    max: 500,
    timeWindow: "5 minutes",
    errorResponseBuilder: (request, context) => ({
      status: 429,
      error: "Too Many Requests",
      message: `Global Anti-DDoS Rate Limit Exceeded. Maximum ${context.max} requests per ${context.after} allowed.`,
      correlationId: request.id as string,
      date: new Date().toISOString(),
    }),
  });

  // Global NoSQL Injection Sanitization preHandler hook
  fastify.addHook("preHandler", sanitizeNoSQLInject);

  // Register CORS (supporting cookies with credentials)
  fastify.register(cors, {
    origin: (origin, cb) => {
      if (
        !origin ||
        env.CLIENT_ORIGIN === "*" ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        cb(null, true);
        return;
      }
      if (env.CLIENT_ORIGIN && origin === env.CLIENT_ORIGIN) {
        cb(null, true);
        return;
      }
      cb(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
  fastify.get("/healthz", async (request, reply) => {
    const mongoState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isDbConnected = mongoState === 1;
    const mongoStateMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const healthStatus = {
      status: isDbConnected ? "ok" : "degraded",
      activeSockets: getActiveSocketsCount(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      correlationId: request.id,
      services: {
        api: "healthy",
        database: mongoStateMap[mongoState] || "unknown",
      },
    };

    if (!isDbConnected) {
      return reply.status(503).send(healthStatus);
    }
    return reply.status(200).send(healthStatus);
  });

  // Legacy /health endpoint
  fastify.get("/health", async (request, reply) => {
    const mongoState = mongoose.connection.readyState;
    const isDbConnected = mongoState === 1;
    return reply.status(isDbConnected ? 200 : 503).send({
      status: isDbConnected ? "ok" : "degraded",
      service: "Code With Curious (CWC) Season 4 Backend",
      theme: "🎪 Carnival Coding Extravaganza",
      timestamp: new Date().toISOString(),
      correlationId: request.id,
      database: isDbConnected ? "connected" : "disconnected",
    });
  });

  // Base API route greeting
  fastify.get("/api/v1", async (request) => {
    return {
      message: "Welcome to CWC Season 4 Carnival API 🎪🏆",
      healthz: "/healthz",
      version: "1.0.0",
      correlationId: request.id,
    };
  });

  // Public Grand Finale status route (No auth required)
  const getFinaleStatusHandler = async () => {
    try {
      const { Setting } = await import("./models/Setting.js");
      const { Settings } = await import("./models/Settings.js");

      let settingDoc = await Setting.findOne({ key: "isGrandFinale" });
      let isGrandFinale = false;

      if (settingDoc !== null && settingDoc !== undefined) {
        isGrandFinale = Boolean(settingDoc.value);
      } else {
        const settingsDoc = await Settings.findOne();
        isGrandFinale = Boolean(settingsDoc?.isGrandFinale);
      }

      return {
        success: true,
        isGrandFinale,
        data: { isGrandFinale },
      };
    } catch {
      return {
        success: true,
        isGrandFinale: false,
        data: { isGrandFinale: false },
      };
    }
  };

  fastify.get("/api/v1/settings/grand-finale", getFinaleStatusHandler);
  fastify.get("/api/settings/grand-finale", getFinaleStatusHandler);
  fastify.get("/api/public/settings/finale", getFinaleStatusHandler);

  // Register Route Plugins
  fastify.register(publicRoutes, { prefix: "/api/v1/public" });
  fastify.register(publicRoutes, { prefix: "/api/public" });
  fastify.register(publicRoutes, { prefix: "/api/v1" });
  fastify.register(publicRoutes, { prefix: "/api" });
  fastify.register(authRoutes, { prefix: "/api/v1/auth" });
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(adminRoutes, { prefix: "/api/v1/admin" });
  fastify.register(adminRoutes, { prefix: "/api/admin" });
  fastify.register(superadminRoutes, { prefix: "/api/v1/superadmin" });
  fastify.register(superadminRoutes, { prefix: "/api/superadmin" });
  fastify.register(studentRoutes, { prefix: "/api/v1/student" });
  fastify.register(studentRoutes, { prefix: "/api/student" });
  fastify.register(settingsRoutes, { prefix: "/api/v1/settings" });
  fastify.register(settingsRoutes, { prefix: "/api/settings" });

  // Serve Frontend Static Files in Production (Render)
  const clientDistPath = path.resolve(__dirname, "../../client/dist");
  if (fs.existsSync(clientDistPath)) {
    fastify.register(fastifyStatic, {
      root: clientDistPath,
      prefix: "/",
      wildcard: false,
    });

    // SPA Routing Fallback: send index.html for non-API requests
    fastify.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith("/api")) {
        reply.status(404).send({
          status: 404,
          error: "Not Found",
          message: "API route not found",
          correlationId: request.id as string,
        });
      } else {
        reply.sendFile("index.html");
      }
    });
  }

  return fastify;
}
