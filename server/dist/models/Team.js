"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = require("mongoose");
const advantageSchema = new mongoose_1.Schema({
    advantage: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    grantedAt: { type: Date, default: Date.now },
}, { _id: false });
const leaderSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const memberSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, trim: true, default: 'Member' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const teamSchema = new mongoose_1.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true,
    },
    leader: {
        type: leaderSchema,
        required: [true, 'Leader details are required'],
    },
    members: {
        type: [memberSchema],
        default: [],
    },
    themeColor: {
        type: String,
        default: '#FF0055', // Vibrant Carnival default color
        trim: true,
    },
    logoUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Eliminated'],
        default: 'Pending',
        required: true,
    },
    advantages: {
        type: [advantageSchema],
        default: [],
    },
    immunity: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Team = (0, mongoose_1.model)('Team', teamSchema);
exports.default = exports.Team;
