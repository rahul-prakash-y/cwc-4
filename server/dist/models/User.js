import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required'],
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'superadmin'],
        default: 'student',
        required: true,
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
// Prevent passwordHash from being returned in JSON by default
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
    },
});
export const User = model('User', userSchema);
export default User;
