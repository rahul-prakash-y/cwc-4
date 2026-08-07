import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getGlobalSettings } from '../models/Settings.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/settings/global (Public)
   * Returns the Singleton Global CMS Settings document.
   */
  fastify.get('/global', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const settings = await getGlobalSettings();
      return reply.send(settings);
    } catch (err: any) {
      request.log.error(err, 'Error retrieving global settings');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve global settings',
      });
    }
  });

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const settings = await getGlobalSettings();
      return reply.send(settings);
    } catch (err: any) {
      request.log.error(err, 'Error retrieving global settings');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve global settings',
      });
    }
  });
}

export default settingsRoutes;
