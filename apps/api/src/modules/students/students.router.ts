import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getMyMentor,
  getStudentRecommendations,
  requestMentorChange,
  getStudentChangeRequests,
  getStudentSessions,
  getStudentDashboard,
} from './students.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

// All student endpoints require authentication and STUDENT role
router.use(authenticate, requireRole(UserRole.STUDENT));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/my-mentor', getMyMentor);
router.get('/recommendations', getStudentRecommendations);
router.post('/change-request', requestMentorChange);
router.get('/change-requests', getStudentChangeRequests);
router.get('/sessions', getStudentSessions);
router.get('/dashboard', getStudentDashboard);

export default router;
