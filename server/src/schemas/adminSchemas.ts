import { FastifySchema } from 'fastify';

const objectIdPattern = '^[0-9a-fA-F]{24}$';

export const toggleGrandFinaleSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      isGrandFinale: { type: 'boolean' },
    },
  },
};

export const updateTeamStatusSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    additionalProperties: false,
    properties: {
      status: { type: 'string', enum: ['Pending', 'Approved', 'Eliminated', 'Safe', 'Danger', 'Qualified'] },
    },
  },
};

export const eliminateTeamSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string', pattern: objectIdPattern },
    },
  },
};

export const grantAdvantageSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string', minLength: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['advantage'],
    additionalProperties: false,
    properties: {
      advantage: { type: 'string', minLength: 1, maxLength: 100 },
      quantity: { type: 'integer', minimum: 1, default: 1 },
    },
  },
};

export const setTeamImmunitySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string', pattern: objectIdPattern },
    },
  },
  body: {
    type: 'object',
    required: ['immunity'],
    additionalProperties: false,
    properties: {
      immunity: { type: 'boolean' },
    },
  },
};

export const updateScoresBatchSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['scores'],
    additionalProperties: false,
    properties: {
      scores: {
        type: 'array',
        items: {
          type: 'object',
          required: ['teamId'],
          properties: {
            teamId: { type: 'string', pattern: objectIdPattern },
            mainTaskScore: { type: 'number', minimum: 0 },
            specialTaskScore: { type: 'number', minimum: 0 },
            advantage: { type: 'string' },
            immunity: { type: 'boolean' },
            elimination: { type: 'boolean' },
            status: { type: 'string', enum: ['Pending', 'Approved', 'Eliminated', 'Safe', 'Danger'] },
            totalPoints: { type: 'number' },
          },
        },
      },
    },
  },
};

export const createTaskSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'type', 'points', 'startTime', 'endTime'],
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string' },
      type: { type: 'string', enum: ['Main', 'Special', 'MCQ'] },
      points: { type: 'number', minimum: 0 },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      visibility: { type: 'boolean' },
    },
  },
};

export const updateTaskSchema: FastifySchema = {
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
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string' },
      type: { type: 'string', enum: ['Main', 'Special', 'MCQ'] },
      points: { type: 'number', minimum: 0 },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      visibility: { type: 'boolean' },
    },
  },
};

export const deleteTaskSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['taskId'],
    properties: {
      taskId: { type: 'string', pattern: objectIdPattern },
    },
  },
};

export const createAnnouncementSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['message'],
    additionalProperties: false,
    properties: {
      message: { type: 'string', minLength: 1, maxLength: 2000 },
      pinned: { type: 'boolean' },
      author: { type: 'string', maxLength: 100 },
    },
  },
};

export const deleteAnnouncementSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['announcementId'],
    properties: {
      announcementId: { type: 'string', pattern: objectIdPattern },
    },
  },
};
