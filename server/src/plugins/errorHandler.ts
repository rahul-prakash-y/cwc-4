import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createAuditLog } from '../utils/audit.js';

export interface AppErrorResponse {
  status: number;
  message: string;
  error: string;
  correlationId: string;
  details?: unknown;
}

export function setupErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request.id as string) || 'N/A';

    // Log full stack trace internally via Pino logger
    request.log.error(
      {
        err: error,
        stack: error.stack,
        correlationId,
        url: request.raw.url,
        method: request.raw.method,
      },
      `[Error] ${error.message}`
    );

    let statusCode = error.statusCode || 500;
    let errorType = error.name || 'InternalServerError';
    let message = error.message || 'An unexpected error occurred';
    let details: unknown = undefined;

    // Handle Fastify Schema / Zod Validation Errors
    if (error.validation) {
      statusCode = 400;
      errorType = 'Bad Request';
      message = 'Request validation failed';
      details = error.validation;
    }
    // Handle Mongoose Validation Error
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorType = 'Bad Request';
      message = error.message;
    }
    // Handle Mongoose Duplicate Key Error (E11000)
    else if ((error as unknown as { code: number }).code === 11000) {
      statusCode = 409;
      errorType = 'Conflict';
      message = 'Resource already exists with unique field conflict';
    }
    // Map standard HTTP status codes to readable error types
    else if (statusCode === 400) {
      errorType = 'Bad Request';
    } else if (statusCode === 401) {
      errorType = 'Unauthorized';
    } else if (statusCode === 403) {
      errorType = 'Forbidden';
      createAuditLog(
        request,
        'SECURITY_THREAT',
        {
          error: error.message,
          errorType: 'Forbidden',
          url: request.raw.url,
          method: request.raw.method,
        },
        (request as any).user?.userId,
        (request as any).user?.role || 'anonymous',
        request.raw.url
      );
    } else if (statusCode === 404) {
      errorType = 'Not Found';
    } else if (statusCode === 429) {
      errorType = 'Too Many Requests';
      createAuditLog(
        request,
        'RATE_LIMIT_EXCEEDED',
        {
          error: error.message,
          errorType: 'Too Many Requests',
          url: request.raw.url,
          method: request.raw.method,
        },
        (request as any).user?.userId,
        (request as any).user?.role || 'anonymous',
        request.raw.url
      );
    }

    // In production, sanitize 500 internal server error messages sent to the client
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
      errorType = 'Internal Server Error';
    }

    const response: AppErrorResponse = {
      status: statusCode,
      message,
      error: errorType,
      correlationId,
      ...(details ? { details } : {}),
    };

    reply.status(statusCode).send(response);
  });
}
