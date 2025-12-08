import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all audit logs with filtering and pagination
 */
export const getAllAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      action,
      entity,
      userId,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    if (search) {
      where.OR = [
        { action: { contains: search as string, mode: 'insensitive' } },
        { entity: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      res.status(404).json({ error: 'Audit log not found' });
      return;
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
};

/**
 * Create audit log entry
 */
export const createAuditLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entity, entityId, description, metadata, ipAddress } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const log = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description,
        metadata: metadata || {},
        ipAddress,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    }

    const [
      totalLogs,
      logsByAction,
      logsByEntity,
      logsByUser,
      recentActivity,
    ] = await Promise.all([
      // Total logs in period
      prisma.auditLog.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Logs by action type
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: startDate } },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
      }),

      // Logs by entity type
      prisma.auditLog.groupBy({
        by: ['entity'],
        where: { createdAt: { gte: startDate } },
        _count: { entity: true },
        orderBy: { _count: { entity: 'desc' } },
      }),

      // Most active users
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: startDate } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // Recent activity timeline
      prisma.auditLog.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Get user details for most active users
    const userIds = logsByUser.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    const mostActiveUsers = logsByUser.map(log => {
      const user = users.find(u => u.id === log.userId);
      return {
        userId: log.userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user?.email,
        role: user?.role,
        actionCount: log._count.userId,
      };
    });

    // Group activity by date
    const activityByDate: { [key: string]: number } = {};
    recentActivity.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

    const activityTimeline = Object.entries(activityByDate).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      totalLogs,
      byAction: logsByAction.map(l => ({ action: l.action, count: l._count.action })),
      byEntity: logsByEntity.map(l => ({ entity: l.entity, count: l._count.entity })),
      mostActiveUsers,
      activityTimeline,
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit log statistics' });
  }
};

/**
 * Get user activity history
 */
export const getUserActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = '50' } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entity, userId, dateFrom, dateTo } = req.query;

    const where: any = {};

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Date', 'Time', 'User', 'Email', 'Role', 'Action', 'Entity', 'Entity ID', 'Description', 'IP Address'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      const time = log.createdAt.toISOString().split('T')[1].split('.')[0];
      const userName = `${log.user.firstName} ${log.user.lastName}`;

      const row = [
        date,
        time,
        `"${userName}"`,
        log.user.email,
        log.user.role,
        log.action,
        log.entity,
        log.entityId || '',
        `"${log.description || ''}"`,
        log.ipAddress || '',
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
};

/**
 * Delete old audit logs (retention policy)
 */
export const deleteOldAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '90' } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    res.json({
      message: `Deleted ${result.count} audit logs older than ${days} days`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
    res.status(500).json({ error: 'Failed to delete old audit logs' });
  }
};
