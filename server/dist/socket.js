import { Server } from 'socket.io';
import { env } from './config/env.js';
import { Draft } from './models/Draft.js';
export const TEST_ROOM = 'test-room-season4';
export const GLOBAL_ROOM = 'global';
export const STUDENT_ROOM = 'student-dashboard';
export const ADMIN_ROOM = 'admin-panel';
/**
 * Lean In-Memory Maps for connection management & memory protection.
 * Optimized for Render's 512MB RAM Free Tier (handling 200 concurrent students).
 */
export const activeStudents = new Map(); // studentId -> socketId
export const socketToStudent = new Map(); // socketId -> studentId
const activeDrafts = new Map();
let ioInstance = null;
let timeSyncInterval = null;
/**
 * Broadcast utility to send events to specific rooms or multiple rooms.
 */
export function emitToRoom(room, event, payload) {
    if (ioInstance) {
        ioInstance.to(room).emit(event, payload);
    }
}
export function broadcastToTest(event, payload) {
    emitToRoom(TEST_ROOM, event, payload);
}
/**
 * Task 2 Broadcast Helpers for Real-Time Backend Events
 */
export function broadcastScoreUpdated(payload) {
    if (ioInstance) {
        ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('SCORE_UPDATED', {
            timestamp: new Date().toISOString(),
            ...payload,
        });
    }
}
export function broadcastNewAnnouncement(payload) {
    if (ioInstance) {
        ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('NEW_ANNOUNCEMENT', {
            timestamp: new Date().toISOString(),
            ...payload,
        });
    }
}
export function broadcastStatusChanged(payload) {
    if (ioInstance) {
        ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('STATUS_CHANGED', {
            timestamp: new Date().toISOString(),
            ...payload,
        });
    }
}
export function getActiveSocketsCount() {
    return activeStudents.size;
}
export function getSocketIoInstance() {
    return ioInstance;
}
/**
 * Configures and attaches Socket.io to Fastify server.
 * Handles room joining for 'global', 'student-dashboard', and 'admin-panel'.
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
        perMessageDeflate: false, // Disables compression to save memory on 512MB RAM limit
        pingTimeout: 20000, // Keeps Render proxy WebSocket connections alive
        pingInterval: 10000,
        maxHttpBufferSize: 1e6, // 1MB max payload limit
    });
    ioInstance = io;
    // Broadcast time sync every 10 seconds
    if (timeSyncInterval)
        clearInterval(timeSyncInterval);
    timeSyncInterval = setInterval(() => {
        broadcastToTest('time-sync', {
            serverTime: Date.now(),
            iso: new Date().toISOString(),
            activeSockets: activeStudents.size,
        });
    }, 10000);
    timeSyncInterval.unref();
    io.on('connection', (socket) => {
        app.log.info({ socketId: socket.id }, '🔌 Client connected to Socket.io');
        // Auto-join global room on connection
        socket.join(GLOBAL_ROOM);
        // Task 1: Room joining handler for 'global', 'student-dashboard', 'admin-panel'
        socket.on('join-room', (roomName) => {
            const allowedRooms = [GLOBAL_ROOM, STUDENT_ROOM, ADMIN_ROOM, TEST_ROOM];
            if (allowedRooms.includes(roomName) || roomName.startsWith('team-')) {
                socket.join(roomName);
                app.log.info({ socketId: socket.id, room: roomName }, `Socket joined room: ${roomName}`);
            }
        });
        // Student identification & live test room joining
        socket.on('join-test-room', ({ studentId, testId }) => {
            const targetRoom = testId || TEST_ROOM;
            socket.join(targetRoom);
            socket.join(STUDENT_ROOM);
            if (studentId) {
                const previousSocketId = activeStudents.get(studentId);
                if (previousSocketId && previousSocketId !== socket.id) {
                    socketToStudent.delete(previousSocketId);
                }
                activeStudents.set(studentId, socket.id);
                socketToStudent.set(socket.id, studentId);
            }
        });
        socket.on('register', ({ studentId, role }) => {
            if (studentId) {
                activeStudents.set(studentId, socket.id);
                socketToStudent.set(socket.id, studentId);
                socket.join(role === 'admin' ? ADMIN_ROOM : STUDENT_ROOM);
            }
        });
        // Code draft sync
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
        // Heartbeat
        socket.on('heartbeat', (payload) => {
            socket.emit('heartbeat-ack', { serverTime: Date.now(), payload: payload || null });
        });
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        // Disconnect cleanup & async Mongo fallback
        socket.on('disconnect', () => {
            const studentId = socketToStudent.get(socket.id);
            if (studentId) {
                activeStudents.delete(studentId);
            }
            socketToStudent.delete(socket.id);
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
                        }
                    }
                    catch (err) {
                        app.log.error({ err, studentId }, 'Draft auto-save error on disconnect');
                    }
                });
            }
        });
    });
    return io;
}
export default setupSocketIO;
