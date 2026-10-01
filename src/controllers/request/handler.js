import { ClientRequestService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const ClientRequestHandler = {
  async submit(req, res, next) {
    try {
      const request = await ClientRequestService.submitRequest(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Your inquiry has been received. Our concierge will be in touch shortly.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await ClientRequestService.getAllRequests(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Client requests retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await ClientRequestService.findById(req.params.id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Request details retrieved',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const request = await ClientRequestService.updateStatus(req.params.id, status);
      return sendSuccess(res, {
        statusCode: 200,
        message: `Request status updated to ${status}`,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ClientRequestService.deleteById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
