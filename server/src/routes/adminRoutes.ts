import { FastifyInstance } from 'fastify';
import {
  getAllTeams,
  updateTeamStatus,
  eliminateTeam,
  streamTeamStatusEvents,
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
  getGrandFinale,
  toggleGrandFinale,
} from '../controllers/adminController.js';
import {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import {
  getAttendance,
  saveAttendance,
  runAttendanceAutoChecker,
} from '../controllers/attendanceController.js';
import { verifyJWT, isAdmin } from '../middleware/auth.js';
import {
  toggleGrandFinaleSchema,
  updateTeamStatusSchema,
  eliminateTeamSchema,
  grantAdvantageSchema,
  setTeamImmunitySchema,
  updateScoresBatchSchema,
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  createAnnouncementSchema,
  deleteAnnouncementSchema,
} from '../schemas/adminSchemas.js';
import { deleteGallerySchema } from '../schemas/gallerySchemas.js';


export async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require authentication and admin role
  fastify.addHook('preHandler', verifyJWT);
  fastify.addHook('preHandler', isAdmin);

  // Grand Finale State Toggle
  fastify.get('/grand-finale', getGrandFinale);
  fastify.post('/grand-finale', { schema: toggleGrandFinaleSchema }, toggleGrandFinale);

  // Teams Management
  fastify.get('/teams', getAllTeams);
  fastify.get('/teams/events', streamTeamStatusEvents);
  fastify.patch('/teams/:id/status', { schema: updateTeamStatusSchema }, updateTeamStatus);
  fastify.patch('/teams/:id/eliminate', { schema: eliminateTeamSchema }, eliminateTeam);

  // Attendance Management & Auto-Checker
  fastify.get('/attendance', getAttendance);
  fastify.post('/attendance', saveAttendance);
  fastify.post('/attendance/auto-check', runAttendanceAutoChecker);

  // Advantages & Immunities & Score Batch
  fastify.post('/grant-advantage', { schema: grantAdvantageSchema }, grantAdvantage);
  fastify.post('/grant-advantage/:id', { schema: grantAdvantageSchema }, grantAdvantage);
  fastify.post('/teams/:id/advantages', { schema: grantAdvantageSchema }, grantAdvantage);
  fastify.post('/teams/:id/immunity', { schema: setTeamImmunitySchema }, setTeamImmunity);
  fastify.post('/scores/batch', { schema: updateScoresBatchSchema }, updateScoresBatch);

  // Daily Tasks Management
  fastify.post('/tasks', { schema: createTaskSchema }, createTask);
  fastify.get('/tasks', getAllTasksAdmin);
  fastify.put('/tasks/:id', { schema: updateTaskSchema }, updateTask);
  fastify.delete('/tasks/:id', { schema: deleteTaskSchema }, deleteTask);

  // Global Announcements
  fastify.post('/announcements', { schema: createAnnouncementSchema }, createAnnouncement);
  fastify.get('/announcements', getAllAnnouncementsAdmin);
  fastify.delete('/announcements/:id', { schema: deleteAnnouncementSchema }, deleteAnnouncement);

  // Gallery & Media Management
  fastify.get('/gallery', getGalleryItems);
  fastify.post('/gallery', createGalleryItem);
  fastify.delete('/gallery/:id', { schema: deleteGallerySchema }, deleteGalleryItem);
}



