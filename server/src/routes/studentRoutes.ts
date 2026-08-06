import { FastifyInstance } from 'fastify';
import {
  getStudentDashboard,
  getActiveTasks,
  saveTaskDraft,
  submitTask,
  submitInteractiveTask,
  uploadTaskFile,
  useAdvantage,
} from '../controllers/studentController.js';
import { verifyJWT, isStudent } from '../middleware/auth.js';
import { submitTaskSchema, saveDraftSchema, useAdvantageSchema } from '../schemas/studentSchemas.js';

export async function studentRoutes(fastify: FastifyInstance) {
  // All student routes require authentication and student role
  fastify.addHook('preHandler', verifyJWT);
  fastify.addHook('preHandler', isStudent);

  // Student Dashboard
  fastify.get('/dashboard', getStudentDashboard);

  // Active Tasks
  fastify.get('/tasks/active', getActiveTasks);
  fastify.get('/tasks', getActiveTasks);

  // Save Task Answer Draft (MongoDB)
  fastify.post('/tasks/:id/draft', { schema: saveDraftSchema }, saveTaskDraft);

  // Final Submit Task (Text answer, GitHub link, Cloudinary upload payload)
  fastify.post('/tasks/:id/submit', { schema: submitTaskSchema }, submitTask);

  // Interactive Task Auto-Grading Routes
  fastify.post('/tasks/:id/submit-interactive', submitInteractiveTask);

  // Use / Deduct Advantage
  fastify.post('/advantages/use', { schema: useAdvantageSchema }, useAdvantage);

  // Direct File Upload to Cloudinary (PDF / Image)
  fastify.post('/upload', uploadTaskFile);
}



