import admin from 'firebase-admin';
import path from 'path';
import { ENV } from '../../config/env.js';

let firebaseBucket = null;

const getFirebaseBucket = () => {
  if (!firebaseBucket) {
    if (!admin.apps.length) {
      if (ENV.FIREBASE.PROJECT_ID && ENV.FIREBASE.CLIENT_EMAIL && ENV.FIREBASE.PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: ENV.FIREBASE.PROJECT_ID,
            clientEmail: ENV.FIREBASE.CLIENT_EMAIL,
            privateKey: ENV.FIREBASE.PRIVATE_KEY,
          }),
          storageBucket: ENV.FIREBASE.STORAGE_BUCKET,
        });
      } else {
        throw new Error('[Firebase Provider] Firebase Storage credentials are not fully configured.');
      }
    }
    firebaseBucket = admin.storage().bucket();
  }
  return firebaseBucket;
};

export const FirebaseProvider = {
  name: 'firebase',

  async upload(file, options = {}) {
    const bucket = getFirebaseBucket();
    const ext = path.extname(file.originalname) || '';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folder = options.folder || 'portfolio';
    const destination = `${folder}/${uniqueSuffix}${ext}`;
    const fileBlob = bucket.file(destination);

    const body = file.buffer || (file.path ? await import('fs').then((fs) => fs.promises.readFile(file.path)) : null);

    await fileBlob.save(body, {
      contentType: file.mimetype,
      resumable: false,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uniqueSuffix,
        },
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${uniqueSuffix}`;

    return {
      provider: 'firebase',
      url: publicUrl,
      fileKey: destination,
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  async delete(fileKey) {
    const bucket = getFirebaseBucket();
    const file = bucket.file(fileKey);
    await file.delete({ ignoreNotFound: true });
    return { success: true };
  },
};
