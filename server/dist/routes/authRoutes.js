import { registerTeam, login, registerAdmin, getMe, changePassword, checkTeamName, } from '../controllers/authController.js';
import { verifyJWT, isStudent } from '../middleware/auth.js';
import { registerTeamSchema, loginSchema, registerAdminSchema, changePasswordSchema, } from '../schemas/authSchemas.js';
// Stricter rate limits for authentication endpoints to prevent brute-force attacks
const authRateLimitConfig = {
    rateLimit: {
        max: 10, // Max 10 requests per minute to prevent brute-force attempts
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
    // Public auth routes with pre-compiled JSON schemas & rate limiting
    fastify.get('/check-team-name', checkTeamName);
    fastify.post('/register', { config: authRateLimitConfig, schema: registerTeamSchema }, registerTeam);
    fastify.post('/register-team', { config: authRateLimitConfig, schema: registerTeamSchema }, registerTeam);
    fastify.post('/login', { config: authRateLimitConfig, schema: loginSchema }, login);
    fastify.post('/register-admin', { config: adminRegRateLimitConfig, schema: registerAdminSchema }, registerAdmin);
    // Authenticated session route protected by verifyJWT
    fastify.get('/me', { preHandler: [verifyJWT] }, getMe);
    // Protected route for student password change
    fastify.post('/change-password', { preHandler: [verifyJWT, isStudent], schema: changePasswordSchema }, changePassword);
}
