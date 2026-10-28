import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { prisma } from '../config/db';
import { UserRole } from '@mentorconnect/shared';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;

    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token has expired. Please refresh your session.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.',
      });
    }

    // Verify user still exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        studentProfile: { select: { id: true, fullName: true, departmentId: true } },
        mentorProfile: { select: { id: true, fullName: true, departmentId: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated or no longer exists.',
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.studentProfile?.fullName || user.mentorProfile?.fullName || 'Administrator',
      studentProfileId: user.studentProfile?.id,
      mentorProfileId: user.mentorProfile?.id,
      departmentId: user.studentProfile?.departmentId || user.mentorProfile?.departmentId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of the following roles: [${roles.join(', ')}]`,
      });
    }

    next();
  };
}
