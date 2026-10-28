import { Router } from 'express';
import { listAuditLogs } from './auditLogs.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.HOD));

router.get('/', listAuditLogs);

export default router;
