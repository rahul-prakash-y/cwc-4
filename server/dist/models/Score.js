import { Schema, model } from 'mongoose';
const scoreSchema = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, 'Team reference is required'],
        index: true,
    },
    task: {
        type: Schema.Types.ObjectId,
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
// Compound indexes for fast Leaderboard calculations and score aggregation
scoreSchema.index({ team: 1, pointsEarned: -1 });
scoreSchema.index({ pointsEarned: -1, team: 1 });
export const Score = model('Score', scoreSchema);
export default Score;
