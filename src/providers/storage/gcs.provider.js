import { Storage } from '@google-cloud/storage';
import path from 'path';
import { ENV } from '../../config/env.js';

let gcsStorage = null;

const getGcsStorage = () => {
  if (!gcsStorage) {
    if (ENV.GCS.PROJECT_ID && ENV.GCS.CLIENT_EMAIL && ENV.GCS.PRIVATE_KEY) {
      gcsStorage = new Storage({
        projectId: ENV.GCS.PROJECT_ID,
        credentials: {
          client_email: ENV.GCS.CLIENT_EMAIL,
          private_key: ENV.GCS.PRIVATE_KEY,
        },
      });
    } else {
      throw new Error('[GCS Provider] Google Cloud Storage credentials are not fully configured.');
    }
  }
  return gcsStorage;
};

export const GCSProvider = {
  name: 'gcs',

  async upload(file, options = {}) {
    const storage = getGcsStorage();
    const bucket = storage.bucket(ENV.GCS.BUCKET_NAME);

    const ext = path.extname(file.originalname) || '';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folder = options.folder || 'portfolio';
    const destination = `${folder}/${uniqueSuffix}${ext}`;
    const fileBlob = bucket.file(destination);

    const body = file.buffer || (file.path ? await import('fs').then((fs) => fs.promises.readFile(file.path)) : null);

    await fileBlob.save(body, {
      contentType: file.mimetype,
      resumable: false,
    });

    const publicUrl = ENV.GCS.CUSTOM_DOMAIN
      ? `https://${ENV.GCS.CUSTOM_DOMAIN}/${destination}`
      : `https://storage.googleapis.com/${ENV.GCS.BUCKET_NAME}/${destination}`;

    return {
      provider: 'gcs',
      url: publicUrl,
      fileKey: destination,
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  async delete(fileKey) {
    const storage = getGcsStorage();
    const bucket = storage.bucket(ENV.GCS.BUCKET_NAME);
    const file = bucket.file(fileKey);
    await file.delete({ ignoreNotFound: true });
    return { success: true };
  },
};
