import { Router } from 'express';
import { listChangeRequests, reviewChangeRequest } from './changeRequests.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.HOD));

router.get('/', listChangeRequests);
router.post('/:id/review', reviewChangeRequest);

export default router;
