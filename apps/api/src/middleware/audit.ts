import { Request } from 'express';
import { prisma } from '../config/db';

export interface AuditLogOptions {
  req?: Request;
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}

export async function recordAuditLog(options: AuditLogOptions) {
  try {
    let actorId = options.actorId;
    let actorRole = options.actorRole;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (options.req) {
      const user = (options.req as any).user;
      if (user) {
        actorId = actorId || user.userId;
        actorRole = actorRole || user.role;
      }
      ipAddress = (options.req.headers['x-forwarded-for'] as string) || options.req.socket.remoteAddress;
      userAgent = options.req.headers['user-agent'];
    }

    // Sanitize details to guarantee no passwords or tokens are logged
    const sanitizedDetails = options.details ? { ...options.details } : {};
    delete (sanitizedDetails as any).password;
    delete (sanitizedDetails as any).token;
    delete (sanitizedDetails as any).passwordHash;

    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: sanitizedDetails,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Audit logging should not crash the main transaction, but log the error
    console.error('[AuditLog] Failed to persist audit log entry:', error);
  }
}
