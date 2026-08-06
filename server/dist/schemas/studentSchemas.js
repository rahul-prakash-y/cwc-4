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
export const submitInteractiveTaskSchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' },
        },
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            answer: { type: 'string', maxLength: 5000 },
            selectedOption: { type: 'string', maxLength: 500 },
            code: { type: 'string', maxLength: 50000 },
            testResults: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        input: { type: 'string' },
                        actualOutput: { type: 'string' },
                    },
                },
            },
            advantageUsed: { type: 'string', maxLength: 100 },
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
