import { MediaService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const MediaHandler = {
  async getAll(req, res, next) {
    try {
      const result = await MediaService.getMediaList(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Media items retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const media = await MediaService.findById(req.params.id, 'category');
      if (!media) {
        return res.status(404).json({ success: false, message: 'Media not found' });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Media details retrieved',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async upload(req, res, next) {
    try {
      const media = await MediaService.uploadMedia(req.file, req.body, req.user);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Media uploaded and stored successfully',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadPublic(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided for upload' });
      }
      const media = await MediaService.uploadMedia(
        req.file,
        {
          title: req.body?.title || req.file.originalname,
          folder: 'client-inquiries',
          provider: req.body?.provider,
        },
        null
      );
      return sendSuccess(res, {
        statusCode: 201,
        message: 'File uploaded and link generated successfully',
        data: {
          id: media._id,
          url: media.url,
          fileKey: media.fileKey,
          type: media.type,
          mimeType: media.mimeType,
          size: media.size,
          title: media.title,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async setHeroActive(req, res, next) {
    try {
      const { mode } = req.body;
      const media = await MediaService.setHeroActive(req.params.id, mode);
      return sendSuccess(res, {
        statusCode: 200,
        message: `Media '${media.title}' enabled as active landing hero ${media.type}`,
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const media = await MediaService.updateById(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Media details updated',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await MediaService.deleteMedia(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Media removed from database and storage bucket',
      });
    } catch (error) {
      next(error);
    }
  },
};
