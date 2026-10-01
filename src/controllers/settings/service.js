import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { Settings } from '../../utiles/models/Settings.js';

const baseCrud = createBaseCrud(Settings);

export const SettingsService = {
  ...baseCrud,

  /**
   * Get active site settings or create default
   */
  async getSettings() {
    let settings = await Settings.findOne({ isDefault: true });
    if (!settings) {
      settings = await Settings.create({ isDefault: true });
    }
    return settings;
  },

  /**
   * Update site settings
   */
  async updateSettings(updateData) {
    let settings = await Settings.findOne({ isDefault: true });
    if (!settings) {
      settings = new Settings({ isDefault: true });
    }

    if (updateData.brand) {
      settings.brand = { ...(settings.brand ? settings.brand.toObject() : {}), ...updateData.brand };
      settings.markModified('brand');
    }
    if (updateData.hero) {
      settings.hero = { ...(settings.hero ? settings.hero.toObject() : {}), ...updateData.hero };
      settings.markModified('hero');
    }
    if (updateData.footer) {
      settings.footer = { ...(settings.footer ? settings.footer.toObject() : {}), ...updateData.footer };
      settings.markModified('footer');
    }
    if (updateData.philosophy) {
      settings.philosophy = { ...(settings.philosophy ? settings.philosophy.toObject() : {}), ...updateData.philosophy };
      settings.markModified('philosophy');
    }
    if (updateData.films) {
      settings.films = updateData.films;
      settings.markModified('films');
    }
    if (updateData.testimonials) {
      settings.testimonials = updateData.testimonials;
      settings.markModified('testimonials');
    }
    if (updateData.gallery) {
      settings.gallery = updateData.gallery;
      settings.markModified('gallery');
    }
    if (updateData.signaturePackages) {
      settings.signaturePackages = updateData.signaturePackages;
      settings.markModified('signaturePackages');
    }
    if (updateData.quoteEvents) {
      settings.quoteEvents = updateData.quoteEvents;
      settings.markModified('quoteEvents');
    }
    if (updateData.teamAddOns) {
      settings.teamAddOns = { ...(settings.teamAddOns ? settings.teamAddOns.toObject() : {}), ...updateData.teamAddOns };
      settings.markModified('teamAddOns');
    }
    if (updateData.seo) {
      settings.seo = { ...(settings.seo ? settings.seo.toObject() : {}), ...updateData.seo };
      settings.markModified('seo');
    }
    if (updateData.storage) {
      const currentStorage = settings.storage ? (typeof settings.storage.toObject === 'function' ? settings.storage.toObject() : settings.storage) : {};
      const incomingStorage = updateData.storage || {};
      const currentProviders = currentStorage.providers || {};
      const incomingProviders = incomingStorage.providers || {};

      settings.storage = {
        ...currentStorage,
        ...incomingStorage,
        providers: {
          ...currentProviders,
          ...incomingProviders,
          cloudinary: {
            ...(currentProviders.cloudinary || {}),
            ...(incomingProviders.cloudinary || {}),
          },
          s3: {
            ...(currentProviders.s3 || {}),
            ...(incomingProviders.s3 || {}),
          },
          local: {
            ...(currentProviders.local || {}),
            ...(incomingProviders.local || {}),
          },
        },
      };
      settings.markModified('storage');
    }
    if (updateData.emailSms) {
      settings.emailSms = { ...(settings.emailSms ? settings.emailSms.toObject() : {}), ...updateData.emailSms };
      settings.markModified('emailSms');
    }
    if (updateData.socialLinks) {
      settings.socialLinks = updateData.socialLinks;
      settings.markModified('socialLinks');
    }
    if (updateData.stats) {
      settings.stats = updateData.stats;
      settings.markModified('stats');
    }
    if (updateData.ai) {
      const currentAi = settings.ai ? (typeof settings.ai.toObject === 'function' ? settings.ai.toObject() : settings.ai) : {};
      const incomingAi = updateData.ai || {};
      const currentAiProviders = currentAi.providers || {};
      const incomingAiProviders = incomingAi.providers || {};

      settings.ai = {
        ...currentAi,
        ...incomingAi,
        providers: {
          ...currentAiProviders,
          ...incomingAiProviders,
          gemini: {
            ...(currentAiProviders.gemini || {}),
            ...(incomingAiProviders.gemini || {}),
          },
          openai: {
            ...(currentAiProviders.openai || {}),
            ...(incomingAiProviders.openai || {}),
          },
          claude: {
            ...(currentAiProviders.claude || {}),
            ...(incomingAiProviders.claude || {}),
          },
        },
      };
      settings.markModified('ai');
    }

    await settings.save();
    return settings;
  },

  /**
   * Switch active storage provider
   */
  async setActiveStorageProvider(providerName) {
    const valid = ['s3', 'azure', 'gcs', 'firebase', 'cloudinary', 'local'];
    if (!valid.includes(providerName)) {
      const err = new Error(`Invalid storage provider: ${providerName}. Supported: ${valid.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    let settings = await Settings.findOne({ isDefault: true });
    if (!settings) settings = new Settings({ isDefault: true });

    settings.storage.activeProvider = providerName;
    await settings.save();
    return settings;
  },
};
