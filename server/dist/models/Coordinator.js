import { Schema, model } from 'mongoose';
const coordinatorSchema = new Schema({
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    type: { type: String, default: 'Student Coordinator' },
    order: { type: Number, default: 0 },
}, { timestamps: true });
export const Coordinator = model('Coordinator', coordinatorSchema);
export default Coordinator;
