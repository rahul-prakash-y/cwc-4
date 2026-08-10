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
  body: {
    type: 'object',
    required: ['status'],
    additionalProperties: false,
    properties: {
      status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected', 'Eliminated', 'Safe', 'Danger', 'Qualified'] },
    },
  },
};

export const eliminateTeamSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      teamId: { type: 'string' },
      id: { type: 'string' },
    },
  },
};

export const grantAdvantageSchema: FastifySchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      teamId: { type: 'string' },
      advantage: { type: 'string', minLength: 1, maxLength: 100 },
      quantity: { type: 'integer', minimum: 1, default: 1 },
      immunity: { type: 'boolean' },
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
            status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected', 'Eliminated', 'Safe', 'Danger', 'Qualified'] },
            totalPoints: { type: 'number' },
          },
        },
      },
    },
  },
};

const taskTypeEnum = [
  'Main',
  'Special',
  'MCQ',
  'Rapid Fire',
  'Code Completion',
  'Output Prediction',
  'Treasure Hunt',
  'Puzzle',
  'Boss Fight',
  'Bonus Quest',
  'Main Task',
  'Special Task',
];

export const createTaskSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'type', 'points'],
    additionalProperties: true,
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string' },
      type: { type: 'string', enum: taskTypeEnum },
      points: { type: 'number', minimum: 0 },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      visibility: { type: 'boolean' },
      mcqOptions: { type: 'array', items: { type: 'string' } },
      correctAnswer: { type: 'string' },
      timeLimitSeconds: { type: 'number', minimum: 0 },
      interactiveTimeLimit: { type: 'number', minimum: 0 },
    },
  },
};

export const updateTaskSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      taskId: { type: 'string' },
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    additionalProperties: true,
  },
};

export const deleteTaskSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      taskId: { type: 'string' },
      id: { type: 'string' },
    },
  },
};

export const createAnnouncementSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['message'],
    additionalProperties: true,
    properties: {
      message: { type: 'string', minLength: 1, maxLength: 2000 },
      pinned: { type: 'boolean' },
      author: { type: 'string', maxLength: 100 },
      sendEmailAlert: { type: 'boolean' },
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
