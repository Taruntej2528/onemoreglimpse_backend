import { EventService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const EventHandler = {
  async getAll(req, res, next) {
    try {
      const result = await EventService.getAllEvents(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Events and packages retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActivePackages(req, res, next) {
    try {
      const packages = await EventService.getActivePackages();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Active signature packages retrieved',
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const event = await EventService.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event/Package not found' });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Event details retrieved',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const event = await EventService.create(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Event/Package created successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const event = await EventService.updateById(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Event/Package updated successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await EventService.deleteById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Event/Package deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
