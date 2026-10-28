import { Router } from 'express';
import {
  getMentorProfile,
  updateMentorProfile,
  getMyMentees,
  getMenteeProfile,
  getMentorDashboard,
} from './mentors.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.MENTOR));

router.get('/profile', getMentorProfile);
router.put('/profile', updateMentorProfile);
router.get('/mentees', getMyMentees);
router.get('/mentees/:studentId', getMenteeProfile);
router.get('/dashboard', getMentorDashboard);

export default router;
