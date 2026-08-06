import { Schema, model } from 'mongoose';
const gallerySchema = new Schema({
    title: {
        type: String,
        required: [true, 'Media title is required'],
        trim: true,
    },
    url: {
        type: String,
        required: [true, 'Media URL is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['Photo', 'Video'],
        required: [true, 'Media type must be Photo or Video'],
    },
    seasonNumber: {
        type: Number,
        required: [true, 'Season number is required'],
        min: [1, 'Season number must be at least 1'],
    },
    publicId: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    thumbnailUrl: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
// Index for efficient querying by season and sorting by date
gallerySchema.index({ seasonNumber: 1, createdAt: -1 });
export const Gallery = model('Gallery', gallerySchema);
export default Gallery;
