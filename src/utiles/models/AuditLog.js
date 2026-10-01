import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      uppercase: true,
    },
    url: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'Guest',
    },
    userRole: {
      type: String,
      default: 'ANONYMOUS',
    },
    action: {
      type: String,
      default: 'HTTP_REQUEST',
    },
    module: {
      type: String,
      default: 'general',
    },
    statusCode: {
      type: Number,
      required: true,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    responseSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for high performance log querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ userEmail: 1 });
auditLogSchema.index({ statusCode: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
