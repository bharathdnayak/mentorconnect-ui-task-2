import { Router } from 'express';
import {
  listStudents,
  listMentors,
  toggleUserStatus,
  createMentorUser,
} from './users.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.HOD));

router.get('/students', listStudents);
router.get('/mentors', listMentors);
router.post('/mentors', createMentorUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
