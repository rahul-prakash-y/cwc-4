import { Schema, model } from 'mongoose';
const auditLogSchema = new Schema({
    adminId: {
        type: Schema.Types.Mixed,
        required: [true, 'Admin ID is required'],
        ref: 'User',
    },
    adminEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    action: {
        type: String,
        required: [true, 'Action name is required'],
        trim: true,
        index: true,
    },
    targetId: {
        type: String,
        trim: true,
    },
    targetType: {
        type: String,
        trim: true,
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
});
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ adminEmail: 1, action: 1 });
export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
