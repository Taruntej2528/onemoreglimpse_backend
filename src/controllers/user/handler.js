import { UserService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const UserHandler = {
  async getAll(req, res, next) {
    try {
      const result = await UserService.getAllUsers(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await UserService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User details retrieved',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const user = await UserService.createSubAdmin(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Sub-admin created successfully with specified permissions',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const user = await UserService.updateSubAdmin(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User details updated',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePermissions(req, res, next) {
    try {
      const user = await UserService.updatePermissions(req.params.id, req.body.modules);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User module permissions updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleStatus(req, res, next) {
    try {
      const user = await UserService.toggleStatus(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: `User status changed to ${user.status}`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await UserService.deleteById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
