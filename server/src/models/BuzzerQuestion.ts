import { Schema, model, Document, Model } from 'mongoose';

export interface IBuzzerQuestion {
  title: string;
  questionText: string;
  expectedAnswer?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBuzzerQuestionDocument extends IBuzzerQuestion, Document {}

export type IBuzzerQuestionModel = Model<IBuzzerQuestionDocument>;

const buzzerQuestionSchema = new Schema<IBuzzerQuestionDocument>(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    expectedAnswer: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const BuzzerQuestion = model<IBuzzerQuestionDocument, IBuzzerQuestionModel>(
  'BuzzerQuestion',
  buzzerQuestionSchema
);

export default BuzzerQuestion;
