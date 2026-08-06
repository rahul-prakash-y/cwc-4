import { Schema, model } from 'mongoose';
const attendanceSchema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, 'Team ID is required'],
    },
    dayNumber: {
        type: Number,
        required: [true, 'Day number is required'],
        min: 1,
        max: 10,
    },
    memberIdsPresent: {
        type: [String],
        default: [],
    },
    isTeamPresent: {
        type: Boolean,
        default: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Enforce unique attendance record per team per day
attendanceSchema.index({ teamId: 1, dayNumber: 1 }, { unique: true });
export const Attendance = model('Attendance', attendanceSchema);
export default Attendance;
