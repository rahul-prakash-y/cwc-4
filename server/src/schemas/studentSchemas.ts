import { FastifySchema } from 'fastify';

const objectIdPattern = '^[0-9a-fA-F]{24}$';

export const submitTaskSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['taskId'],
    properties: {
      taskId: { type: 'string', pattern: objectIdPattern },
    },
  },
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      githubUrl: { type: 'string', maxLength: 1000 },
      fileUrl: { type: 'string', maxLength: 1000 },
      fileType: { type: 'string', enum: ['github', 'pdf', 'image', 'file'] },
      notes: { type: 'string', maxLength: 2000 },
    },
  },
};
