import { seedDatabase } from '../../seed/seed.js';

export const SeedService = {
  /**
   * Run database seeder
   * @param {Object} options - { force: boolean }
   */
  async runSeed(options = {}) {
    return await seedDatabase(options);
  },
};
