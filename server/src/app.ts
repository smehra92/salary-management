import express from 'express';
import { healthRouter } from './routes/health.route.js';
import { createEmployeeRouter } from './routes/employee.route.js';
import { createAnalyticsRouter } from './routes/analytics.route.js';
import { createEmployeeService } from './services/employee.service.js';
import { createAnalyticsService } from './services/analytics.service.js';
import * as employeeRepository from './repositories/employee.repository.js';
import * as currencyRateRepository from './repositories/currencyRate.repository.js';

export function createApp() {
  const app = express();

  const analyticsRepository = {
    findAllEmployeeSalaries: employeeRepository.findAllEmployeeSalaries,
    findAllCurrencyRates: currencyRateRepository.findAllCurrencyRates,
  };

  app.use(express.json());
  app.use(healthRouter);
  app.use(createEmployeeRouter(createEmployeeService(employeeRepository)));
  app.use(createAnalyticsRouter(createAnalyticsService(analyticsRepository)));

  return app;
}
