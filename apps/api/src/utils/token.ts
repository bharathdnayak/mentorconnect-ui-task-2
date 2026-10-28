import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '@mentorconnect/shared';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  studentProfileId?: string;
  mentorProfileId?: string;
  departmentId?: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: '2h',
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
}
