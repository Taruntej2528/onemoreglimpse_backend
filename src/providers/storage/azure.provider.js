import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';
import { ENV } from '../../config/env.js';

let blobServiceClient = null;

const getBlobClient = () => {
  if (!blobServiceClient) {
    if (ENV.AZURE.CONNECTION_STRING) {
      blobServiceClient = BlobServiceClient.fromConnectionString(ENV.AZURE.CONNECTION_STRING);
    } else {
      throw new Error('[Azure Provider] Azure Storage connection string is not configured.');
    }
  }
  return blobServiceClient;
};

export const AzureProvider = {
  name: 'azure',

  async upload(file, options = {}) {
    const serviceClient = getBlobClient();
    const containerClient = serviceClient.getContainerClient(ENV.AZURE.CONTAINER_NAME);
    await containerClient.createIfNotExists({ access: 'blob' });

    const ext = path.extname(file.originalname) || '';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folder = options.folder || 'portfolio';
    const blobName = `${folder}/${uniqueSuffix}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const body = file.buffer || (file.path ? await import('fs').then((fs) => fs.promises.readFile(file.path)) : null);

    await blockBlobClient.uploadData(body, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    const publicUrl = ENV.AZURE.CUSTOM_DOMAIN
      ? `https://${ENV.AZURE.CUSTOM_DOMAIN}/${ENV.AZURE.CONTAINER_NAME}/${blobName}`
      : blockBlobClient.url;

    return {
      provider: 'azure',
      url: publicUrl,
      fileKey: blobName,
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  async delete(fileKey) {
    const serviceClient = getBlobClient();
    const containerClient = serviceClient.getContainerClient(ENV.AZURE.CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(fileKey);
    await blockBlobClient.deleteIfExists();
    return { success: true };
  },
};
