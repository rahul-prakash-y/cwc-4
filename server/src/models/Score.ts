import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IScore {
  team: Types.ObjectId;
  task: Types.ObjectId;
  pointsEarned: number;
  advantagesUsed: string[];
  immunityStatus: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScoreDocument extends IScore, Document {}

export type IScoreModel = Model<IScoreDocument>;

const scoreSchema = new Schema<IScoreDocument>(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    pointsEarned: {
      type: Number,
      required: [true, 'Points earned is required'],
      default: 0,
      min: [0, 'Points earned cannot be negative'],
    },
    advantagesUsed: {
      type: [String],
      default: [],
    },
    immunityStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique score record per team per task
scoreSchema.index({ team: 1, task: 1 }, { unique: true });

// Compound indexes for fast Leaderboard calculations and score aggregation
scoreSchema.index({ team: 1, pointsEarned: -1 });
scoreSchema.index({ pointsEarned: -1, team: 1 });

export const Score = model<IScoreDocument, IScoreModel>('Score', scoreSchema);
export default Score;
