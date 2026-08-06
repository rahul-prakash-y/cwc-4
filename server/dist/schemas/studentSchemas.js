const objectIdPattern = '^[0-9a-fA-F]{24}$';
export const submitTaskSchema = {
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            textAnswer: { type: 'string', maxLength: 10000 },
            content: { type: 'string', maxLength: 10000 },
            githubUrl: { type: 'string', maxLength: 1000 },
            fileUrl: { type: 'string', maxLength: 1000 },
            fileType: { type: 'string', enum: ['github', 'pdf', 'image', 'file', 'text'] },
            notes: { type: 'string', maxLength: 2000 },
            advantageUsed: { type: 'string', maxLength: 100 },
        },
    },
};
export const saveDraftSchema = {
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            content: { type: 'string', maxLength: 10000 },
            code: { type: 'string', maxLength: 10000 },
            textAnswer: { type: 'string', maxLength: 10000 },
            githubUrl: { type: 'string', maxLength: 1000 },
            fileUrl: { type: 'string', maxLength: 1000 },
            notes: { type: 'string', maxLength: 2000 },
        },
    },
};
export const useAdvantageSchema = {
    body: {
        type: 'object',
        required: ['advantage'],
        additionalProperties: false,
        properties: {
            advantage: { type: 'string', minLength: 1, maxLength: 100 },
            taskId: { type: 'string', pattern: objectIdPattern },
        },
    },
};
