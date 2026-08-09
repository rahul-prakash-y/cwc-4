import { AuditLog } from '../models/AuditLog.js';
/**
 * Asynchronously logs an audit or security threat event to MongoDB.
 * Non-blocking: Uses Promise.resolve().then(...) to ensure zero latency impact on API responses.
 *
 * @param req FastifyRequest object or mock request object
 * @param action Action string (e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'RATE_LIMIT_EXCEEDED', 'SECURITY_THREAT', 'TASK_CREATED')
 * @param details Object containing request body diff, attempted credentials, or error context
 * @param actorIdInput Explicit actor ID override if request.user is unavailable
 * @param actorRoleInput Explicit actor role override ('student', 'admin', 'superadmin', 'system', 'anonymous')
 * @param resourceInput Affected API endpoint or database resource name
 */
export function createAuditLog(req, action, details = {}, actorIdInput, actorRoleInput, resourceInput) {
    Promise.resolve()
        .then(async () => {
        const user = req?.user;
        const actorId = actorIdInput ||
            user?.userId ||
            user?.id ||
            user?._id ||
            null;
        const actorRole = actorRoleInput ||
            user?.role ||
            'anonymous';
        // Extract client real IP address with proxy support (Cloudflare / Nginx headers)
        let rawIp = req?.ip ||
            req?.headers?.['cf-connecting-ip'] ||
            req?.headers?.['x-real-ip'] ||
            (Array.isArray(req?.headers?.['x-forwarded-for'])
                ? req.headers['x-forwarded-for'][0]
                : req?.headers?.['x-forwarded-for']?.split(',')[0]) ||
            req?.raw?.socket?.remoteAddress ||
            '127.0.0.1';
        if (rawIp.includes('::ffff:')) {
            rawIp = rawIp.replace('::ffff:', '');
        }
        const ipAddress = String(rawIp).trim();
        const userAgent = req?.headers?.['user-agent'] || 'Unknown';
        const resource = resourceInput ||
            req?.raw?.url ||
            req?.url ||
            'N/A';
        await AuditLog.create({
            actorId,
            actorRole,
            action,
            resource,
            ipAddress,
            userAgent,
            details: details || {},
            timestamp: new Date(),
            // Populate legacy backward-compatibility fields
            adminId: actorId,
            adminEmail: user?.email || details?.email || details?.attemptedEmail || undefined,
            targetId: details?.targetId || details?.taskId || details?.teamId || undefined,
            targetType: details?.targetType || undefined,
        });
    })
        .catch((error) => {
        console.error(`❌ AuditLogger Error [Action: ${action}]:`, error);
    });
}
export default createAuditLog;
