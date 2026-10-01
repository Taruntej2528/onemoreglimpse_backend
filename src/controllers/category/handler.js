import { CategoryService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const CategoryHandler = {
  async getAll(req, res, next) {
    try {
      const result = await CategoryService.getAllCategories(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Categories retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActive(req, res, next) {
    try {
      const categories = await CategoryService.getActiveCategories();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Active categories retrieved',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const category = await CategoryService.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Category retrieved',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const category = await CategoryService.create(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const category = await CategoryService.updateById(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await CategoryService.deleteById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
