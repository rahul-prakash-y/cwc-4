import { FastifyRequest, FastifyReply } from 'fastify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'student';
  teamId?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
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
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication token missing or malformed',
      });
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
