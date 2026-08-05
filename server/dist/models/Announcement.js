"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const mongoose_1 = require("mongoose");
const announcementSchema = new mongoose_1.Schema({
    message: {
        type: String,
        required: [true, 'Announcement message is required'],
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    author: {
        type: String,
        default: 'Carnival Admin',
    },
}, {
    timestamps: true,
});
exports.Announcement = (0, mongoose_1.model)('Announcement', announcementSchema);
exports.default = exports.Announcement;
