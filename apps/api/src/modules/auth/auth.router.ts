import { Router } from 'express';
import { login, registerStudent, getCurrentUser, refreshToken } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, login);
router.post('/register-student', authRateLimiter, registerStudent);
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh-token', refreshToken);

export default router;
