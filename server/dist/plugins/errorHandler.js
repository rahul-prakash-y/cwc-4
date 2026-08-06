export function setupErrorHandler(fastify) {
    fastify.setErrorHandler((error, request, reply) => {
        const correlationId = request.id || 'N/A';
        // Log full stack trace internally via Pino logger
        request.log.error({
            err: error,
            stack: error.stack,
            correlationId,
            url: request.raw.url,
            method: request.raw.method,
        }, `[Error] ${error.message}`);
        let statusCode = error.statusCode || 500;
        let errorType = error.name || 'InternalServerError';
        let message = error.message || 'An unexpected error occurred';
        let details = undefined;
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
        else if (error.code === 11000) {
            statusCode = 409;
            errorType = 'Conflict';
            message = 'Resource already exists with unique field conflict';
        }
        // Map standard HTTP status codes to readable error types
        else if (statusCode === 400) {
            errorType = 'Bad Request';
        }
        else if (statusCode === 401) {
            errorType = 'Unauthorized';
        }
        else if (statusCode === 403) {
            errorType = 'Forbidden';
        }
        else if (statusCode === 404) {
            errorType = 'Not Found';
        }
        else if (statusCode === 429) {
            errorType = 'Too Many Requests';
        }
        // In production, sanitize 500 internal server error messages sent to the client
        if (statusCode === 500 && process.env.NODE_ENV === 'production') {
            message = 'Internal Server Error';
            errorType = 'Internal Server Error';
        }
        const response = {
            status: statusCode,
            message,
            error: errorType,
            correlationId,
            ...(details ? { details } : {}),
        };
        reply.status(statusCode).send(response);
    });
}
