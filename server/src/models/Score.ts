import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IScore {
  team: Types.ObjectId;
  task?: Types.ObjectId;
  day?: number;
  adv: number;
  main: number;
  special: number;
  total: number;
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
      index: true,
    },
    day: {
      type: Number,
      default: 1,
      min: [1, 'Day must be at least 1'],
    },
    adv: {
      type: Number,
      default: 0,
      min: [0, 'Advantage points cannot be negative'],
    },
    main: {
      type: Number,
      default: 0,
      min: [0, 'Main task score cannot be negative'],
    },
    special: {
      type: Number,
      default: 0,
      min: [0, 'Special task score cannot be negative'],
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total score cannot be negative'],
    },
    pointsEarned: {
      type: Number,
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

// Pre-save hook to calculate total automatically as adv + main + special
scoreSchema.pre('save', function (next) {
  this.adv = this.adv || 0;
  this.main = this.main || 0;
  this.special = this.special || 0;
  this.total = this.adv + this.main + this.special;
  this.pointsEarned = this.total;
  next();
});

// Compound index to ensure unique score record per team per task when task exists
scoreSchema.index({ team: 1, task: 1 }, { unique: true, sparse: true });

// Compound indexes for fast Leaderboard calculations and score aggregation
scoreSchema.index({ team: 1, pointsEarned: -1 });
scoreSchema.index({ pointsEarned: -1, team: 1 });

export const Score = model<IScoreDocument, IScoreModel>('Score', scoreSchema);
export default Score;
