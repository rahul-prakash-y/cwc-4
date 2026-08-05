import { Schema, model, Document, Model, Types } from 'mongoose';

export type SubmissionStatus = 'Submitted' | 'Evaluated' | 'Rejected';
export type SubmissionFileType = 'github' | 'pdf' | 'image' | 'file';

export interface ISubmission {
  team: Types.ObjectId;
  task: Types.ObjectId;
  submittedBy: Types.ObjectId;
  githubUrl?: string;
  fileUrl?: string;
  fileType?: SubmissionFileType;
  notes?: string;
  status: SubmissionStatus;
  scoreAwarded?: number;
  feedback?: string;
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubmissionDocument extends ISubmission, Document {}

export type ISubmissionModel = Model<ISubmissionDocument>;

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitted by User ID is required'],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['github', 'pdf', 'image', 'file'],
      default: 'github',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Evaluated', 'Rejected'],
      default: 'Submitted',
    },
    scoreAwarded: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to easily query team submissions per task
submissionSchema.index({ team: 1, task: 1 });

export const Submission = model<ISubmissionDocument, ISubmissionModel>(
  'Submission',
  submissionSchema
);
export default Submission;
