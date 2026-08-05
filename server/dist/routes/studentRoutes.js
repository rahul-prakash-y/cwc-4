"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRoutes = studentRoutes;
const studentController_js_1 = require("../controllers/studentController.js");
const auth_js_1 = require("../middleware/auth.js");
async function studentRoutes(fastify) {
    // All student routes require authentication and student role
    fastify.addHook('preHandler', auth_js_1.authenticate);
    fastify.addHook('preHandler', auth_js_1.isStudent);
    // Student Dashboard
    fastify.get('/dashboard', studentController_js_1.getStudentDashboard);
    // Active Tasks
    fastify.get('/tasks', studentController_js_1.getActiveTasks);
    // Submit Task (GitHub link or Cloudinary upload URL)
    fastify.post('/tasks/:taskId/submit', studentController_js_1.submitTask);
    // Direct File Upload to Cloudinary (PDF / Image)
    fastify.post('/upload', studentController_js_1.uploadTaskFile);
}
