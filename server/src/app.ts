import express from 'express';
import { healthRouter } from './routes/health.route.js';
import { createEmployeeRouter } from './routes/employee.route.js';
import { createEmployeeService } from './services/employee.service.js';
import * as employeeRepository from './repositories/employee.repository.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(healthRouter);
  app.use(createEmployeeRouter(createEmployeeService(employeeRepository)));

  return app;
}
