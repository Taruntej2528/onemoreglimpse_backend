import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { User, SYSTEM_MODULES } from '../../utiles/models/User.js';

// Initialize BaseCrud with User model
const baseCrud = createBaseCrud(User);

export const UserService = {
  // Inherit standard base CRUD methods
  ...baseCrud,

  /**
   * Get all users with search and pagination
   */
  async getAllUsers(options = {}) {
    return baseCrud.find(
      {},
      {
        ...options,
        searchFields: ['name', 'email', 'phone', 'role'],
        select: '-password',
      }
    );
  },

  /**
   * Create a new sub-admin with custom module permissions
   */
  async createSubAdmin(userData) {
    const { name, email, password, phone, modules } = userData;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('User with this email already exists');
      err.statusCode = 409;
      throw err;
    }

    // Format module permissions, defaulting missing ones
    let formattedModules = SYSTEM_MODULES.map((modName) => {
      const existingMod = (modules || []).find((m) => m.module === modName);
      return {
        module: modName,
        permissions: {
          view: Boolean(existingMod?.permissions?.view),
          edit: Boolean(existingMod?.permissions?.edit),
          delete: Boolean(existingMod?.permissions?.delete),
        },
      };
    });

    const user = await baseCrud.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'SUB_ADMIN',
      status: 'ACTIVE',
      modules: formattedModules,
    });

    return user;
  },

  /**
   * Update sub-admin details, password (with hashing), and module permissions
   */
  async updateSubAdmin(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.status) user.status = updateData.status;

    if (updateData.password && updateData.password.trim()) {
      user.password = updateData.password; // Triggers pre-save bcrypt hook
    }

    if (updateData.modules && Array.isArray(updateData.modules) && user.role !== 'ADMIN') {
      user.modules = SYSTEM_MODULES.map((modName) => {
        const incoming = updateData.modules.find((m) => m.module === modName);
        return {
          module: modName,
          permissions: {
            view: Boolean(incoming?.permissions?.view),
            edit: Boolean(incoming?.permissions?.edit),
            delete: Boolean(incoming?.permissions?.delete),
          },
        };
      });
    }

    await user.save();
    return user;
  },

  /**
   * Update sub-admin permissions
   */
  async updatePermissions(userId, modules) {
    const user = await baseCrud.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'ADMIN') {
      const err = new Error('Master Admin permissions cannot be restricted');
      err.statusCode = 400;
      throw err;
    }

    const updatedModules = SYSTEM_MODULES.map((modName) => {
      const incoming = (modules || []).find((m) => m.module === modName);
      if (incoming) {
        return {
          module: modName,
          permissions: {
            view: Boolean(incoming.permissions?.view),
            edit: Boolean(incoming.permissions?.edit),
            delete: Boolean(incoming.permissions?.delete),
          },
        };
      }
      const existing = user.modules.find((m) => m.module === modName);
      return existing || { module: modName, permissions: { view: false, edit: false, delete: false } };
    });

    user.modules = updatedModules;
    await user.save();
    return user;
  },

  /**
   * Toggle user active/inactive status
   */
  async toggleStatus(userId) {
    const user = await baseCrud.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'ADMIN') {
      const err = new Error('Master Admin account cannot be deactivated');
      err.statusCode = 400;
      throw err;
    }

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await user.save();
    return user;
  },
};
