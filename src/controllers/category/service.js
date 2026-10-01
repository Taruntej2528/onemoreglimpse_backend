import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { Category } from '../../utiles/models/Category.js';

const baseCrud = createBaseCrud(Category);

export const CategoryService = {
  ...baseCrud,

  async getAllCategories(options = {}) {
    return baseCrud.find(
      {},
      {
        ...options,
        sort: options.sort || 'order',
        searchFields: ['name', 'slug', 'description'],
      }
    );
  },

  async getActiveCategories() {
    return Category.find({ isActive: true }).sort('order');
  },
};
