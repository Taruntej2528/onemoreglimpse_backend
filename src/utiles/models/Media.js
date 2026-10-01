import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      default: 'image',
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
    },
    storageProvider: {
      type: String,
      enum: ['s3', 'azure', 'gcs', 'firebase', 'cloudinary', 'local'],
      default: 'local',
    },
    fileKey: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
    },
    isHeroActive: {
      type: Boolean,
      default: false,
    },
    videoId: {
      type: String,
      default: '',
    },
    poster: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: String,
      default: '16:9',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// If isHeroActive is set to true on a video or image, unset isHeroActive on other media of the same type
mediaSchema.pre('save', async function (next) {
  if (this.isModified('isHeroActive') && this.isHeroActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, type: this.type },
      { $set: { isHeroActive: false } }
    );
  }
  next();
});

export const Media = mongoose.model('Media', mediaSchema);
