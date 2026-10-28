import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/db';
import { loginSchema, studentRegisterSchema, UserRole } from '@mentorconnect/shared';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token';
import { recordAuditLog } from '../../middleware/audit';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: {
          include: { department: true },
        },
        mentorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the Head of Department (HOD).',
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.studentProfile?.fullName || user.mentorProfile?.fullName || 'Administrator',
      studentProfileId: user.studentProfile?.id,
      mentorProfileId: user.mentorProfile?.id,
      departmentId: user.studentProfile?.departmentId || user.mentorProfile?.departmentId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ userId: user.id });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: tokenPayload.fullName,
          department: user.studentProfile?.department || user.mentorProfile?.department || null,
          profileCompleted: user.studentProfile ? user.studentProfile.profileCompleted : true,
          studentProfileId: user.studentProfile?.id,
          mentorProfileId: user.mentorProfile?.id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function registerStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = studentRegisterSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { studentProfile: { usn: data.usn.toUpperCase().trim() } },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or USN already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'STUDENT',
          isActive: true,
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          usn: data.usn.toUpperCase().trim(),
          fullName: data.fullName.trim(),
          departmentId: data.departmentId,
          semester: data.semester,
          degree: data.degree,
          section: data.section || null,
          academicYear: data.academicYear,
          profileCompleted: false,
        },
        include: { department: true },
      });

      return { user, profile };
    });

    await recordAuditLog({
      req,
      actorId: result.user.id,
      actorRole: 'STUDENT',
      action: 'STUDENT_REGISTERED',
      entityType: 'User',
      entityId: result.user.id,
      details: { email, usn: result.profile.usn, name: result.profile.fullName },
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: UserRole.STUDENT,
      fullName: result.profile.fullName,
      studentProfileId: result.profile.id,
      departmentId: result.profile.departmentId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ userId: result.user.id });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          fullName: result.profile.fullName,
          department: result.profile.department,
          profileCompleted: false,
          studentProfileId: result.profile.id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        studentProfile: {
          include: { department: true },
        },
        mentorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.studentProfile?.fullName || user.mentorProfile?.fullName || 'Administrator',
        lastLogin: user.lastLogin,
        studentProfile: user.studentProfile,
        mentorProfile: user.mentorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User is inactive or not found.',
      });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.studentProfile?.fullName || user.mentorProfile?.fullName || 'Administrator',
      studentProfileId: user.studentProfile?.id,
      mentorProfileId: user.mentorProfile?.id,
      departmentId: user.studentProfile?.departmentId || user.mentorProfile?.departmentId,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ userId: user.id });

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.',
    });
  }
}
