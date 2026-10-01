import fs from 'fs';
import path from 'path';
import { ENV } from '../../config/env.js';

export const LocalProvider = {
  name: 'local',

  async upload(file, options = {}) {
    const uploadDir = path.resolve(process.cwd(), ENV.LOCAL.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${options.folder ? options.folder + '-' : ''}${uniqueSuffix}${ext}`;
    const targetPath = path.join(uploadDir, filename);

    if (file.buffer) {
      await fs.promises.writeFile(targetPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, targetPath);
    }

    const publicUrl = `${ENV.LOCAL.BASE_URL}/${filename}`;

    return {
      provider: 'local',
      url: publicUrl,
      fileKey: filename,
      size: file.size || (await fs.promises.stat(targetPath)).size,
      mimeType: file.mimetype || 'application/octet-stream',
    };
  },

  async delete(fileKey) {
    try {
      const uploadDir = path.resolve(process.cwd(), ENV.LOCAL.UPLOAD_DIR);
      const filePath = path.join(uploadDir, fileKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return { success: true };
    } catch (err) {
      console.error(`[Local Storage Delete Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  },
};
