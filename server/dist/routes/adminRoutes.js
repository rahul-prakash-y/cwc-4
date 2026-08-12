import { getAllTeams, updateTeamStatus, eliminateTeam, deleteTeam, updateTeamDetails, streamTeamStatusEvents, createTask, getAllTasksAdmin, updateTask, deleteTask, createAnnouncement, getAllAnnouncementsAdmin, deleteAnnouncement, grantAdvantage, setTeamImmunity, updateScoresBatch, upsertScore, getAdminScores, getOverviewStats, getGrandFinale, toggleGrandFinale, getBuzzerQuestions, createBuzzerQuestion, updateBuzzerQuestion, deleteBuzzerQuestion, downloadTeamsTemplate, importTeamsBulk, getAdminTimeline, updateTimelineDay, updateTimelineTask, getAdminVotes, adminCastVote, } from '../controllers/adminController.js';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, } from '../controllers/galleryController.js';
import { getAttendance, saveAttendance, runAttendanceAutoChecker, } from '../controllers/attendanceController.js';
import { verifyJWT, isAdmin } from '../middleware/auth.js';
import { toggleGrandFinaleSchema, updateTeamStatusSchema, eliminateTeamSchema, grantAdvantageSchema, setTeamImmunitySchema, updateScoresBatchSchema, createTaskSchema, updateTaskSchema, deleteTaskSchema, createAnnouncementSchema, deleteAnnouncementSchema, } from '../schemas/adminSchemas.js';
import { deleteGallerySchema } from '../schemas/gallerySchemas.js';
import { lookupUserByEmail } from '../controllers/superadminController.js';
export async function adminRoutes(fastify) {
    // All admin routes require authentication and admin role
    fastify.addHook('preHandler', verifyJWT);
    fastify.addHook('preHandler', isAdmin);
    fastify.get('/lookup-user', lookupUserByEmail);
    // Overview Telemetry & Stat Cards Route (DB Driven)
    fastify.get('/overview-stats', getOverviewStats);
    fastify.get('/stats', getOverviewStats);
    // Grand Finale State Toggle & Settings Routes
    fastify.get('/grand-finale', getGrandFinale);
    fastify.post('/grand-finale', { schema: toggleGrandFinaleSchema }, toggleGrandFinale);
    fastify.get('/settings/finale', getGrandFinale);
    fastify.patch('/settings/finale', toggleGrandFinale);
    fastify.post('/settings/finale', toggleGrandFinale);
    // Teams Management
    fastify.get('/teams', getAllTeams);
    fastify.get('/teams/events', streamTeamStatusEvents);
    fastify.get('/teams/template', downloadTeamsTemplate);
    fastify.post('/teams/bulk-upload', importTeamsBulk);
    fastify.put('/teams/:id', updateTeamDetails);
    fastify.patch('/teams/:id/status', { schema: updateTeamStatusSchema }, updateTeamStatus);
    fastify.patch('/teams/:id/eliminate', { schema: eliminateTeamSchema }, eliminateTeam);
    fastify.delete('/teams/:id', deleteTeam);
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
    fastify.post('/scores', upsertScore);
    fastify.get('/scores', getAdminScores);
    // Daily Tasks Management
    fastify.post('/tasks', { schema: createTaskSchema }, createTask);
    fastify.get('/tasks', getAllTasksAdmin);
    fastify.put('/tasks/:id', { schema: updateTaskSchema }, updateTask);
    fastify.delete('/tasks/:id', { schema: deleteTaskSchema }, deleteTask);
    // Timeline CMS Management
    fastify.get('/timeline', getAdminTimeline);
    fastify.put('/timeline/day/:dayNumber', updateTimelineDay);
    fastify.put('/timeline/task/:id', updateTimelineTask);
    // Global Announcements
    fastify.post('/announcements', { schema: createAnnouncementSchema }, createAnnouncement);
    fastify.get('/announcements', getAllAnnouncementsAdmin);
    fastify.delete('/announcements/:id', { schema: deleteAnnouncementSchema }, deleteAnnouncement);
    // Gallery & Media Management
    fastify.get('/gallery', getGalleryItems);
    fastify.post('/gallery', createGalleryItem);
    fastify.delete('/gallery/:id', { schema: deleteGallerySchema }, deleteGalleryItem);
    // Task 4: Buzzer Questions Management
    fastify.get('/buzzer-questions', getBuzzerQuestions);
    fastify.post('/buzzer-questions', createBuzzerQuestion);
    fastify.put('/buzzer-questions/:id', updateBuzzerQuestion);
    fastify.delete('/buzzer-questions/:id', deleteBuzzerQuestion);
    // Voting & Fan Favorite Management for Admins & SuperAdmins
    fastify.get('/votes', getAdminVotes);
    fastify.get('/votes/audit', getAdminVotes);
    fastify.post('/votes/cast', adminCastVote);
}
