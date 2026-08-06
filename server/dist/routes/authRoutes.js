import { registerTeam, login, registerAdmin, getMe, } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerTeamSchema, loginSchema, registerAdminSchema, } from '../schemas/authSchemas.js';
// Stricter rate limits for authentication endpoints to prevent brute-force attacks
const authRateLimitConfig = {
    rateLimit: {
        max: 10, // Max 10 requests per minute
        timeWindow: '1 minute',
    },
};
const adminRegRateLimitConfig = {
    rateLimit: {
        max: 5, // Max 5 requests per minute
        timeWindow: '1 minute',
    },
};
export async function authRoutes(fastify) {
    // Public routes with pre-compiled schemas and strict rate limiting
    fastify.post('/register-team', { config: authRateLimitConfig, schema: registerTeamSchema }, registerTeam);
    fastify.post('/login', { config: authRateLimitConfig, schema: loginSchema }, login);
    fastify.post('/register-admin', { config: adminRegRateLimitConfig, schema: registerAdminSchema }, registerAdmin);
    // Authenticated route
    fastify.get('/me', { preHandler: [authenticate] }, getMe);
}
