import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface AppErrorResponse {
  success: boolean;
  error: {
    message: string;
    statusCode: number;
    code?: string;
    details?: unknown;
  };
}

export function setupErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.error(error);

    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let code = error.code || 'INTERNAL_SERVER_ERROR';
    let details: unknown = undefined;

    // Handle Fastify Validation Errors
    if (error.validation) {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = 'Request validation failed';
      details = error.validation;
    }
    // Handle Mongoose Validation Error
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      code = 'MONGOOSE_VALIDATION_ERROR';
      message = error.message;
    }
    // Handle Mongoose Duplicate Key Error (E11000)
    else if ((error as unknown as { code: number }).code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_KEY_ERROR';
      message = 'Resource already exists with unique field conflict';
    }

    const response: AppErrorResponse = {
      success: false,
      error: {
        message,
        statusCode,
        code,
        ...(details ? { details } : {}),
      },
    };

    reply.status(statusCode).send(response);
  });
}
