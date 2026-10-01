import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    couple: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['package', 'event', 'event_type'],
      default: 'event',
    },
    eventType: {
      type: String,
      default: 'Royal Muhurtham & Grand Reception',
    },
    date: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'India',
    },
    package: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Upcoming', // 'Upcoming', 'In Progress', 'Post-Production', 'Completed'
    },
    crew: [
      {
        name: { type: String, default: '' },
        role: { type: String, default: '' },
      },
    ],
    deliverables: {
      rawStatus: { type: String, default: 'Scheduled' },
      filmProgress: { type: Number, default: 0 },
      photosEdited: { type: Number, default: 0 },
      totalExpected: { type: Number, default: 1000 },
      albumApproved: { type: Boolean, default: false },
    },
    coverImage: {
      type: String,
      default: '',
    },

    // Package-specific fields
    badge: {
      type: String,
      default: 'Curated',
    },
    price: {
      type: Number,
      default: 0,
    },
    idealFor: {
      type: String,
      default: '',
    },
    team: {
      type: String,
      default: '',
    },
    inclusions: {
      type: [String],
      default: [],
    },
    hours: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: ensure name is populated
eventSchema.pre('save', function (next) {
  if (!this.name) {
    this.name = this.couple || this.eventType || 'Wedding Celebration';
  }
  if (!this.couple && this.type === 'event') {
    this.couple = this.name;
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);

