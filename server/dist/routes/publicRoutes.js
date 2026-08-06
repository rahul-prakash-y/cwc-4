import { getPublicLeaderboard, getPublicAnnouncements } from '../controllers/publicController.js';
export async function publicRoutes(fastify) {
    // Public endpoints for Leaderboard & Announcements with 30s Redis cache
    fastify.get('/leaderboard', getPublicLeaderboard);
    fastify.get('/announcements', getPublicAnnouncements);
}
