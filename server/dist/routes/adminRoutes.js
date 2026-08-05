"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
const adminController_js_1 = require("../controllers/adminController.js");
const auth_js_1 = require("../middleware/auth.js");
async function adminRoutes(fastify) {
    // All admin routes require authentication and admin role
    fastify.addHook('preHandler', auth_js_1.authenticate);
    fastify.addHook('preHandler', auth_js_1.isAdmin);
    // Grand Finale State Toggle
    fastify.get('/grand-finale', adminController_js_1.getGrandFinale);
    fastify.post('/grand-finale', adminController_js_1.toggleGrandFinale);
    // Teams Management
    fastify.get('/teams', adminController_js_1.getAllTeams);
    fastify.patch('/teams/:teamId/status', adminController_js_1.updateTeamStatus);
    fastify.patch('/teams/:teamId/eliminate', adminController_js_1.eliminateTeam);
    // Advantages & Immunities & Score Batch
    fastify.post('/teams/:teamId/advantages', adminController_js_1.grantAdvantage);
    fastify.post('/teams/:teamId/immunity', adminController_js_1.setTeamImmunity);
    fastify.post('/scores/batch', adminController_js_1.updateScoresBatch);
    // Daily Tasks Management
    fastify.post('/tasks', adminController_js_1.createTask);
    fastify.get('/tasks', adminController_js_1.getAllTasksAdmin);
    fastify.put('/tasks/:taskId', adminController_js_1.updateTask);
    fastify.delete('/tasks/:taskId', adminController_js_1.deleteTask);
    // Global Announcements
    fastify.post('/announcements', adminController_js_1.createAnnouncement);
    fastify.get('/announcements', adminController_js_1.getAllAnnouncementsAdmin);
    fastify.delete('/announcements/:announcementId', adminController_js_1.deleteAnnouncement);
}
