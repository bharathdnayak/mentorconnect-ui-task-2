import { Router } from 'express';
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from './announcements.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate);

router.get('/', listAnnouncements);
router.post('/', requireRole(UserRole.HOD), createAnnouncement);
router.delete('/:id', requireRole(UserRole.HOD), deleteAnnouncement);

export default router;
