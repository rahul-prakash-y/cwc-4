import { getAllTeams, updateTeamStatus, eliminateTeam, createTask, getAllTasksAdmin, updateTask, deleteTask, createAnnouncement, getAllAnnouncementsAdmin, deleteAnnouncement, grantAdvantage, setTeamImmunity, updateScoresBatch, getGrandFinale, toggleGrandFinale, } from '../controllers/adminController.js';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, } from '../controllers/galleryController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { toggleGrandFinaleSchema, updateTeamStatusSchema, eliminateTeamSchema, grantAdvantageSchema, setTeamImmunitySchema, updateScoresBatchSchema, createTaskSchema, updateTaskSchema, deleteTaskSchema, createAnnouncementSchema, deleteAnnouncementSchema, } from '../schemas/adminSchemas.js';
import { deleteGallerySchema } from '../schemas/gallerySchemas.js';
export async function adminRoutes(fastify) {
    // All admin routes require authentication and admin role
    fastify.addHook('preHandler', authenticate);
    fastify.addHook('preHandler', isAdmin);
    // Grand Finale State Toggle
    fastify.get('/grand-finale', getGrandFinale);
    fastify.post('/grand-finale', { schema: toggleGrandFinaleSchema }, toggleGrandFinale);
    // Teams Management
    fastify.get('/teams', getAllTeams);
    fastify.patch('/teams/:teamId/status', { schema: updateTeamStatusSchema }, updateTeamStatus);
    fastify.patch('/teams/:teamId/eliminate', { schema: eliminateTeamSchema }, eliminateTeam);
    // Advantages & Immunities & Score Batch
    fastify.post('/teams/:teamId/advantages', { schema: grantAdvantageSchema }, grantAdvantage);
    fastify.post('/teams/:teamId/immunity', { schema: setTeamImmunitySchema }, setTeamImmunity);
    fastify.post('/scores/batch', { schema: updateScoresBatchSchema }, updateScoresBatch);
    // Daily Tasks Management
    fastify.post('/tasks', { schema: createTaskSchema }, createTask);
    fastify.get('/tasks', getAllTasksAdmin);
    fastify.put('/tasks/:taskId', { schema: updateTaskSchema }, updateTask);
    fastify.delete('/tasks/:taskId', { schema: deleteTaskSchema }, deleteTask);
    // Global Announcements
    fastify.post('/announcements', { schema: createAnnouncementSchema }, createAnnouncement);
    fastify.get('/announcements', getAllAnnouncementsAdmin);
    fastify.delete('/announcements/:announcementId', { schema: deleteAnnouncementSchema }, deleteAnnouncement);
    // Gallery & Media Management
    fastify.get('/gallery', getGalleryItems);
    fastify.post('/gallery', createGalleryItem);
    fastify.delete('/gallery/:id', { schema: deleteGallerySchema }, deleteGalleryItem);
}
