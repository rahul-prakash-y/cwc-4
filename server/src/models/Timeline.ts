import { Schema, model, Document, Model } from 'mongoose';

export interface ITimelineDay {
  dayNumber: number;
  eliminationInfo: string;
  theme: string;
  daywiseName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITimelineDayDocument extends ITimelineDay, Document {}
export type ITimelineDayModel = Model<ITimelineDayDocument>;

const timelineDaySchema = new Schema<ITimelineDayDocument>(
  {
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
  },
  {
    timestamps: true,
  }
);

export const TimelineDay = model<ITimelineDayDocument, ITimelineDayModel>('TimelineDay', timelineDaySchema);
export default TimelineDay;
