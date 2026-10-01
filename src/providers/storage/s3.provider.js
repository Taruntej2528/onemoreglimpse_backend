import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { ENV } from '../../config/env.js';

let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: ENV.AWS.REGION,
      credentials: {
        accessKeyId: ENV.AWS.ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS.SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

export const S3Provider = {
  name: 's3',

  async upload(file, options = {}) {
    if (!ENV.AWS.ACCESS_KEY_ID || !ENV.AWS.SECRET_ACCESS_KEY) {
      throw new Error('[S3 Provider] AWS credentials (ACCESS_KEY_ID & SECRET_ACCESS_KEY) are not configured.');
    }

    const client = getS3Client();
    const ext = path.extname(file.originalname) || '';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folder = options.folder || 'portfolio';
    const key = `${folder}/${uniqueSuffix}${ext}`;

    const body = file.buffer || (file.path ? await import('fs').then((fs) => fs.promises.readFile(file.path)) : null);

    const command = new PutObjectCommand({
      Bucket: ENV.AWS.BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.mimetype,
    });

    await client.send(command);

    const publicUrl = ENV.AWS.CUSTOM_DOMAIN
      ? `https://${ENV.AWS.CUSTOM_DOMAIN}/${key}`
      : `https://${ENV.AWS.BUCKET_NAME}.s3.${ENV.AWS.REGION}.amazonaws.com/${key}`;

    return {
      provider: 's3',
      url: publicUrl,
      fileKey: key,
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  async delete(fileKey) {
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: ENV.AWS.BUCKET_NAME,
      Key: fileKey,
    });
    await client.send(command);
    return { success: true };
  },
};
