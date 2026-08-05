"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const db_js_1 = require("./config/db.js");
const env_js_1 = require("./config/env.js");
const start = async () => {
    const app = (0, app_js_1.buildApp)();
    try {
        // Connect to MongoDB database
        await (0, db_js_1.connectDB)();
        // Start Fastify server listening
        await app.listen({ port: env_js_1.env.PORT, host: env_js_1.env.HOST });
        console.log(`🎪 [CWC Season 4] Server running on http://${env_js_1.env.HOST}:${env_js_1.env.PORT}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
