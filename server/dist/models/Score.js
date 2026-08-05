"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Score = void 0;
const mongoose_1 = require("mongoose");
const scoreSchema = new mongoose_1.Schema({
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, 'Team reference is required'],
        index: true,
    },
    task: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task reference is required'],
        index: true,
    },
    pointsEarned: {
        type: Number,
        required: [true, 'Points earned is required'],
        default: 0,
        min: [0, 'Points earned cannot be negative'],
    },
    advantagesUsed: {
        type: [String],
        default: [],
    },
    immunityStatus: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Compound index to ensure unique score record per team per task
scoreSchema.index({ team: 1, task: 1 }, { unique: true });
exports.Score = (0, mongoose_1.model)('Score', scoreSchema);
exports.default = exports.Score;
