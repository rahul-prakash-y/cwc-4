"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
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
exports.Task = (0, mongoose_1.model)('Task', taskSchema);
exports.default = exports.Task;
