import { FastifySchema } from 'fastify';

export const registerTeamSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['teamName', 'leader'],
    additionalProperties: false,
    properties: {
      teamName: { type: 'string', minLength: 2, maxLength: 100 },
      themeColor: { type: 'string' },
      logoUrl: { type: 'string' },
      residenceType: { type: 'string', enum: ['Hosteller', 'Day Scholar'] },
      leader: {
        type: 'object',
        required: ['name', 'email', 'password'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 6, maxLength: 128 },
          phone: { type: 'string', maxLength: 30 },
        },
      },
      members: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'email'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email', maxLength: 255 },
            role: { type: 'string', maxLength: 50 },
          },
        },
      },
    },
  },
};

export const loginSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 1, maxLength: 128 },
    },
  },
};

export const registerAdminSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 6, maxLength: 128 },
      adminSecret: { type: 'string' },
    },
  },
};
