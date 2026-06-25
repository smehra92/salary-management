import { Router } from 'express';
import type { createAnalyticsService } from '../services/analytics.service.js';

type AnalyticsService = ReturnType<typeof createAnalyticsService>;

export function createAnalyticsRouter(analyticsService: AnalyticsService): Router {
  const router = Router();

  router.get('/analytics/pay-insights', async (_req, res) => {
    const result = await analyticsService.getPayInsights();

    res.status(200).json(result);
  });

  return router;
}
