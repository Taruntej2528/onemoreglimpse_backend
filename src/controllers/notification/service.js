import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { Notification } from '../../utiles/models/Notification.js';

const baseCrud = createBaseCrud(Notification);

export const NotificationService = {
  ...baseCrud,

  async getNotifications(options = {}) {
    return baseCrud.find(
      {},
      {
        ...options,
        sort: '-createdAt',
      }
    );
  },

  async markAsRead(id) {
    return baseCrud.updateById(id, { isRead: true });
  },

  async markAllAsRead() {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    return { success: true };
  },

  async getUnreadCount() {
    return Notification.countDocuments({ isRead: false });
  },
};
