"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const authController_js_1 = require("../controllers/authController.js");
const auth_js_1 = require("../middleware/auth.js");
async function authRoutes(fastify) {
    // Public routes
    fastify.post('/register-team', authController_js_1.registerTeam);
    fastify.post('/login', authController_js_1.login);
    fastify.post('/register-admin', authController_js_1.registerAdmin);
    // Authenticated routes
    fastify.get('/me', { preHandler: [auth_js_1.authenticate] }, authController_js_1.getMe);
}
