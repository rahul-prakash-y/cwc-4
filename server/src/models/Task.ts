import { Schema, model, Document, Model } from 'mongoose';

export type TaskType = 'Main' | 'Special' | 'MCQ';

export interface ITask {
  title: string;
  description?: string;
  type: TaskType;
  points: number;
  startTime: Date;
  endTime: Date;
  visibility: boolean;
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
      enum: ['Main', 'Special', 'MCQ'],
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
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITaskDocument, ITaskModel>('Task', taskSchema);
export default Task;
