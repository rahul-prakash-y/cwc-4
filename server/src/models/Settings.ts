import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  eventStartDate: Date;
  currentSeason: number;
  isRegistrationOpen: boolean;
  isLeaderboardVisible: boolean;
  heroBannerText: string;
  isGrandFinale: boolean;
  eventMode: 'standard' | 'carnival' | 'finale';
  isTaskPortalApproved: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    eventStartDate: {
      type: Date,
      default: () => new Date('2026-08-15T10:00:00.000Z'),
    },
    currentSeason: { type: Number, default: 4 },
    isRegistrationOpen: { type: Boolean, default: true },
    isLeaderboardVisible: { type: Boolean, default: true },
    heroBannerText: {
      type: String,
      default: 'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
    },
    isGrandFinale: { type: Boolean, default: false },
    eventMode: {
      type: String,
      enum: ['standard', 'carnival', 'finale'],
      default: 'standard',
    },
    isTaskPortalApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

/**
 * Singleton Helper: Retrieves the single Global Settings document or initializes default.
 */
export async function getGlobalSettings(): Promise<any> {
  let doc: any = await Settings.findOne().lean();
  if (!doc) {
    const created = await Settings.create({
      eventStartDate: new Date('2026-08-15T10:00:00.000Z'),
      currentSeason: 4,
      isRegistrationOpen: true,
      isLeaderboardVisible: true,
      heroBannerText: 'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
      isGrandFinale: false,
      eventMode: 'standard',
      isTaskPortalApproved: true,
    });
    doc = created.toObject();
  } else if (!doc.eventMode) {
    const eventMode = doc.isGrandFinale ? 'finale' : 'standard';
    await Settings.updateOne({ _id: doc._id }, { $set: { eventMode, isTaskPortalApproved: doc.isTaskPortalApproved ?? true } });
    doc.eventMode = eventMode;
  }
  return doc;
}
