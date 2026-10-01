import mongoose from 'mongoose';

const clientRequestSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    partnerName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    eventType: {
      type: String,
      default: 'Royal Wedding Celebration',
    },
    eventDate: {
      type: String,
      default: '',
    },
    eventCity: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: '',
    },
    guestCount: {
      type: Number,
      default: 0,
    },
    budget: {
      type: String,
      default: '',
    },
    selectedPackage: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONFIRMED', 'DECLINED'],
      default: 'NEW',
    },
    source: {
      type: String,
      default: 'enquiry_form',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentType: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ClientRequest = mongoose.model('ClientRequest', clientRequestSchema);
