import { createAuditLog } from './audit.js';

/**
 * Legacy audit logger wrapper for backwards compatibility across existing controllers.
 * Delegates to the unified `createAuditLog` helper.
 */
export async function logAdminAction(
  req: any,
  action: string,
  targetId?: any,
  details?: Record<string, any>
): Promise<void> {
  const mergedDetails = {
    ...(details || {}),
    ...(targetId ? { targetId: String(targetId) } : {}),
  };

  createAuditLog(
    req,
    action,
    mergedDetails,
    req?.user?.userId || req?.user?.id || req?.user?._id,
    req?.user?.role || 'admin',
    req?.raw?.url || req?.url || 'N/A'
  );
}

export default logAdminAction;
