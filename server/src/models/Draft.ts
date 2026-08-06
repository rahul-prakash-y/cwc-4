import { Schema, model, Document, Model } from 'mongoose';

export interface IDraft {
  studentId: string;
  testId: string;
  codeDraft?: string;
  state?: Record<string, any>;
  lastSavedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDraftDocument extends IDraft, Document {}
export type IDraftModel = Model<IDraftDocument>;

const draftSchema = new Schema<IDraftDocument>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      index: true,
    },
    testId: {
      type: String,
      default: 'test-room-season4',
      index: true,
    },
    codeDraft: {
      type: String,
      default: '',
    },
    state: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup per student per test
draftSchema.index({ studentId: 1, testId: 1 }, { unique: true });

export const Draft = model<IDraftDocument, IDraftModel>('Draft', draftSchema);
export default Draft;
