import { AuditLog } from '../models/AuditLog.js';
// In-memory state for Rapid Fire Buzzer
let buzzerQueue = [];
let buzzerUnlockTime = null;
let currentQuestion = null;
export function getBuzzerState() {
    return {
        buzzerQueue,
        buzzerUnlockTime,
        currentQuestion,
    };
}
export function registerBuzzerHandlers(io, socket, logger) {
    // 1. Send current state upon connection or explicit request
    socket.on('GET_BUZZER_STATE', () => {
        socket.emit('BUZZER_STATE', {
            buzzerQueue,
            buzzerUnlockTime,
            currentQuestion,
        });
    });
    // 2. Admin event: ADMIN_START_QUESTION
    socket.on('ADMIN_START_QUESTION', (payload) => {
        const questionId = payload?.questionId || payload?.id || null;
        currentQuestion = {
            id: questionId,
            title: payload?.title || 'Rapid Fire Question',
            questionText: payload?.questionText || payload?.title || '',
            expectedAnswer: payload?.expectedAnswer || '',
        };
        buzzerUnlockTime = Date.now() + 5000; // 5 seconds in the future
        buzzerQueue = [];
        if (logger) {
            logger.info({ buzzerUnlockTime, questionId, currentQuestion }, '🎪 ADMIN_START_QUESTION triggered');
        }
        // Broadcast QUESTION_DISPLAYED to all students and rooms
        io.emit('QUESTION_DISPLAYED', {
            buzzerUnlockTime,
            questionId: currentQuestion.id,
            title: currentQuestion.title,
            questionText: currentQuestion.questionText,
            timestamp: Date.now(),
        });
        // Broadcast empty queue
        io.to('admin-panel').emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
        io.emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
    });
    // 3. Student event: STUDENT_BUZZER_HIT
    socket.on('STUDENT_BUZZER_HIT', (payload) => {
        const hitTime = Date.now();
        // SECURITY CHECK: Reject hit if buzzer is locked or hit occurs before unlock time
        if (!buzzerUnlockTime || hitTime < buzzerUnlockTime) {
            if (logger) {
                logger.warn({ payload, hitTime, buzzerUnlockTime }, '⚠️ SECURITY REJECT: Early buzzer hit attempt');
            }
            socket.emit('BUZZER_REJECTED', {
                reason: 'Early hit! Buzzer is locked until countdown finishes.',
                buzzerUnlockTime,
            });
            return;
        }
        if (!payload || !payload.teamId) {
            socket.emit('BUZZER_REJECTED', { reason: 'Invalid team payload.' });
            return;
        }
        // Check duplicate team hit
        const alreadyBuzzed = buzzerQueue.some((entry) => entry.teamId === payload.teamId);
        if (alreadyBuzzed) {
            socket.emit('BUZZER_REJECTED', { reason: 'Team has already buzzed in this round.' });
            return;
        }
        // Calculate exact reaction time in milliseconds
        const reactionTimeMs = Math.max(0, hitTime - buzzerUnlockTime);
        const newEntry = {
            teamId: payload.teamId,
            teamName: payload.teamName || `Team ${payload.teamId.slice(-4)}`,
            timestamp: hitTime,
            reactionTimeMs,
        };
        buzzerQueue.push(newEntry);
        if (logger) {
            logger.info({ newEntry, position: buzzerQueue.length }, '⚡ STUDENT_BUZZER_HIT accepted');
        }
        // Broadcast BUZZER_QUEUE_UPDATED to admin-panel room and to all clients
        io.to('admin-panel').emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
        io.emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
        socket.emit('BUZZER_ACCEPTED', {
            position: buzzerQueue.length,
            entry: newEntry,
        });
    });
    // 4. Admin event: ADMIN_RESET_BUZZER
    socket.on('ADMIN_RESET_BUZZER', () => {
        buzzerQueue = [];
        buzzerUnlockTime = null;
        currentQuestion = null;
        if (logger) {
            logger.info('🔄 ADMIN_RESET_BUZZER triggered');
        }
        AuditLog.create({
            adminId: socket.user?.userId || 'admin',
            adminEmail: socket.user?.email || 'admin@cwc.com',
            action: 'BUZZER_RESET',
            details: { timestamp: Date.now() },
            timestamp: new Date(),
        }).catch(() => { });
        // Broadcast lock/reset event to all clients
        io.emit('BUZZER_RESET', { timestamp: Date.now() });
        io.to('admin-panel').emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
        io.emit('BUZZER_QUEUE_UPDATED', buzzerQueue);
    });
}
