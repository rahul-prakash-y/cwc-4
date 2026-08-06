import { Schema, model } from 'mongoose';
const announcementSchema = new Schema({
    message: {
        type: String,
        required: [true, 'Announcement message is required'],
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    author: {
        type: String,
        default: 'Carnival Admin',
    },
}, {
    timestamps: true,
});
export const Announcement = model('Announcement', announcementSchema);
export default Announcement;
