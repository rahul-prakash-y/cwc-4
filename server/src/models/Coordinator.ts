import { Schema, model, Document } from 'mongoose';

export interface ICoordinator extends Document {
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  type: 'faculty' | 'student';
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const coordinatorSchema = new Schema<ICoordinator>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    type: { type: String, enum: ['faculty', 'student'], default: 'faculty' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coordinator = model<ICoordinator>('Coordinator', coordinatorSchema);
export default Coordinator;
