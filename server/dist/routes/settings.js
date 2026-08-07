import { getGlobalSettings } from '../models/Settings.js';
export async function settingsRoutes(fastify) {
    /**
     * GET /api/settings/global (Public)
     * Returns the Singleton Global CMS Settings document.
     */
    fastify.get('/global', async (request, reply) => {
        try {
            const settings = await getGlobalSettings();
            return reply.send(settings);
        }
        catch (err) {
            request.log.error(err, 'Error retrieving global settings');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to retrieve global settings',
            });
        }
    });
    fastify.get('/', async (request, reply) => {
        try {
            const settings = await getGlobalSettings();
            return reply.send(settings);
        }
        catch (err) {
            request.log.error(err, 'Error retrieving global settings');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Failed to retrieve global settings',
            });
        }
    });
}
export default settingsRoutes;
