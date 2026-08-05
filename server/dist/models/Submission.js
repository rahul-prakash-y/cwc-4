"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = require("mongoose");
const submissionSchema = new mongoose_1.Schema({
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, 'Team ID is required'],
        index: true,
    },
    task: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task ID is required'],
        index: true,
    },
    submittedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Submitted by User ID is required'],
    },
    githubUrl: {
        type: String,
        trim: true,
        default: '',
    },
    fileUrl: {
        type: String,
        trim: true,
        default: '',
    },
    fileType: {
        type: String,
        enum: ['github', 'pdf', 'image', 'file'],
        default: 'github',
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    status: {
        type: String,
        enum: ['Submitted', 'Evaluated', 'Rejected'],
        default: 'Submitted',
    },
    scoreAwarded: {
        type: Number,
        default: 0,
    },
    feedback: {
        type: String,
        default: '',
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Index to easily query team submissions per task
submissionSchema.index({ team: 1, task: 1 });
exports.Submission = (0, mongoose_1.model)('Submission', submissionSchema);
exports.default = exports.Submission;
