import { Server, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
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
export const activeStudents = new Map<string, string>(); // studentId -> socketId
export const socketToStudent = new Map<string, string>(); // socketId -> studentId
const activeDrafts = new Map<string, { codeDraft?: string; state?: any; testId?: string }>();

let ioInstance: Server | null = null;
let timeSyncInterval: NodeJS.Timeout | null = null;

/**
 * Broadcast utility to send events to specific rooms or multiple rooms.
 */
export function emitToRoom(room: string, event: string, payload: any): void {
  if (ioInstance) {
    ioInstance.to(room).emit(event, payload);
  }
}

export function broadcastToTest(event: string, payload: any): void {
  emitToRoom(TEST_ROOM, event, payload);
}

/**
 * Task 2 Broadcast Helpers for Real-Time Backend Events
 */
export function broadcastScoreUpdated(payload: any): void {
  if (ioInstance) {
    ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('SCORE_UPDATED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastNewAnnouncement(payload: any): void {
  if (ioInstance) {
    ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('NEW_ANNOUNCEMENT', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastStatusChanged(payload: any): void {
  if (ioInstance) {
    ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('STATUS_CHANGED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastAdvantageGranted(payload: any): void {
  if (ioInstance) {
    ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('ADVANTAGE_GRANTED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastFinaleTriggered(payload: { isGrandFinale: boolean }): void {
  if (ioInstance) {
    ioInstance.emit('FINALE_TRIGGERED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastVotesUpdated(payload: any): void {
  if (ioInstance) {
    ioInstance.to(GLOBAL_ROOM).to(STUDENT_ROOM).to(ADMIN_ROOM).emit('VOTES_UPDATED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function broadcastSettingsUpdated(payload: any): void {
  if (ioInstance) {
    ioInstance.emit('SETTINGS_UPDATED', {
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function disconnectUserSockets(targetId: string): void {
  if (!ioInstance) return;

  const socketId = activeStudents.get(targetId);
  if (socketId) {
    const socket = ioInstance.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('ACCOUNT_BLOCKED', {
        message: 'Your account/team has been blocked by SuperAdmin.',
        timestamp: new Date().toISOString(),
      });
      socket.disconnect(true);
    }
    activeStudents.delete(targetId);
    socketToStudent.delete(socketId);
  }

  // Broadcast to room
  ioInstance.to(`team-${targetId}`).to(`user-${targetId}`).emit('ACCOUNT_BLOCKED', {
    message: 'Your account/team has been blocked by SuperAdmin.',
    timestamp: new Date().toISOString(),
  });
}


export function getActiveSocketsCount(): number {
  return activeStudents.size;
}

export function getSocketIoInstance(): Server | null {
  return ioInstance;
}

/**
 * Configures and attaches Socket.io to Fastify server.
 * Handles room joining for 'global', 'student-dashboard', and 'admin-panel'.
 */
export function setupSocketIO(app: FastifyInstance): Server {
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
    pingTimeout: 20000,      // Keeps Render proxy WebSocket connections alive
    pingInterval: 10000,
    maxHttpBufferSize: 1e6,  // 1MB max payload limit
  });

  ioInstance = io;

  // Broadcast time sync every 10 seconds
  if (timeSyncInterval) clearInterval(timeSyncInterval);
  timeSyncInterval = setInterval(() => {
    broadcastToTest('time-sync', {
      serverTime: Date.now(),
      iso: new Date().toISOString(),
      activeSockets: activeStudents.size,
    });
  }, 10000);
  timeSyncInterval.unref();

  io.on('connection', (socket: Socket) => {
    app.log.info({ socketId: socket.id }, '🔌 Client connected to Socket.io');

    // Auto-join global room on connection
    socket.join(GLOBAL_ROOM);

    // Task 1: Room joining handler for 'global', 'student-dashboard', 'admin-panel'
    socket.on('join-room', (roomName: string) => {
      const allowedRooms = [GLOBAL_ROOM, STUDENT_ROOM, ADMIN_ROOM, TEST_ROOM];
      if (allowedRooms.includes(roomName) || roomName.startsWith('team-')) {
        socket.join(roomName);
        app.log.info({ socketId: socket.id, room: roomName }, `Socket joined room: ${roomName}`);
      }
    });

    // Student identification & live test room joining
    socket.on('join-test-room', ({ studentId, testId }: { studentId?: string; testId?: string }) => {
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

    socket.on('register', ({ studentId, role }: { studentId: string; role?: string }) => {
      if (studentId) {
        activeStudents.set(studentId, socket.id);
        socketToStudent.set(socket.id, studentId);
        socket.join(role === 'admin' ? ADMIN_ROOM : STUDENT_ROOM);
      }
    });

    // Code draft sync
    socket.on('draft-update', (payload: { studentId?: string; codeDraft?: string; state?: any; testId?: string }) => {
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
    socket.on('heartbeat', (payload?: any) => {
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
              await Draft.findOneAndUpdate(
                { studentId, testId: draftData.testId || TEST_ROOM },
                {
                  studentId,
                  testId: draftData.testId || TEST_ROOM,
                  codeDraft: draftData.codeDraft || '',
                  state: draftData.state || {},
                  lastSavedAt: new Date(),
                },
                { upsert: true, new: true }
              );
            }
          } catch (err) {
            app.log.error({ err, studentId }, 'Draft auto-save error on disconnect');
          }
        });
      }
    });
  });

  return io;
}

export default setupSocketIO;
