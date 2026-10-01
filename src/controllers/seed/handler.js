import { SeedService } from './service.js';
import { sendSuccess } from '../../utiles/helpers/response.helper.js';

export const SeedHandler = {
  /**
   * Run Database Seed API Handler
   * Accepts both GET and POST requests:
   * GET /api/v1/seed?force=true
   * POST /api/v1/seed { "force": true }
   */
  async run(req, res, next) {
    try {
      const force =
        req.query.force === 'true' ||
        req.body?.force === true ||
        req.body?.force === 'true';

      const result = await SeedService.runSeed({ force });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Database seeding completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
