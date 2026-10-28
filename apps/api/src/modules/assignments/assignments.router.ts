import { Router } from 'express';
import {
  listAssignments,
  createAssignment,
  reassignMentor,
  getUnassignedStudents,
  getMentorWorkloads,
} from './assignments.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

// HOD only
router.use(authenticate, requireRole(UserRole.HOD));

router.get('/', listAssignments);
router.post('/', createAssignment);
router.post('/reassign', reassignMentor);
router.get('/unassigned-students', getUnassignedStudents);
router.get('/mentor-workloads', getMentorWorkloads);

export default router;
