import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IDailyVoteLog {
  voterTeamId?: Types.ObjectId;
  targetTeamId: Types.ObjectId;
  voterType?: 'Team' | 'Admin';
  voterEmail?: string;
  date: string; // Format: YYYY-MM-DD
  votesCast: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDailyVoteLogDocument extends IDailyVoteLog, Document {}

export type IDailyVoteLogModel = Model<IDailyVoteLogDocument>;

const dailyVoteLogSchema = new Schema<IDailyVoteLogDocument>(
  {
    voterTeamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: false,
      index: true,
    },
    targetTeamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    voterType: {
      type: String,
      enum: ['Team', 'Admin'],
      default: 'Team',
    },
    voterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    votesCast: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for quick lookup & daily limit enforcement
dailyVoteLogSchema.index({ voterTeamId: 1, date: 1 });
dailyVoteLogSchema.index({ targetTeamId: 1, date: 1 });

export const DailyVoteLog = model<IDailyVoteLogDocument, IDailyVoteLogModel>('DailyVoteLog', dailyVoteLogSchema);
export const VoteLog = DailyVoteLog;

export default DailyVoteLog;
