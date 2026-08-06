import { FastifyInstance } from 'fastify';
import { getPublicLeaderboard, getPublicAnnouncements } from '../controllers/publicController.js';
import { getGalleryItems } from '../controllers/galleryController.js';
import { streamTeamStatusEvents } from '../controllers/adminController.js';

export async function publicRoutes(fastify: FastifyInstance) {
  // Public endpoints for Leaderboard & Announcements with 30s Redis cache
  fastify.get('/leaderboard', getPublicLeaderboard);
  fastify.get('/announcements', getPublicAnnouncements);

  // Public SSE endpoint for real-time team survival status updates
  fastify.get('/teams/events', streamTeamStatusEvents);

  // Public endpoint for Media & Gallery items grouped by season
  fastify.get('/gallery', getGalleryItems);
}

