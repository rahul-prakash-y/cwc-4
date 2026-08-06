import mongoose, { Schema } from 'mongoose';
const settingsSchema = new Schema({
    isGrandFinale: { type: Boolean, default: false },
}, { timestamps: true });
export const Settings = mongoose.model('Settings', settingsSchema);
