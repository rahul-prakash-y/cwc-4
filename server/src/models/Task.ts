import { Schema, model, Document, Model } from 'mongoose';

export type TaskType =
  | 'Main'
  | 'Special'
  | 'MCQ'
  | 'Rapid Fire'
  | 'Code Completion'
  | 'Output Prediction'
  | 'Treasure Hunt'
  | 'Puzzle';

export interface ITaskTestCase {
  input?: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ITask {
  title: string;
  description?: string;
  type: TaskType;
  points: number;
  startTime: Date;
  endTime: Date;
  visibility: boolean;
  mcqOptions?: string[];
  correctAnswer?: string;
  timeLimitSeconds?: number;
  testCases?: ITaskTestCase[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends ITask, Document {}

export type ITaskModel = Model<ITaskDocument>;

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'Main',
        'Special',
        'MCQ',
        'Rapid Fire',
        'Code Completion',
        'Output Prediction',
        'Treasure Hunt',
        'Puzzle',
      ],
      required: [true, 'Task type is required'],
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [0, 'Points cannot be negative'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    visibility: {
      type: Boolean,
      default: false,
    },
    mcqOptions: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: '',
      trim: true,
    },
    timeLimitSeconds: {
      type: Number,
      default: 0,
    },
    testCases: [
      {
        input: { type: String, default: '' },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fetching active and upcoming visible tasks
taskSchema.index({ visibility: 1, startTime: 1, endTime: 1 });
taskSchema.index({ visibility: 1, endTime: 1 });

export const Task = model<ITaskDocument, ITaskModel>('Task', taskSchema);
export default Task;
