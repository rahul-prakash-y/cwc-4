import { FastifyRequest, FastifyReply } from 'fastify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
  sessionVersion?: number;
  isFirstLogin?: boolean;
  teamId?: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload;
    user: UserPayload;
  }
}

/**
 * Helper to generate JWT token for authenticated users
 */
export function generateToken(payload: UserPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * PreHandler Middleware to verify JWT token and enforce Single Device Login
 */
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    let token: string | undefined = request.cookies?.token;

    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication token missing or malformed',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;

    // Single Device Login enforcement: fetch user from DB and compare sessionVersion
    const dbUser = await User.findById(decoded.userId).lean();
    if (!dbUser) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User account not found',
      });
    }

    if (dbUser.isBlocked) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Account has been blocked by SuperAdmin',
      });
    }

    const expectedVersion = dbUser.sessionVersion ?? 0;
    const tokenVersion = decoded.sessionVersion ?? 0;

    if (tokenVersion !== expectedVersion) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session expired or logged in from another device',
      });
    }

    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token',
    });
  }
}

export const authenticate = verifyJWT;

/**
 * PreHandler Middleware to check for Admin OR SuperAdmin role
 */
export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (request.user.role !== 'admin' && request.user.role !== 'superadmin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Access denied: Admin or SuperAdmin privileges required',
    });
  }
}

/**
 * PreHandler Middleware strictly for SuperAdmin role
 */
export async function isSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (request.user.role !== 'superadmin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Access denied: SuperAdmin privileges required',
    });
  }
}

/**
 * PreHandler Middleware to check for Student role
 */
export async function isStudent(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (request.user.role !== 'student') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Access denied: Student privileges required',
    });
  }
}

/**
 * Audit Log Helper for direct logging in controllers
 */
export async function logAudit(params: {
  adminId: string;
  adminEmail?: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await AuditLog.create({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.action,
      targetId: params.targetId,
      targetType: params.targetType,
      details: params.details || {},
      ipAddress: params.ipAddress,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('AuditLog creation error:', err);
  }
}

/**
 * PreHandler/onResponse Audit Logger Middleware Utility
 */
export function auditLogger(
  action: string,
  options?: {
    getTargetId?: (req: FastifyRequest) => string;
    getTargetType?: (req: FastifyRequest) => string;
    getDetails?: (req: FastifyRequest) => any;
  }
) {
  return async (request: FastifyRequest) => {
    if (!request.user) return;
    const targetId = options?.getTargetId
      ? options.getTargetId(request)
      : (request.params as any)?.id || (request.body as any)?.targetId;
    const targetType = options?.getTargetType
      ? options.getTargetType(request)
      : (request.body as any)?.targetType || 'Resource';
    const details = options?.getDetails
      ? options.getDetails(request)
      : request.body;

    await logAudit({
      adminId: request.user.userId,
      adminEmail: request.user.email,
      action,
      targetId,
      targetType,
      details,
      ipAddress: request.ip,
    });
  };
}
