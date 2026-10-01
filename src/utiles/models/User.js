import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const SYSTEM_MODULES = [
  'dashboard',
  'events',
  'client_requests',
  'media',
  'categories',
  'settings',
  'notifications',
  'users',
  'logs',
];

const modulePermissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: SYSTEM_MODULES,
    },
    permissions: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SUB_ADMIN'],
      default: 'SUB_ADMIN',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    modules: {
      type: [modulePermissionSchema],
      default: function () {
        // If ADMIN, default to all permissions true
        if (this.role === 'ADMIN') {
          return SYSTEM_MODULES.map((m) => ({
            module: m,
            permissions: { view: true, edit: true, delete: true },
          }));
        }
        // Sub-admins default to false unless configured
        return SYSTEM_MODULES.map((m) => ({
          module: m,
          permissions: { view: false, edit: false, delete: false },
        }));
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper to check permission
userSchema.methods.hasPermission = function (moduleName, action = 'view') {
  if (this.role === 'ADMIN') return true;
  const mod = this.modules.find((m) => m.module === moduleName);
  if (!mod) return false;
  return Boolean(mod.permissions?.[action]);
};

export const User = mongoose.model('User', userSchema);
