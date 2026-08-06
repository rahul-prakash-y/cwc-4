import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IAttendance {
  teamId: Types.ObjectId;
  dayNumber: number;
  memberIdsPresent: string[];
  isTeamPresent: boolean;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAttendanceDocument extends IAttendance, Document {}

export type IAttendanceModel = Model<IAttendanceDocument>;

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
    },
    dayNumber: {
      type: Number,
      required: [true, 'Day number is required'],
      min: 1,
      max: 10,
    },
    memberIdsPresent: {
      type: [String],
      default: [],
    },
    isTeamPresent: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique attendance record per team per day
attendanceSchema.index({ teamId: 1, dayNumber: 1 }, { unique: true });

export const Attendance = model<IAttendanceDocument, IAttendanceModel>('Attendance', attendanceSchema);
export default Attendance;
