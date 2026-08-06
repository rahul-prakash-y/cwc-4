import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  isGrandFinale: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    isGrandFinale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
