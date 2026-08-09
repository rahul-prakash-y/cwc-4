import { registerTeam, login, logout, registerAdmin, getMe, changePassword, checkTeamName, updateTheme, } from '../controllers/authController.js';
import { verifyJWT, isStudent } from '../middleware/auth.js';
import { registerTeamSchema, loginSchema, registerAdminSchema, changePasswordSchema, updateThemeSchema, } from '../schemas/authSchemas.js';
// Strict rate limits for authentication endpoints to prevent brute-force attacks
const strictAuthRateLimitConfig = {
    rateLimit: {
        max: 10, // Max 10 attempts per 15 minutes per IP
        timeWindow: '15 minutes',
        errorResponseBuilder: (request, context) => ({
            status: 429,
            error: 'Too Many Requests',
            message: `Strict Auth Rate Limit Exceeded. Maximum ${context.max} authentication attempts per ${context.after} allowed.`,
            correlationId: request.id,
            date: new Date().toISOString(),
        }),
    },
};
export async function authRoutes(fastify) {
    // Public auth routes with pre-compiled JSON schemas & strict rate limiting
    fastify.get('/check-team-name', checkTeamName);
    fastify.post('/register', { config: strictAuthRateLimitConfig, schema: registerTeamSchema }, registerTeam);
    fastify.post('/register-team', { config: strictAuthRateLimitConfig, schema: registerTeamSchema }, registerTeam);
    fastify.post('/login', { config: strictAuthRateLimitConfig, schema: loginSchema }, login);
    fastify.post('/register-admin', { config: strictAuthRateLimitConfig, schema: registerAdminSchema }, registerAdmin);
    // Logout route
    fastify.post('/logout', async (request, reply) => {
        try {
            await verifyJWT(request, reply);
        }
        catch {
            // Allow logout even if token is expired
        }
        return logout(request, reply);
    });
    // Authenticated session route protected by verifyJWT
    fastify.get('/me', { preHandler: [verifyJWT] }, getMe);
    // Protected route for updating user theme preference
    fastify.patch('/theme', { preHandler: [verifyJWT], schema: updateThemeSchema }, updateTheme);
    // Protected route for student password change
    fastify.post('/change-password', { preHandler: [verifyJWT, isStudent], schema: changePasswordSchema }, changePassword);
}
