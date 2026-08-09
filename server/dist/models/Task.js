import { Schema, model } from 'mongoose';
/** Interactive task types that support auto-grading */
export const INTERACTIVE_TASK_TYPES = [
    'MCQ',
    'Rapid Fire',
    'Code Completion',
    'Output Prediction',
    'Treasure Hunt',
    'Puzzle',
];
const taskSchema = new Schema({
    dayNumber: {
        type: Number,
        min: 1,
        max: 7,
        index: true,
    },
    category: {
        type: String,
        enum: ['LUCKY BOOTH', 'GRAND CHALLENGE', 'FUN FAIR', 'DANGER ZONE', 'GOLDEN ZONE'],
        index: true,
    },
    taskDescription: {
        type: String,
        default: '',
        trim: true,
    },
    timeLimit: {
        type: String,
        default: '',
        trim: true,
    },
    title: {
        type: String,
        default: function () {
            return this.category || 'Task';
        },
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
        default: 'Main',
    },
    points: {
        type: Number,
        default: 100,
        min: [0, 'Points cannot be negative'],
    },
    startTime: {
        type: Date,
        default: () => new Date(),
    },
    endTime: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    visibility: {
        type: Boolean,
        default: true,
    },
    mcqOptions: {
        type: [String],
        default: [],
    },
    correctAnswer: {
        type: String,
        default: '',
        trim: true,
        select: false, // Hidden from default student queries
    },
    timeLimitSeconds: {
        type: Number,
        default: 0,
    },
    interactiveTimeLimit: {
        type: Number,
        default: 0,
        min: [0, 'Interactive time limit cannot be negative'],
    },
    testCases: [
        {
            input: { type: String, default: '' },
            expectedOutput: { type: String, required: true },
            isHidden: { type: Boolean, default: false },
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.correctAnswer;
            return ret;
        },
    },
});
// Indexes for timeline & performance
taskSchema.index({ dayNumber: 1, category: 1 });
taskSchema.index({ visibility: 1, startTime: 1, endTime: 1 });
taskSchema.index({ visibility: 1, endTime: 1 });
taskSchema.index({ type: 1, visibility: 1 });
export const Task = model('Task', taskSchema);
export default Task;
