import { SettingsService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const SettingsHandler = {
  async get(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Settings retrieved successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Website settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  async switchStorage(req, res, next) {
    try {
      const { provider } = req.body;
      const settings = await SettingsService.setActiveStorageProvider(provider);
      return sendSuccess(res, {
        statusCode: 200,
        message: `Active storage provider switched to '${provider}'`,
        data: settings.storage,
      });
    } catch (error) {
      next(error);
    }
  },
};
