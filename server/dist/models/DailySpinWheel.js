import mongoose, { Schema } from 'mongoose';
const dailySpinWheelSchema = new Schema({
    date: { type: String, required: true, index: true },
    dayNumber: { type: Number, required: true, default: 1 },
    approvedTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    approvedTeamName: { type: String },
    isSpun: { type: Boolean, default: false },
    advantageWon: { type: String },
    bonusPoints: { type: Number, default: 0 },
    spunAt: { type: Date },
    approvedBy: { type: String },
    approvedAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const DailySpinWheel = mongoose.model('DailySpinWheel', dailySpinWheelSchema);
