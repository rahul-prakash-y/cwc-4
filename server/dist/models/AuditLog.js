import { Schema, model } from 'mongoose';
const auditLogSchema = new Schema({
    actorId: {
        type: Schema.Types.Mixed,
        default: null,
        ref: 'User',
        index: true,
    },
    actorRole: {
        type: String,
        default: 'anonymous',
        trim: true,
        index: true,
    },
    action: {
        type: String,
        required: [true, 'Action name is required'],
        trim: true,
        index: true,
    },
    resource: {
        type: String,
        trim: true,
        default: 'N/A',
    },
    ipAddress: {
        type: String,
        trim: true,
        index: true,
        default: '127.0.0.1',
    },
    userAgent: {
        type: String,
        trim: true,
        default: 'Unknown',
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    // Legacy fields for backward compatibility
    adminId: {
        type: Schema.Types.Mixed,
        default: null,
    },
    adminEmail: {
        type: String,
        trim: true,
    },
    targetId: {
        type: String,
        trim: true,
    },
    targetType: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, action: 1 });
auditLogSchema.index({ actorRole: 1 });
export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
