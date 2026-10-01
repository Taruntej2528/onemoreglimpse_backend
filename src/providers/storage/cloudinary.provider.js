import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../../config/env.js';

let lastConfiguredKey = '';

/**
 * Configure Cloudinary dynamically from options, ENV, or MongoDB Settings
 */
export const configureCloudinary = async (options = {}) => {
  let cloud_name = options.cloudName || options.cloud_name;
  let api_key = options.apiKey || options.api_key;
  let api_secret = options.apiSecret || options.api_secret;

  // 1. Fall back to ENV if not passed directly in options
  if (!cloud_name) cloud_name = ENV.CLOUDINARY?.CLOUD_NAME;
  if (!api_key) api_key = ENV.CLOUDINARY?.API_KEY;
  if (!api_secret) api_secret = ENV.CLOUDINARY?.API_SECRET;

  // 2. Fall back to MongoDB Settings if still missing
  if (!cloud_name || !api_key || !api_secret) {
    try {
      const { Settings } = await import('../../utiles/models/Settings.js');
      const settings = await Settings.findOne({ isDefault: true }).lean();
      const cld = settings?.storage?.providers?.cloudinary;
      if (cld) {
        if (!cloud_name && cld.cloudName) cloud_name = cld.cloudName;
        if (!api_key && cld.apiKey) api_key = cld.apiKey;
        if (!api_secret && cld.apiSecret) api_secret = cld.apiSecret;
      }
    } catch (dbErr) {
      console.warn(`[Cloudinary Config] Unable to load settings from DB: ${dbErr.message}`);
    }
  }


  if (cloud_name && api_key && api_secret) {
    const configKey = `${cloud_name}:${api_key}`;
    if (lastConfiguredKey !== configKey) {
      cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
        secure: true,
      });
      lastConfiguredKey = configKey;
    }
    return cloudinary;
  }

  const missing = [];
  if (!cloud_name) missing.push('Cloud Name (CLOUDINARY_CLOUD_NAME)');
  if (!api_key) missing.push('API Key (CLOUDINARY_API_KEY)');
  if (!api_secret) missing.push('API Secret (CLOUDINARY_API_SECRET)');

  throw new Error(
    `[Cloudinary Storage] Cloudinary is not fully configured. Missing: ${missing.join(
      ', '
    )}. Please add credentials in Admin Settings -> Multi-Cloud Storage or backend/.env.`
  );
};

export const CloudinaryProvider = {
  name: 'cloudinary',

  /**
   * Upload image or video file to Cloudinary and retrieve secure CDN URL
   */
  async upload(file, options = {}) {
    const cld = await configureCloudinary(options);
    const folder = options.folder || ENV.CLOUDINARY?.FOLDER || 'prazna-photography';

    const isVideo = file.mimetype?.startsWith('video') || options.type === 'video';
    const isImage = file.mimetype?.startsWith('image') || options.type === 'image';
    const resourceType = isVideo ? 'video' : isImage ? 'image' : 'auto';

    return new Promise((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            provider: 'cloudinary',
            url: result.secure_url,
            fileKey: result.public_id,
            size: result.bytes || file.size,
            mimeType: file.mimetype || (resourceType === 'video' ? 'video/mp4' : 'image/jpeg'),
            metadata: {
              format: result.format,
              width: result.width,
              height: result.height,
              duration: result.duration,
              resourceType: result.resource_type,
              created_at: result.created_at,
            },
          });
        }
      );

      if (file.buffer) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        import('fs').then((fs) => {
          fs.createReadStream(file.path).pipe(uploadStream);
        });
      } else {
        reject(new Error('No file buffer or file path available for upload'));
      }
    });
  },

  /**
   * Delete asset from Cloudinary by public ID
   */
  async delete(fileKey, resourceType = 'image') {
    const cld = await configureCloudinary();
    const result = await cld.uploader.destroy(fileKey, { resource_type: resourceType });
    return { success: result.result === 'ok' };
  },
};
