import {
  UserPayload,
  generateToken,
  verifyJWT,
  authenticate,
  isAdmin,
  isSuperAdmin,
  isStudent,
  logAudit,
  auditLogger,
} from '../src/middleware/auth.js';

export {
  UserPayload,
  generateToken,
  verifyJWT,
  authenticate,
  isAdmin,
  isSuperAdmin,
  isStudent,
  logAudit,
  auditLogger,
};

export default {
  generateToken,
  verifyJWT,
  authenticate,
  isAdmin,
  isSuperAdmin,
  isStudent,
  logAudit,
  auditLogger,
};
