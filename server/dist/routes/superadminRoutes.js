import { getAuditLogs, toggleBlockStatus, forceResetPassword, forceLogout, deleteUser, manageAdmins, getSecurityTargets, updateGlobalSettings, } from '../controllers/superadminController.js';
import { verifyJWT, isSuperAdmin } from '../middleware/auth.js';
export async function superadminRoutes(fastify) {
    // All SuperAdmin routes require JWT verification & SuperAdmin role enforcement
    fastify.addHook('preHandler', verifyJWT);
    fastify.addHook('preHandler', isSuperAdmin);
    // Task 3: Fetch paginated audit logs & threat telemetry
    fastify.get('/audit-logs', getAuditLogs);
    fastify.get('/threats', getAuditLogs);
    // Task 3: Toggle isBlocked status of student or team
    fastify.patch('/users/:id/block', toggleBlockStatus);
    fastify.patch('/teams/:id/block', toggleBlockStatus);
    // Task 3: Force reset password to default & set isFirstLogin: true
    fastify.post('/users/:id/reset-password', forceResetPassword);
    // Task 3: Force logout user (increments sessionVersion to invalidate JWT)
    fastify.patch('/users/:id/force-logout', forceLogout);
    fastify.patch('/teams/:id/force-logout', forceLogout);
    // Task 3: Delete user or team permanently with data cleanup
    fastify.delete('/users/:id', deleteUser);
    fastify.delete('/teams/:id', deleteUser);
    // Task 3: Manage standard 'admin' accounts (Create, list, update, revoke)
    fastify.get('/manage-admins', manageAdmins);
    fastify.post('/manage-admins', manageAdmins);
    fastify.delete('/manage-admins/:id', manageAdmins);
    // Security Center targets search helper
    fastify.get('/targets', getSecurityTargets);
    // Task 3: Update Global Singleton CMS Settings
    fastify.put('/settings/global', updateGlobalSettings);
}
export default superadminRoutes;
