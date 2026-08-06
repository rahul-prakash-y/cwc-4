import { Schema, model } from 'mongoose';
const taskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    type: {
        type: String,
        enum: ['Main', 'Special', 'MCQ'],
        required: [true, 'Task type is required'],
    },
    points: {
        type: Number,
        required: [true, 'Points are required'],
        min: [0, 'Points cannot be negative'],
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
    },
    visibility: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Compound indexes for fetching active and upcoming visible tasks
taskSchema.index({ visibility: 1, startTime: 1, endTime: 1 });
taskSchema.index({ visibility: 1, endTime: 1 });
export const Task = model('Task', taskSchema);
export default Task;
