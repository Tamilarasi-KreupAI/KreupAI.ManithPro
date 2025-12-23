import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Get notification preferences for the authenticated user
 */
export const getNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: req.user.userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: req.user.userId,
          emailEnabled: true,
          applicationUpdates: true,
          interviewReminders: true,
          messageAlerts: true,
          jobAlerts: false,
        },
      });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

/**
 * Update notification preferences for the authenticated user
 */
export const updateNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const {
      emailEnabled,
      applicationUpdates,
      interviewReminders,
      messageAlerts,
      jobAlerts,
      systemAnnouncements,
      marketingEmails,
    } = req.body;

    // Upsert preferences (update if exists, create if not)
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: req.user.userId },
      update: {
        emailEnabled,
        applicationUpdates,
        interviewReminders,
        messageAlerts,
        jobAlerts,
        systemAnnouncements,
        marketingEmails,
      },
      create: {
        userId: req.user.userId,
        emailEnabled: emailEnabled ?? true,
        applicationUpdates: applicationUpdates ?? true,
        interviewReminders: interviewReminders ?? true,
        messageAlerts: messageAlerts ?? true,
        jobAlerts: jobAlerts ?? false,
        systemAnnouncements: systemAnnouncements ?? true,
        marketingEmails: marketingEmails ?? false,
      },
    });

    res.json({
      message: 'Notification preferences updated successfully',
      preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

/**
 * Check if a specific notification type is enabled for a user
 */
export const checkNotificationEnabled = async (
  userId: string,
  notificationType: 'applicationUpdates' | 'interviewReminders' | 'messageAlerts' | 'jobAlerts'
): Promise<boolean> => {
  try {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
      select: {
        emailEnabled: true,
        [notificationType]: true,
      },
    });

    if (!preferences) {
      // If no preferences exist, default to enabled
      return true;
    }

    // Check if both email is enabled AND the specific notification type is enabled
    return preferences.emailEnabled && preferences[notificationType];
  } catch (error) {
    console.error('Error checking notification enabled:', error);
    // Default to enabled on error to ensure notifications aren't missed
    return true;
  }
};
