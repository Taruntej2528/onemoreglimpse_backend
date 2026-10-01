import { LogService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const LogHandler = {
  async getAll(req, res, next) {
    try {
      const result = await LogService.getLogs(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Request audit logs retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await LogService.getStats();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Log metrics & statistics retrieved',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async clearOld(req, res, next) {
    try {
      const days = parseInt(req.query.days || '30', 10);
      const result = await LogService.clearOldLogs(days);
      return sendSuccess(res, {
        statusCode: 200,
        message: `Logs older than ${days} days cleared successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
