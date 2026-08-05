import { buildApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async () => {
  const app = buildApp();

  try {
    // Connect to MongoDB database
    await connectDB();

    // Start Fastify server listening
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🎪 [CWC Season 4] Server running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
