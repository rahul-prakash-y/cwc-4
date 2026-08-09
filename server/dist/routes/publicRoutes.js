import { getPublicLeaderboard, getPublicAnnouncements, getPublicTeams, getFanFavoriteLeaderboard, getPublicTasks, getPublicTimeline, } from '../controllers/publicController.js';
import { getGalleryItems } from '../controllers/galleryController.js';
import { streamTeamStatusEvents } from '../controllers/adminController.js';
export async function publicRoutes(fastify) {
    // Public endpoints for Leaderboard & Announcements with 30s Redis cache
    fastify.get('/leaderboard', getPublicLeaderboard);
    fastify.get('/fan-favorite', getFanFavoriteLeaderboard);
    fastify.get('/announcements', getPublicAnnouncements);
    // Public Teams & Tasks & Event Timeline
    fastify.get('/teams', getPublicTeams);
    fastify.get('/tasks', getPublicTasks);
    fastify.get('/timeline', getPublicTimeline);
    // Public SSE endpoint for real-time team survival status updates
    fastify.get('/teams/events', streamTeamStatusEvents);
    // Public endpoint for Media & Gallery items grouped by season
    fastify.get('/gallery', getGalleryItems);
}
