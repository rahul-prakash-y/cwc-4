import { getPublicLeaderboard, getPublicAnnouncements } from '../controllers/publicController.js';
import { getGalleryItems } from '../controllers/galleryController.js';
export async function publicRoutes(fastify) {
    // Public endpoints for Leaderboard & Announcements with 30s Redis cache
    fastify.get('/leaderboard', getPublicLeaderboard);
    fastify.get('/announcements', getPublicAnnouncements);
    // Public endpoint for Media & Gallery items grouped by season
    fastify.get('/gallery', getGalleryItems);
}
