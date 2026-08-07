import { AuditLog } from '../models/AuditLog.js';

/**
 * Log an administrative/superadmin action to the AuditLog database collection.
 * @param req FastifyRequest object containing user auth context and IP info
 * @param action Action code identifier (e.g. 'SCORE_UPDATED', 'TASK_CREATED')
 * @param targetId Optional ID of the resource or user being modified
 * @param details Optional object containing parameters, diffs, or metadata
 */
export async function logAdminAction(
  req: any,
  action: string,
  targetId?: any,
  details?: Record<string, any>
): Promise<void> {
  try {
    const user = req?.user;
    const adminId = user?.id || user?._id || user?.userId || 'SYSTEM';
    const adminEmail = user?.email || 'system@cwc.com';
    const ipAddress = req?.ip || req?.raw?.socket?.remoteAddress || req?.headers?.['x-forwarded-for'] || '';

    await AuditLog.create({
      adminId,
      adminEmail,
      action,
      targetId: targetId ? String(targetId) : undefined,
      details: details || {},
      ipAddress: String(ipAddress),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(`❌ Audit Logger error [Action: ${action}]:`, error);
  }
}

export default logAdminAction;
