import { FastifySchema } from 'fastify';

export const registerTeamSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['teamName', 'members'],
    additionalProperties: false,
    properties: {
      teamName: { type: 'string', minLength: 2, maxLength: 100 },
      themeColor: { type: 'string' },
      logoUrl: { type: 'string' },
      residenceType: { type: 'string' },
      leader: {
        type: 'object',
        additionalProperties: true,
      },
      members: {
        type: 'array',
        minItems: 4,
        maxItems: 4,
        items: {
          type: 'object',
          required: ['name', 'rollNo', 'deptMailId', 'phone', 'gender', 'residenceType'],
          additionalProperties: true,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            rollNo: { type: 'string', minLength: 1, maxLength: 50 },
            deptMailId: { type: 'string', format: 'email', maxLength: 255 },
            phone: { type: 'string', minLength: 5, maxLength: 30 },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            residenceType: { type: 'string', enum: ['Hosteller', 'DayScholar', 'Day Scholar'] },
            email: { type: 'string' },
            rollNumber: { type: 'string' },
            role: { type: 'string' },
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

export const changePasswordSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['oldPassword', 'newPassword'],
    additionalProperties: false,
    properties: {
      oldPassword: { type: 'string', minLength: 1, maxLength: 128 },
      newPassword: { type: 'string', minLength: 6, maxLength: 128 },
    },
  },
};

