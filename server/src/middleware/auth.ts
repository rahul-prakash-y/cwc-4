import { FastifyRequest, FastifyReply } from 'fastify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'student';
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
 * PreHandler Middleware to verify JWT token
 */
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication token missing or malformed',
      });
    }

    if (typeof request.jwtVerify === 'function') {
      try {
        const decoded = await request.jwtVerify<UserPayload>();
        request.user = decoded;
        return;
      } catch {
        // Fallback to jsonwebtoken verification
      }
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
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
 * PreHandler Middleware to check for Admin role
 */
export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Access denied: Admin privileges required',
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
