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
        select: false, // Hidden from default student queries — use .select('+correctAnswer') for grading
    },
    timeLimitSeconds: {
        type: Number,
        default: 0,
    },
    /**
     * Specific time limit in seconds for interactive tasks (e.g., Rapid Fire rounds).
     * Overrides the global daily task countdown when > 0.
     */
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
            // Strip correctAnswer from serialized JSON (student safety)
            // Backend grading routes use select('+correctAnswer') explicitly
            delete ret.correctAnswer;
            return ret;
        },
    },
});
// Compound indexes for fetching active and upcoming visible tasks
taskSchema.index({ visibility: 1, startTime: 1, endTime: 1 });
taskSchema.index({ visibility: 1, endTime: 1 });
// Index for interactive task type lookups
taskSchema.index({ type: 1, visibility: 1 });
export const Task = model('Task', taskSchema);
export default Task;
