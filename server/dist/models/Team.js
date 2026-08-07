import { Schema, model } from 'mongoose';
const advantageSchema = new Schema({
    advantage: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    grantedAt: { type: Date, default: Date.now },
}, { _id: false });
const leaderSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const memberSchema = new Schema({
    name: { type: String, required: [true, 'Member name is required'], trim: true },
    rollNo: { type: String, required: [true, 'Member roll number is required'], trim: true },
    deptMailId: { type: String, required: [true, 'Member department mail ID is required'], lowercase: true, trim: true },
    phone: { type: String, required: [true, 'Member phone number is required'], trim: true },
    gender: {
        type: String,
        required: [true, 'Member gender is required'],
        enum: ['Male', 'Female', 'Other'],
    },
    residenceType: {
        type: String,
        required: [true, 'Member residence type is required'],
        enum: ['Hosteller', 'DayScholar'],
    },
    email: { type: String, lowercase: true, trim: true, default: '' },
    rollNumber: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: 'Member' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });
const teamSchema = new Schema({
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
        validate: [
            {
                validator: (val) => Array.isArray(val) && val.length === 4,
                message: 'Every team MUST contain exactly 4 complete member profile objects.',
            },
        ],
        required: [true, 'Team members are required'],
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
        enum: ['Pending', 'Approved', 'Eliminated', 'Safe', 'Danger', 'Qualified'],
        default: 'Pending',
        required: true,
    },
    residenceType: {
        type: String,
        enum: ['Hosteller', 'DayScholar', 'Day Scholar'],
        default: 'Hosteller',
    },
    advantages: {
        type: [advantageSchema],
        default: [],
    },
    immunity: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    totalPublicVotes: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
export const Team = model('Team', teamSchema);
export default Team;
