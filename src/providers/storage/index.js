import { LocalProvider } from './local.provider.js';
import { S3Provider } from './s3.provider.js';
import { AzureProvider } from './azure.provider.js';
import { GCSProvider } from './gcs.provider.js';
import { FirebaseProvider } from './firebase.provider.js';
import { CloudinaryProvider } from './cloudinary.provider.js';
import { Settings } from '../../utiles/models/Settings.js';
import { ENV } from '../../config/env.js';

const providers = {
  local: LocalProvider,
  s3: S3Provider,
  azure: AzureProvider,
  gcs: GCSProvider,
  firebase: FirebaseProvider,
  cloudinary: CloudinaryProvider,
};

/**
 * Get active storage provider from Settings in DB, falling back to ENV or Local
 */
export const getActiveStorageProvider = async () => {
  try {
    const settings = await Settings.findOne({ isDefault: true });
    const activeKey = settings?.storage?.activeProvider || ENV.ACTIVE_STORAGE_PROVIDER || 'local';
    return providers[activeKey] || LocalProvider;
  } catch {
    const activeKey = ENV.ACTIVE_STORAGE_PROVIDER || 'local';
    return providers[activeKey] || LocalProvider;
  }
};

/**
 * Get a specific storage provider by key
 */
export const getStorageProvider = (providerKey = 'local') => {
  return providers[providerKey] || LocalProvider;
};

export {
  LocalProvider,
  S3Provider,
  AzureProvider,
  GCSProvider,
  FirebaseProvider,
  CloudinaryProvider,
};
