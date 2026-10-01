import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'ALERT', 'BOOKING'],
      default: 'INFO',
    },
    category: {
      type: String,
      enum: ['inquiry', 'storage', 'security', 'system'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
