import { buildApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { setupSocketIO } from './socket.js';
const start = async () => {
    const app = buildApp();
    try {
        // 1. Connect to MongoDB database
        await connectDB();
        // 2. Attach Socket.io server to Fastify instance
        const io = setupSocketIO(app);
        // 3. Start Fastify server listening
        await app.listen({ port: env.PORT, host: env.HOST });
        app.log.info({ host: env.HOST, port: env.PORT, socketIO: true }, `🎪 [CWC Season 4] Fastify & Socket.io server running on http://${env.HOST}:${env.PORT}`);
    }
    catch (err) {
        app.log.error({ err }, 'Failed to start server');
        process.exit(1);
    }
};
start();
