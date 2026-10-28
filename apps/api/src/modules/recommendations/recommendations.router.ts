import { Router } from 'express';
import {
  getRecommendationsForStudent,
  listStoredRecommendations,
  acceptRecommendation,
} from './recommendations.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

// HOD and Mentors can view recommendations; HOD can accept them
router.use(authenticate);

router.get('/match/:studentId', requireRole(UserRole.HOD, UserRole.MENTOR), getRecommendationsForStudent);
router.get('/stored', requireRole(UserRole.HOD), listStoredRecommendations);
router.post('/accept', requireRole(UserRole.HOD), acceptRecommendation);

export default router;
