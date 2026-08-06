import { Server } from 'socket.io';
import { env } from './config/env.js';
import { Draft } from './models/Draft.js';
/**
 * Constant identifier for the primary live coding test room.
 */
export const TEST_ROOM = 'test-room-season4';
/**
 * Lean In-Memory Maps for connection management & memory protection.
 * Optimized for Render's 512MB RAM Free Tier (handling 200 concurrent students).
 *
 * activeStudents: Maps studentId -> socketId
 * socketToStudent: Maps socketId -> studentId
 */
export const activeStudents = new Map();
export const socketToStudent = new Map();
/**
 * In-Memory cache storing latest unsaved student draft state.
 * Flushed asynchronously to MongoDB upon client disconnect.
 */
const activeDrafts = new Map();
let ioInstance = null;
let timeSyncInterval = null;
/**
 * Live Test Broadcast Engine utility function.
 * Sends event & payload to all connected clients in the live test room.
 */
export function broadcastToTest(event, payload) {
    if (ioInstance) {
        ioInstance.to(TEST_ROOM).emit(event, payload);
    }
}
/**
 * Returns the current active student socket count for health metrics & monitoring.
 */
export function getActiveSocketsCount() {
    return activeStudents.size;
}
/**
 * Returns the underlying Socket.io server instance.
 */
export function getSocketIoInstance() {
    return ioInstance;
}
/**
 * Configures and attaches Socket.io to the Fastify server instance.
 * Production-ready memory & network optimizations for Render Free Tier (512MB RAM, shared CPU):
 *
 * 1. perMessageDeflate: false -> Disables WS compression to prevent memory inflation on 512MB RAM.
 * 2. pingTimeout: 20000ms & pingInterval: 10000ms -> Keeps connections alive through Render reverse proxies.
 * 3. Lean In-Memory Map connection tracking and instant disconnect memory cleanup.
 * 4. Asynchronous MongoDB draft auto-save on disconnect without blocking the main event loop.
 */
export function setupSocketIO(app) {
    const allowedOrigins = env.CLIENT_ORIGIN
        ? env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
        : ['http://localhost:5173', 'http://localhost:3000'];
    const io = new Server(app.server, {
        cors: {
            origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Disable perMessageDeflate to save memory overhead per student connection
        perMessageDeflate: false,
        // Render proxy keep-alive ping configuration
        pingTimeout: 20000,
        pingInterval: 10000,
        maxHttpBufferSize: 1e6, // 1MB payload ceiling
    });
    ioInstance = io;
    // -------------------------------------------------------------
    // Live Test Broadcast Engine: Time Sync Every 10 Seconds
    // -------------------------------------------------------------
    if (timeSyncInterval) {
        clearInterval(timeSyncInterval);
    }
    timeSyncInterval = setInterval(() => {
        broadcastToTest('time-sync', {
            serverTime: Date.now(),
            iso: new Date().toISOString(),
            activeSockets: activeStudents.size,
        });
    }, 10000);
    // Allow NodeJS to exit cleanly without waiting for sync interval
    timeSyncInterval.unref();
    // -------------------------------------------------------------
    // Connection Management & Event Listeners
    // -------------------------------------------------------------
    io.on('connection', (socket) => {
        app.log.info({ socketId: socket.id }, '🔌 Socket client connected');
        // Automatically join live test room
        socket.join(TEST_ROOM);
        // 1. Room Joining & Connection Identification
        socket.on('join-test-room', ({ studentId, testId }) => {
            const targetRoom = testId || TEST_ROOM;
            socket.join(targetRoom);
            if (studentId) {
                // Disassociate stale socket mapping if student reconnected
                const previousSocketId = activeStudents.get(studentId);
                if (previousSocketId && previousSocketId !== socket.id) {
                    socketToStudent.delete(previousSocketId);
                }
                activeStudents.set(studentId, socket.id);
                socketToStudent.set(socket.id, studentId);
                app.log.info({ studentId, socketId: socket.id, room: targetRoom, activeSockets: activeStudents.size }, `🎯 Student ${studentId} joined live test room (${targetRoom})`);
            }
        });
        // Alias handler for standard room registration
        socket.on('register', ({ studentId }) => {
            if (studentId) {
                activeStudents.set(studentId, socket.id);
                socketToStudent.set(socket.id, studentId);
                socket.join(TEST_ROOM);
            }
        });
        // 2. Code Draft Synchronization
        socket.on('draft-update', (payload) => {
            const studentId = payload.studentId || socketToStudent.get(socket.id);
            if (studentId) {
                activeDrafts.set(studentId, {
                    codeDraft: payload.codeDraft,
                    state: payload.state,
                    testId: payload.testId || TEST_ROOM,
                });
            }
        });
        // 3. Heart-Beat Listener for Connection & Memory Protection
        socket.on('heartbeat', (payload) => {
            socket.emit('heartbeat-ack', {
                serverTime: Date.now(),
                payload: payload || null,
            });
        });
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        // 4. Connection Drop Cleanup & Asynchronous MongoDB Fallback
        socket.on('disconnect', (reason) => {
            const studentId = socketToStudent.get(socket.id);
            // Clean up lean In-Memory Maps immediately to save RAM
            if (studentId) {
                activeStudents.delete(studentId);
            }
            socketToStudent.delete(socket.id);
            app.log.info({ socketId: socket.id, studentId, reason, activeSockets: activeStudents.size }, '🔌 Socket client disconnected & memory map purged');
            // Asynchronous Error Fallback: Auto-save draft to MongoDB without blocking event loop
            if (studentId && activeDrafts.has(studentId)) {
                const draftData = activeDrafts.get(studentId);
                activeDrafts.delete(studentId);
                setImmediate(async () => {
                    try {
                        if (draftData) {
                            await Draft.findOneAndUpdate({ studentId, testId: draftData.testId || TEST_ROOM }, {
                                studentId,
                                testId: draftData.testId || TEST_ROOM,
                                codeDraft: draftData.codeDraft || '',
                                state: draftData.state || {},
                                lastSavedAt: new Date(),
                            }, { upsert: true, new: true });
                            app.log.info({ studentId }, '💾 Auto-saved student draft to MongoDB asynchronously');
                        }
                    }
                    catch (err) {
                        app.log.error({ err, studentId }, '❌ Failed async draft auto-save to MongoDB on disconnect');
                    }
                });
            }
        });
    });
    return io;
}
export default setupSocketIO;
