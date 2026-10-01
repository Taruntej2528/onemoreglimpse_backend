import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { Media } from '../../utiles/models/Media.js';
import { Settings } from '../../utiles/models/Settings.js';
import { getActiveStorageProvider, getStorageProvider } from '../../providers/storage/index.js';

const baseCrud = createBaseCrud(Media);

export const MediaService = {
  ...baseCrud,

  /**
   * Upload media file to active or specified storage provider
   */
  async uploadMedia(file, metadata = {}, user = null) {
    if (!file) {
      const err = new Error('No media file provided for upload');
      err.statusCode = 400;
      throw err;
    }

    const providerKey = metadata.provider;
    const provider = providerKey ? getStorageProvider(providerKey) : await getActiveStorageProvider();

    // Perform upload to chosen storage bucket
    const uploadResult = await provider.upload(file, {
      folder: metadata.folder || 'portfolio',
      type: metadata.type,
      cloudName: metadata.cloudName,
      apiKey: metadata.apiKey,
      apiSecret: metadata.apiSecret,
    });

    const isVideo = file.mimetype?.startsWith('video') || metadata.type === 'video';

    // Create record in Media collection using baseCrud
    const media = await baseCrud.create({
      title: metadata.title || file.originalname || 'Untitled Media',
      type: isVideo ? 'video' : 'image',
      url: uploadResult.url,
      storageProvider: uploadResult.provider,
      fileKey: uploadResult.fileKey,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      category: metadata.category || null,
      location: metadata.location || '',
      tagline: metadata.tagline || '',
      videoId: metadata.videoId || '',
      poster: metadata.poster || '',
      aspectRatio: metadata.aspectRatio || (isVideo ? '16:9' : '4:3'),
      uploadedBy: user?._id || null,
      metadata: uploadResult.metadata || {},
    });

    return media;
  },

  /**
   * Enable a single video or single image for Landing Hero
   * Enforces: only ANY ONE video or ANY ONE image active
   */
  async setHeroActive(mediaId, mode = 'video') {
    const media = await baseCrud.findById(mediaId);
    if (!media) {
      const err = new Error('Media not found');
      err.statusCode = 404;
      throw err;
    }

    // 1. Deactivate any existing hero of this media type
    await Media.updateMany({ type: media.type }, { $set: { isHeroActive: false } });

    // 2. Activate this media
    media.isHeroActive = true;
    await media.save();

    // 3. Update Settings model so frontend hero synchronizes seamlessly
    const settings = await Settings.findOne({ isDefault: true });
    if (settings) {
      settings.hero.heroMediaType = mode || media.type;
      if (media.type === 'video') {
        settings.hero.activeHeroVideoId = media._id.toString();
      } else {
        settings.hero.activeHeroImageId = media._id.toString();
      }
      await settings.save();
    }

    return media;
  },

  /**
   * Delete media from both DB and Cloud/Local storage bucket
   */
  async deleteMedia(mediaId) {
    const media = await baseCrud.findById(mediaId);
    if (!media) {
      const err = new Error('Media not found');
      err.statusCode = 404;
      throw err;
    }

    // Delete from storage provider
    try {
      const provider = getStorageProvider(media.storageProvider);
      if (media.fileKey) {
        await provider.delete(media.fileKey, media.type);
      }
    } catch (storageErr) {
      console.error(`[Storage Cleanup Warning] Failed to delete file ${media.fileKey}: ${storageErr.message}`);
    }

    // Delete from DB
    await baseCrud.deleteById(mediaId);
    return { success: true };
  },

  /**
   * Query media with filters, search, and category population
   */
  async getMediaList(query = {}) {
    const filter = {};
    if (query.type) filter.type = query.type;
    if (query.category) filter.category = query.category;
    if (query.isHeroActive !== undefined) filter.isHeroActive = query.isHeroActive === 'true';

    return baseCrud.find(filter, {
      ...query,
      populate: 'category',
      searchFields: ['title', 'location', 'tagline'],
    });
  },
};
