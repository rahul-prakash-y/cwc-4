import { Schema, model } from 'mongoose';
const timelineDaySchema = new Schema({
    dayNumber: {
        type: Number,
        required: [true, 'Day number is required'],
        unique: true,
        min: 1,
        max: 7,
    },
    eliminationInfo: {
        type: String,
        required: [true, 'Elimination info is required'],
        trim: true,
    },
    theme: {
        type: String,
        required: [true, 'Theme is required'],
        trim: true,
    },
    daywiseName: {
        type: String,
        required: [true, 'Daywise name is required'],
        trim: true,
    },
}, {
    timestamps: true,
});
export const TimelineDay = model('TimelineDay', timelineDaySchema);
export default TimelineDay;
