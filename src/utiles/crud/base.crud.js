/**
 * Base CRUD Repository for Dynamic Mongoose Models
 */

export class BaseCrud {
  constructor(model) {
    if (!model) {
      throw new Error('[BaseCrud] Mongoose model must be provided to BaseCrud constructor');
    }
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  /**
   * Find document by ID
   */
  async findById(id, populate = '') {
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return query.exec();
  }

  /**
   * Find one document matching filter
   */
  async findOne(filter = {}, populate = '', select = '') {
    let query = this.model.findOne(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  /**
   * Find multiple documents with pagination, sorting, search, and filtering
   */
  async find(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      populate = '',
      select = '',
      search = '',
      searchFields = [],
    } = options;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Apply regex search if search query and fields are provided
    const finalFilter = { ...filter };
    if (search && searchFields.length > 0) {
      finalFilter.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    let query = this.model.find(finalFilter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);

    query = query.skip(skip).limit(limitNum);

    const [data, totalCount] = await Promise.all([
      query.exec(),
      this.model.countDocuments(finalFilter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  /**
   * Update document by ID
   */
  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  /**
   * Update one document matching filter
   */
  async updateOne(filter = {}, data, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, data, options).exec();
  }

  /**
   * Delete document by ID
   */
  async deleteById(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Delete one document matching filter
   */
  async deleteOne(filter = {}) {
    return this.model.findOneAndDelete(filter).exec();
  }

  /**
   * Count documents matching filter
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Execute aggregation pipeline
   */
  async aggregate(pipeline = []) {
    return this.model.aggregate(pipeline).exec();
  }
}

/**
 * Factory function to instantiate base CRUD for any model
 */
export const createBaseCrud = (model) => {
  const instance = new BaseCrud(model);
  const proto = Object.getPrototypeOf(instance);
  const methods = Object.getOwnPropertyNames(proto).filter(
    (prop) => prop !== 'constructor' && typeof instance[prop] === 'function'
  );
  const bound = { model };
  for (const method of methods) {
    bound[method] = instance[method].bind(instance);
  }
  return bound;
};
