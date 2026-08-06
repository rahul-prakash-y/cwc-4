import mongoose, { Schema } from 'mongoose';
const settingSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });
export const Setting = mongoose.model('Setting', settingSchema);
