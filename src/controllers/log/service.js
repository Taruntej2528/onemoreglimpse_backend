import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { AuditLog } from '../../utiles/models/AuditLog.js';

const baseCrud = createBaseCrud(AuditLog);

export const LogService = {
  ...baseCrud,

  async getLogs(options = {}) {
    const filter = {};
    if (options.module) filter.module = options.module;
    if (options.method) {
      filter.method = options.method.toUpperCase();
    } else {
      filter.method = { $ne: 'GET' };
    }
    if (options.statusCode) filter.statusCode = parseInt(options.statusCode, 10);
    if (options.userEmail) filter.userEmail = { $regex: options.userEmail, $options: 'i' };

    return baseCrud.find(filter, {
      ...options,
      sort: options.sort || '-createdAt',
      searchFields: ['url', 'action', 'userEmail', 'ip'],
    });
  },

  async getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const nonGetFilter = { method: { $ne: 'GET' } };

    const [totalRequests, errorsLast24h, avgResponseTime] = await Promise.all([
      AuditLog.countDocuments(nonGetFilter),
      AuditLog.countDocuments({ ...nonGetFilter, createdAt: { $gte: last24h }, statusCode: { $gte: 400 } }),
      AuditLog.aggregate([
        { $match: { ...nonGetFilter, createdAt: { $gte: last24h } } },
        { $group: { _id: null, avgDuration: { $avg: '$durationMs' } } },
      ]),
    ]);

    return {
      totalRequests,
      errorsLast24h,
      avgResponseTimeMs: Math.round(avgResponseTime[0]?.avgDuration || 0),
    };
  },

  async clearOldLogs(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
  },
};
