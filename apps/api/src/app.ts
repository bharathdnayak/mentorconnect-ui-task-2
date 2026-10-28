import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import Routers
import authRouter from './modules/auth/auth.router';
import studentsRouter from './modules/students/students.router';
import mentorsRouter from './modules/mentors/mentors.router';
import assignmentsRouter from './modules/assignments/assignments.router';
import recommendationsRouter from './modules/recommendations/recommendations.router';
import changeRequestsRouter from './modules/changeRequests/changeRequests.router';
import sessionsRouter from './modules/sessions/sessions.router';
import departmentsRouter from './modules/departments/departments.router';
import announcementsRouter from './modules/announcements/announcements.router';
import notificationsRouter from './modules/notifications/notifications.router';
import reportsRouter from './modules/reports/reports.router';
import auditLogsRouter from './modules/auditLogs/auditLogs.router';
import usersRouter from './modules/users/users.router';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health checks
  app.get(['/health', '/api/v1/health'], (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'MentorConnect API',
      version: '1.0.0',
    });
  });

  // Versioned API Routes
  const apiV1 = express.Router();
  apiV1.use('/auth', authRouter);
  apiV1.use('/students', studentsRouter);
  apiV1.use('/mentors', mentorsRouter);
  apiV1.use('/assignments', assignmentsRouter);
  apiV1.use('/recommendations', recommendationsRouter);
  apiV1.use('/change-requests', changeRequestsRouter);
  apiV1.use('/sessions', sessionsRouter);
  apiV1.use('/departments', departmentsRouter);
  apiV1.use('/announcements', announcementsRouter);
  apiV1.use('/notifications', notificationsRouter);
  apiV1.use('/reports', reportsRouter);
  apiV1.use('/audit-logs', auditLogsRouter);
  apiV1.use('/users', usersRouter);

  app.use('/api/v1', apiV1);

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
