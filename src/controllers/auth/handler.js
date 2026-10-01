import { AuthService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const AuthHandler = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user._id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Current profile retrieved',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user._id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
