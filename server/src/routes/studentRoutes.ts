import { FastifyInstance } from 'fastify';
import {
  getStudentDashboard,
  getActiveTasks,
  submitTask,
  uploadTaskFile,
} from '../controllers/studentController.js';
import { authenticate, isStudent } from '../middleware/auth.js';
import { submitTaskSchema } from '../schemas/studentSchemas.js';

export async function studentRoutes(fastify: FastifyInstance) {
  // All student routes require authentication and student role
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', isStudent);

  // Student Dashboard
  fastify.get('/dashboard', getStudentDashboard);

  // Active Tasks
  fastify.get('/tasks', getActiveTasks);

  // Submit Task (GitHub link or Cloudinary upload URL)
  fastify.post('/tasks/:taskId/submit', { schema: submitTaskSchema }, submitTask);

  // Direct File Upload to Cloudinary (PDF / Image)
  fastify.post('/upload', uploadTaskFile);
}
