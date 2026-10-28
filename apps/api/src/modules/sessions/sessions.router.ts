import { Router } from 'express';
import {
  createSession,
  getSessionById,
  updateSessionStatus,
  addMeetingNote,
  addActionItem,
  updateActionItem,
  submitFeedback,
  listAllSessionsOverview,
  listMentorSessions,
} from './sessions.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(UserRole.MENTOR, UserRole.HOD), createSession);
router.get('/overview', requireRole(UserRole.HOD), listAllSessionsOverview);
router.get('/mentor-sessions', requireRole(UserRole.MENTOR), listMentorSessions);
router.get('/:id', getSessionById);
router.patch('/:id/status', updateSessionStatus);
router.post('/:id/notes', addMeetingNote);
router.post('/:id/action-items', addActionItem);
router.patch('/action-items/:id', updateActionItem);
router.post('/:id/feedback', requireRole(UserRole.STUDENT), submitFeedback);

export default router;
