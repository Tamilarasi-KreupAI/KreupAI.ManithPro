import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Send broadcast email to users
export const sendBroadcastEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipients, subject, message, recipientType } = req.body;

    // Validation
    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    let targetUsers: any[] = [];

    // Determine recipients based on type
    if (recipientType === 'all') {
      targetUsers = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    } else if (recipientType === 'role') {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ error: 'Role is required for role-based emails' });
        return;
      }
      targetUsers = await prisma.user.findMany({
        where: { role },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    } else if (recipientType === 'specific' && Array.isArray(recipients)) {
      targetUsers = await prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    } else {
      res.status(400).json({ error: 'Invalid recipient type' });
      return;
    }

    if (targetUsers.length === 0) {
      res.status(400).json({ error: 'No recipients found' });
      return;
    }

    // In a real application, integrate with an email service (SendGrid, AWS SES, etc.)
    // For now, we'll simulate sending emails
    console.log(`Sending broadcast email to ${targetUsers.length} users`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // Simulate email sending (in production, use actual email service)
    const emailPromises = targetUsers.map(user => {
      // Placeholder for actual email sending
      return Promise.resolve({
        to: user.email,
        status: 'sent',
      });
    });

    await Promise.all(emailPromises);

    res.json({
      message: 'Broadcast email sent successfully',
      recipientCount: targetUsers.length,
      recipients: targetUsers.map(u => ({ email: u.email, name: `${u.firstName} ${u.lastName}` })),
    });
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    res.status(500).json({ error: 'Failed to send broadcast email' });
  }
};

// Send broadcast notification
export const sendBroadcastNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipients, title, message, type, link, recipientType } = req.body;

    // Validation
    if (!title || !message || !type) {
      res.status(400).json({ error: 'Title, message, and type are required' });
      return;
    }

    let targetUserIds: string[] = [];

    // Determine recipients based on type
    if (recipientType === 'all') {
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    } else if (recipientType === 'role') {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ error: 'Role is required for role-based notifications' });
        return;
      }
      const users = await prisma.user.findMany({
        where: { role },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    } else if (recipientType === 'specific' && Array.isArray(recipients)) {
      targetUserIds = recipients;
    } else {
      res.status(400).json({ error: 'Invalid recipient type' });
      return;
    }

    if (targetUserIds.length === 0) {
      res.status(400).json({ error: 'No recipients found' });
      return;
    }

    // Create notifications for all users
    const notificationData = targetUserIds.map(userId => ({
      userId,
      type: type as any,
      title,
      message,
      link: link || null,
    }));

    await prisma.notification.createMany({
      data: notificationData,
    });

    res.json({
      message: 'Broadcast notification sent successfully',
      recipientCount: targetUserIds.length,
    });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    res.status(500).json({ error: 'Failed to send broadcast notification' });
  }
};

// Get communication history (simulated)
export const getCommunicationHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', type } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // In a real application, you'd store communication logs in the database
    // For now, we'll return notifications as history
    const where: any = {};

    // Get notifications created in bulk (same title, created at same time)
    const notifications = await prisma.notification.findMany({
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
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
    });

    // Group notifications by title and created time (within 1 minute)
    const grouped = new Map();

    notifications.forEach(notif => {
      const key = `${notif.title}-${Math.floor(new Date(notif.createdAt).getTime() / 60000)}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          title: notif.title,
          message: notif.message,
          type: notif.type,
          createdAt: notif.createdAt,
          recipients: [],
        });
      }
      grouped.get(key).recipients.push({
        email: notif.user.email,
        name: `${notif.user.firstName} ${notif.user.lastName}`,
        role: notif.user.role,
      });
    });

    const history = Array.from(grouped.values());

    res.json({
      history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: history.length,
      },
    });
  } catch (error) {
    console.error('Error fetching communication history:', error);
    res.status(500).json({ error: 'Failed to fetch communication history' });
  }
};

// Get notification templates
export const getNotificationTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Predefined notification templates
    const templates = [
      {
        id: 'welcome',
        name: 'Welcome Message',
        title: 'Welcome to {site_name}',
        message: 'Thank you for joining our platform. We\'re excited to help you in your career journey!',
        type: 'APPLICATION_STATUS',
        variables: ['site_name', 'user_name'],
      },
      {
        id: 'job_alert',
        name: 'New Job Alert',
        title: 'New Job Opportunity: {job_title}',
        message: 'A new job that matches your profile has been posted: {job_title} at {company_name}',
        type: 'JOB_POSTED',
        variables: ['job_title', 'company_name', 'location'],
      },
      {
        id: 'application_update',
        name: 'Application Status Update',
        title: 'Application Update: {job_title}',
        message: 'Your application for {job_title} has been updated to: {status}',
        type: 'APPLICATION_STATUS',
        variables: ['job_title', 'status', 'company_name'],
      },
      {
        id: 'interview_reminder',
        name: 'Interview Reminder',
        title: 'Interview Reminder: {job_title}',
        message: 'Reminder: You have an interview scheduled for {date} at {time}',
        type: 'INTERVIEW_REMINDER',
        variables: ['job_title', 'date', 'time', 'location'],
      },
      {
        id: 'system_announcement',
        name: 'System Announcement',
        title: 'Important Announcement',
        message: 'System announcement message here...',
        type: 'APPLICATION_STATUS',
        variables: [],
      },
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({ error: 'Failed to fetch notification templates' });
  }
};

// Send test email
export const sendTestEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      res.status(400).json({ error: 'Email, subject, and message are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // In a real application, integrate with an email service
    console.log(`Sending test email to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      message: 'Test email sent successfully',
      recipient: email,
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
};

// Get email statistics
export const getEmailStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a real application, track actual email statistics
    // For now, return simulated data
    const stats = {
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      last30Days: {
        sent: 0,
        delivered: 0,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ error: 'Failed to fetch email statistics' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalNotifications, readNotifications, unreadNotifications, last30Days] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      total: totalNotifications,
      read: readNotifications,
      unread: unreadNotifications,
      last30Days,
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
};
