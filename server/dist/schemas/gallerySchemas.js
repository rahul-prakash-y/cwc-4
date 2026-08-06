export const getGallerySchema = {
    description: 'Fetch gallery media items grouped by season or filtered',
    tags: ['Gallery'],
    querystring: {
        type: 'object',
        properties: {
            season: { type: 'string' },
            type: { type: 'string', enum: ['Photo', 'Video'] },
        },
    },
};
export const deleteGallerySchema = {
    description: 'Delete a gallery item by ID',
    tags: ['Admin', 'Gallery'],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        },
    },
};
