import { Router } from 'express';
import { listDepartments, createDepartment, updateDepartment } from './departments.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { UserRole } from '@mentorconnect/shared';

const router = Router();

// Publicly readable for registration dropdowns
router.get('/', listDepartments);

// HOD administration
router.post('/', authenticate, requireRole(UserRole.HOD), createDepartment);
router.put('/:id', authenticate, requireRole(UserRole.HOD), updateDepartment);

export default router;
