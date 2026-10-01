import { User } from '../../utiles/models/User.js';
import { comparePassword, hashPassword } from '../../utiles/helpers/password.helper.js';
import { generateToken } from '../../utiles/helpers/jwt.helper.js';

export const AuthService = {
  /**
   * User login (Admin & Sub-admin)
   */
  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Please provide email and password');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (user.status !== 'ACTIVE') {
      const err = new Error('Your account is deactivated. Contact administrator.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
    };
  },

  /**
   * Get authenticated user profile with permissions
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  /**
   * Change user password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const err = new Error('Current and new password are required');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Incorrect current password');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  },
};
