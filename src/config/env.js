import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prazna_photography',

  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'prazna_super_secret_jwt_key_2026_fineart_cinema',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Active Storage Provider: 'local' | 'cloudinary' | 's3' | 'azure' | 'gcs' | 'firebase'
  ACTIVE_STORAGE_PROVIDER: process.env.ACTIVE_STORAGE_PROVIDER || 'local',

  // AWS S3
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    REGION: process.env.AWS_REGION || 'ap-south-1',
    BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'prazna-photography-bucket',
    CUSTOM_DOMAIN: process.env.AWS_CUSTOM_DOMAIN || '',
  },

  // Azure Blob Storage
  AZURE: {
    CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'prazna-media',
    ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
    ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
    CUSTOM_DOMAIN: process.env.AZURE_CUSTOM_DOMAIN || '',
  },

  // Google Cloud Storage
  GCS: {
    PROJECT_ID: process.env.GCS_PROJECT_ID || '',
    CLIENT_EMAIL: process.env.GCS_CLIENT_EMAIL || '',
    PRIVATE_KEY: (process.env.GCS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'prazna-photography-bucket',
    CUSTOM_DOMAIN: process.env.GCS_CUSTOM_DOMAIN || '',
  },

  // Firebase Storage
  FIREBASE: {
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  },

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    FOLDER: process.env.CLOUDINARY_FOLDER || 'prazna-photography',
  },

  // Local Storage
  LOCAL: {
    UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    BASE_URL: process.env.LOCAL_BASE_URL || 'http://localhost:5000/uploads',
  },
};
