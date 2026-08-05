import { Schema, model, Document, Model } from 'mongoose';

export interface IAnnouncement {
  message: string;
  timestamp: Date;
  pinned: boolean;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAnnouncementDocument extends IAnnouncement, Document {}

export type IAnnouncementModel = Model<IAnnouncementDocument>;

const announcementSchema = new Schema<IAnnouncementDocument>(
  {
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      default: 'Carnival Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = model<IAnnouncementDocument, IAnnouncementModel>(
  'Announcement',
  announcementSchema
);
export default Announcement;
