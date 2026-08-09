import { Schema, model } from 'mongoose';
const buzzerQuestionSchema = new Schema({
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
}, {
    timestamps: true,
});
export const BuzzerQuestion = model('BuzzerQuestion', buzzerQuestionSchema);
export default BuzzerQuestion;
