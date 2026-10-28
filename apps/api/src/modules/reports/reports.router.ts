import { Router } from 'express';
import {
  getOverviewReport,
  exportAssignmentsCsv,
  exportSessionsCsv,
  exportMentorsCsv,
} from './reports.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.HOD));

router.get('/overview', getOverviewReport);
router.get('/export-assignments-csv', exportAssignmentsCsv);
router.get('/export-sessions-csv', exportSessionsCsv);
router.get('/export-mentors-csv', exportMentorsCsv);

export default router;
