import { Schema, model } from 'mongoose';
const scoreDetailsSchema = new Schema({
    adv: { type: Number, default: 0, min: [0, 'Advantage points cannot be negative'] },
    main: { type: Number, default: 0, min: [0, 'Main task score cannot be negative'] },
    special: { type: Number, default: 0, min: [0, 'Special task score cannot be negative'] },
    total: { type: Number, default: 0, min: [0, 'Total score cannot be negative'] },
}, { _id: false });
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
        index: true,
    },
    dayNumber: {
        type: Number,
        default: 1,
        min: [1, 'Day number must be at least 1'],
        max: [7, 'Day number cannot exceed 7'],
        index: true,
    },
    day: {
        type: Number,
        default: 1,
        min: [1, 'Day must be at least 1'],
        max: [7, 'Day cannot exceed 7'],
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
    scores: {
        type: scoreDetailsSchema,
        default: () => ({ adv: 0, main: 0, special: 0, total: 0 }),
    },
    recordedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    adv: {
        type: Number,
        default: 0,
        min: [0, 'Advantage points cannot be negative'],
    },
    main: {
        type: Number,
        default: 0,
        min: [0, 'Main task score cannot be negative'],
    },
    special: {
        type: Number,
        default: 0,
        min: [0, 'Special task score cannot be negative'],
    },
    total: {
        type: Number,
        default: 0,
        min: [0, 'Total score cannot be negative'],
    },
    pointsEarned: {
        type: Number,
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
// Pre-save hook to calculate total automatically as adv + main + special and keep scores object synced
scoreSchema.pre('save', function (next) {
    const advVal = this.scores?.adv ?? this.adv ?? 0;
    const specialVal = this.scores?.special ?? this.special ?? 0;
    const rawTotal = this.scores?.total ?? this.total ?? this.pointsEarned ?? 0;
    let mainVal = this.scores?.main ?? this.main ?? 0;
    if (mainVal === 0 && rawTotal > (advVal + specialVal)) {
        mainVal = rawTotal - advVal - specialVal;
    }
    const computedTotal = Math.max(advVal + mainVal + specialVal, rawTotal);
    this.scores = {
        adv: advVal,
        main: mainVal,
        special: specialVal,
        total: computedTotal,
    };
    this.adv = advVal;
    this.main = mainVal;
    this.special = specialVal;
    this.total = computedTotal;
    this.pointsEarned = computedTotal;
    this.day = this.dayNumber || this.day || 1;
    this.dayNumber = this.day;
    if (!this.date) {
        this.date = new Date();
    }
    next();
});
// Compound index for unique score record per team per dayNumber
scoreSchema.index({ team: 1, dayNumber: 1 }, { unique: true });
// Compound index to ensure unique score record per team per task when task exists
scoreSchema.index({ team: 1, task: 1 }, { unique: true, sparse: true });
// Compound indexes for fast Leaderboard calculations and score aggregation
scoreSchema.index({ team: 1, pointsEarned: -1 });
scoreSchema.index({ pointsEarned: -1, team: 1 });
export const Score = model('Score', scoreSchema);
export default Score;
