import { NotificationService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const NotificationHandler = {
  async getAll(req, res, next) {
    try {
      const result = await NotificationService.getNotifications(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Notifications retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await NotificationService.getUnreadCount();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Unread notifications count',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await NotificationService.deleteById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
