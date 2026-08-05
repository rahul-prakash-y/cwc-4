import { FastifyInstance } from 'fastify';
import {
  getAllTeams,
  updateTeamStatus,
  eliminateTeam,
  createTask,
  getAllTasksAdmin,
  updateTask,
  deleteTask,
  createAnnouncement,
  getAllAnnouncementsAdmin,
  deleteAnnouncement,
  grantAdvantage,
  setTeamImmunity,
  updateScoresBatch,
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require authentication and admin role
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', isAdmin);

  // Teams Management
  fastify.get('/teams', getAllTeams);
  fastify.patch('/teams/:teamId/status', updateTeamStatus);
  fastify.patch('/teams/:teamId/eliminate', eliminateTeam);

  // Advantages & Immunities & Score Batch
  fastify.post('/teams/:teamId/advantages', grantAdvantage);
  fastify.post('/teams/:teamId/immunity', setTeamImmunity);
  fastify.post('/scores/batch', updateScoresBatch);

  // Daily Tasks Management
  fastify.post('/tasks', createTask);
  fastify.get('/tasks', getAllTasksAdmin);
  fastify.put('/tasks/:taskId', updateTask);
  fastify.delete('/tasks/:taskId', deleteTask);

  // Global Announcements
  fastify.post('/announcements', createAnnouncement);
  fastify.get('/announcements', getAllAnnouncementsAdmin);
  fastify.delete('/announcements/:announcementId', deleteAnnouncement);
}

