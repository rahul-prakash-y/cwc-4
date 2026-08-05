"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandler = setupErrorHandler;
function setupErrorHandler(fastify) {
    fastify.setErrorHandler((error, _request, reply) => {
        fastify.log.error(error);
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal Server Error';
        let code = error.code || 'INTERNAL_SERVER_ERROR';
        let details = undefined;
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
        else if (error.code === 11000) {
            statusCode = 409;
            code = 'DUPLICATE_KEY_ERROR';
            message = 'Resource already exists with unique field conflict';
        }
        const response = {
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
