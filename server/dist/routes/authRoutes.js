import { registerTeam, login, registerAdmin, getMe, } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
export async function authRoutes(fastify) {
    // Public routes
    fastify.post('/register-team', registerTeam);
    fastify.post('/login', login);
    fastify.post('/register-admin', registerAdmin);
    // Authenticated routes
    fastify.get('/me', { preHandler: [authenticate] }, getMe);
}
