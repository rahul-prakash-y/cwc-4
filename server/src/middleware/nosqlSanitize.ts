import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Recursively sanitizes input objects by stripping keys starting with '$' or containing '.'
 * to prevent NoSQL operator injection attacks.
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitize(obj[key]);
    }
  }

  return obj;
}

export async function sanitizeNoSQLInject(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  if (request.body) {
    sanitize(request.body);
  }
  if (request.query) {
    sanitize(request.query);
  }
  if (request.params) {
    sanitize(request.params);
  }
}
