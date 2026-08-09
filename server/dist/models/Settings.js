import mongoose, { Schema } from 'mongoose';
const settingsSchema = new Schema({
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
}, { timestamps: true });
export const Settings = mongoose.model('Settings', settingsSchema);
/**
 * Singleton Helper: Retrieves the single Global Settings document or initializes default.
 */
export async function getGlobalSettings() {
    let doc = await Settings.findOne().lean();
    if (!doc) {
        const created = await Settings.create({
            eventStartDate: new Date('2026-08-15T10:00:00.000Z'),
            currentSeason: 4,
            isRegistrationOpen: true,
            isLeaderboardVisible: true,
            heroBannerText: 'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
            isGrandFinale: false,
            eventMode: 'standard',
        });
        doc = created.toObject();
    }
    else if (!doc.eventMode) {
        const eventMode = doc.isGrandFinale ? 'finale' : 'standard';
        await Settings.updateOne({ _id: doc._id }, { $set: { eventMode } });
        doc.eventMode = eventMode;
    }
    return doc;
}
