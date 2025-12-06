import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// REMINDER SCHEDULES (3.3.1, 3.3.6)
// ============================================

// Create a new reminder schedule
export const createReminderSchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      name,
      description,
      isDefault,
      reminderTimes,
      eventTypes,
      emailEnabled,
      smsEnabled,
      whatsappEnabled,
      pushEnabled,
      emailTemplateId,
      smsTemplateId,
      whatsappTemplateId,
      scope,
    } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.reminderSchedule.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const schedule = await prisma.reminderSchedule.create({
      data: {
        userId,
        name,
        description,
        isDefault: isDefault || false,
        reminderTimes: reminderTimes || [1440, 60, 15], // 24h, 1h, 15min default
        eventTypes: eventTypes || [],
        emailEnabled: emailEnabled !== false,
        smsEnabled: smsEnabled || false,
        whatsappEnabled: whatsappEnabled || false,
        pushEnabled: pushEnabled !== false,
        emailTemplateId,
        smsTemplateId,
        whatsappTemplateId,
        scope: scope || 'USER',
      },
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating reminder schedule:', error);
    res.status(500).json({ error: 'Failed to create reminder schedule' });
  }
};

// Get user's reminder schedules
export const getReminderSchedules = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const schedules = await prisma.reminderSchedule.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching reminder schedules:', error);
    res.status(500).json({ error: 'Failed to fetch reminder schedules' });
  }
};

// Update reminder schedule
export const updateReminderSchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await prisma.reminderSchedule.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const schedule = await prisma.reminderSchedule.update({
      where: { id, userId },
      data: updates,
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error updating reminder schedule:', error);
    res.status(500).json({ error: 'Failed to update reminder schedule' });
  }
};

// Delete reminder schedule
export const deleteReminderSchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.reminderSchedule.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder schedule:', error);
    res.status(500).json({ error: 'Failed to delete reminder schedule' });
  }
};

// ============================================
// NOTIFICATION CHANNELS (3.3.2, 3.3.3, 3.3.4)
// ============================================

// Get user's notification channels
export const getNotificationChannels = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const channels = await prisma.notificationChannel.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });

    res.json(channels);
  } catch (error) {
    console.error('Error fetching notification channels:', error);
    res.status(500).json({ error: 'Failed to fetch notification channels' });
  }
};

// Add or update a notification channel
export const upsertNotificationChannel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      channelType,
      isEnabled,
      isPrimary,
      emailAddress,
      phoneNumber,
      phoneCountryCode,
      whatsappNumber,
      pushToken,
      pushPlatform,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      timezone,
    } = req.body;

    const channel = await prisma.notificationChannel.upsert({
      where: {
        userId_channelType: { userId, channelType },
      },
      update: {
        isEnabled,
        isPrimary,
        emailAddress,
        phoneNumber,
        phoneCountryCode,
        whatsappNumber,
        pushToken,
        pushPlatform,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        timezone,
      },
      create: {
        userId,
        channelType,
        isEnabled: isEnabled !== false,
        isPrimary: isPrimary || false,
        emailAddress,
        phoneNumber,
        phoneCountryCode,
        whatsappNumber,
        pushToken,
        pushPlatform,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        timezone,
      },
    });

    res.json(channel);
  } catch (error) {
    console.error('Error upserting notification channel:', error);
    res.status(500).json({ error: 'Failed to update notification channel' });
  }
};

// Verify a channel (SMS/WhatsApp)
export const verifyChannel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { channelType } = req.params;
    const { verificationCode } = req.body;

    // In production, verify the code against stored code
    // For now, simulate verification
    const updateData: any = {};
    if (channelType === 'SMS') {
      updateData.phoneVerified = true;
      updateData.phoneVerifiedAt = new Date();
    } else if (channelType === 'WHATSAPP') {
      updateData.whatsappVerified = true;
      updateData.whatsappOptIn = true;
      updateData.whatsappOptInAt = new Date();
    } else if (channelType === 'EMAIL') {
      updateData.emailVerified = true;
      updateData.emailVerifiedAt = new Date();
    }

    const channel = await prisma.notificationChannel.update({
      where: {
        userId_channelType: { userId, channelType },
      },
      data: updateData,
    });

    res.json({ success: true, channel });
  } catch (error) {
    console.error('Error verifying channel:', error);
    res.status(500).json({ error: 'Failed to verify channel' });
  }
};

// Send verification code
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { channelType } = req.params;

    // In production, send actual verification code via SMS/WhatsApp/Email
    // For now, simulate sending
    res.json({
      success: true,
      message: `Verification code sent via ${channelType}`,
      expiresIn: 600, // 10 minutes
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
};

// ============================================
// REMINDER NOTIFICATIONS
// ============================================

// Get upcoming reminders
export const getUpcomingReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit } = req.query;

    const reminders = await prisma.reminderNotification.findMany({
      where: {
        userId,
        status: status as string || 'PENDING',
        scheduledFor: { gte: new Date() },
      },
      include: {
        interview: {
          include: {
            application: {
              include: {
                job: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit ? parseInt(limit as string) : 20,
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

// Schedule a reminder manually
export const scheduleReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      interviewId,
      reminderType,
      scheduledFor,
      minutesBefore,
      channel,
      subject,
      body,
    } = req.body;

    const reminder = await prisma.reminderNotification.create({
      data: {
        userId,
        interviewId,
        reminderType,
        scheduledFor: new Date(scheduledFor),
        minutesBefore,
        channel,
        subject,
        body,
      },
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    res.status(500).json({ error: 'Failed to schedule reminder' });
  }
};

// Cancel a reminder
export const cancelReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const reminder = await prisma.reminderNotification.update({
      where: { id, userId },
      data: { status: 'CANCELLED' },
    });

    res.json(reminder);
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    res.status(500).json({ error: 'Failed to cancel reminder' });
  }
};

// Get reminder history
export const getReminderHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const reminders = await prisma.reminderNotification.findMany({
      where: {
        userId,
        status: { in: ['SENT', 'DELIVERED', 'FAILED'] },
      },
      include: {
        interview: true,
      },
      orderBy: { sentAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.reminderNotification.count({
      where: {
        userId,
        status: { in: ['SENT', 'DELIVERED', 'FAILED'] },
      },
    });

    res.json({ reminders, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    res.status(500).json({ error: 'Failed to fetch reminder history' });
  }
};

// ============================================
// PUSH SUBSCRIPTIONS (3.3.4)
// ============================================

// Register push subscription
export const registerPushSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      endpoint,
      p256dh,
      auth,
      platform,
      browser,
      browserVersion,
      deviceName,
      deviceModel,
    } = req.body;

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh,
        auth,
        platform,
        browser,
        browserVersion,
        deviceName,
        deviceModel,
        isActive: true,
        lastPingAt: new Date(),
      },
      create: {
        userId,
        endpoint,
        p256dh,
        auth,
        platform: platform || 'WEB',
        browser,
        browserVersion,
        deviceName,
        deviceModel,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error registering push subscription:', error);
    res.status(500).json({ error: 'Failed to register push subscription' });
  }
};

// Get user's push subscriptions
export const getPushSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { subscribedAt: 'desc' },
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch push subscriptions' });
  }
};

// Unregister push subscription
export const unregisterPushSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { endpoint } = req.body;

    await prisma.pushSubscription.update({
      where: { endpoint },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unregistering push subscription:', error);
    res.status(500).json({ error: 'Failed to unregister push subscription' });
  }
};

// ============================================
// CONFIRMATION REQUESTS (3.3.7)
// ============================================

// Create confirmation request
export const createConfirmationRequest = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const {
      recipientId,
      interviewId,
      requestType,
      message,
      expiresInHours,
    } = req.body;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresInHours || 48));

    const request = await prisma.confirmationRequest.create({
      data: {
        senderId,
        recipientId,
        interviewId,
        requestType: requestType || 'ATTENDANCE',
        message,
        expiresAt,
      },
      include: {
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        interview: true,
      },
    });

    // In production, send notification to recipient
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating confirmation request:', error);
    res.status(500).json({ error: 'Failed to create confirmation request' });
  }
};

// Get confirmation requests (sent or received)
export const getConfirmationRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, status } = req.query;

    const where: any = {};
    if (type === 'sent') {
      where.senderId = userId;
    } else if (type === 'received') {
      where.recipientId = userId;
    } else {
      where.OR = [{ senderId: userId }, { recipientId: userId }];
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.confirmationRequest.findMany({
      where,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        interview: {
          include: {
            application: {
              include: { job: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching confirmation requests:', error);
    res.status(500).json({ error: 'Failed to fetch confirmation requests' });
  }
};

// Respond to confirmation request (confirm/decline)
export const respondToConfirmation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const {
      response,
      responseMessage,
      declineReason,
      suggestReschedule,
      suggestedTimes,
    } = req.body;

    const request = await prisma.confirmationRequest.findUnique({
      where: { token },
    });

    if (!request) {
      return res.status(404).json({ error: 'Confirmation request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already responded to' });
    }

    if (new Date() > request.expiresAt) {
      await prisma.confirmationRequest.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'Request has expired' });
    }

    const updated = await prisma.confirmationRequest.update({
      where: { token },
      data: {
        status: response === 'confirm' ? 'CONFIRMED' : 'DECLINED',
        respondedAt: new Date(),
        responseMessage,
        declineReason: response === 'decline' ? declineReason : null,
        suggestReschedule: suggestReschedule || false,
        suggestedTimes: suggestedTimes || null,
      },
      include: {
        interview: true,
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error responding to confirmation:', error);
    res.status(500).json({ error: 'Failed to respond to confirmation' });
  }
};

// Resend confirmation request
export const resendConfirmation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const request = await prisma.confirmationRequest.findFirst({
      where: { id, senderId: userId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Confirmation request not found' });
    }

    // In production, resend notification
    const updated = await prisma.confirmationRequest.update({
      where: { id },
      data: {
        notificationsSent: { increment: 1 },
        lastNotificationAt: new Date(),
      },
    });

    res.json({ success: true, request: updated });
  } catch (error) {
    console.error('Error resending confirmation:', error);
    res.status(500).json({ error: 'Failed to resend confirmation' });
  }
};

// ============================================
// PREP MATERIALS (3.3.8)
// ============================================

// Create prep material
export const createPrepMaterial = async (req: Request, res: Response) => {
  try {
    const createdById = (req as any).user.id;
    const {
      title,
      description,
      materialType,
      content,
      fileUrl,
      externalUrl,
      fileName,
      fileSize,
      mimeType,
      category,
      tags,
      forInterviewTypes,
      forJobIds,
      forDepartments,
      isPublic,
      sendAutomatically,
      hoursBefore,
    } = req.body;

    const material = await prisma.prepMaterial.create({
      data: {
        createdById,
        title,
        description,
        materialType,
        content,
        fileUrl,
        externalUrl,
        fileName,
        fileSize,
        mimeType,
        category,
        tags: tags || [],
        forInterviewTypes: forInterviewTypes || [],
        forJobIds: forJobIds || [],
        forDepartments: forDepartments || [],
        isPublic: isPublic || false,
        sendAutomatically: sendAutomatically !== false,
        hoursBefore: hoursBefore || 24,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating prep material:', error);
    res.status(500).json({ error: 'Failed to create prep material' });
  }
};

// Get prep materials
export const getPrepMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, materialType, isActive } = req.query;

    const where: any = {
      OR: [{ createdById: userId }, { isPublic: true }],
    };

    if (category) where.category = category;
    if (materialType) where.materialType = materialType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const materials = await prisma.prepMaterial.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(materials);
  } catch (error) {
    console.error('Error fetching prep materials:', error);
    res.status(500).json({ error: 'Failed to fetch prep materials' });
  }
};

// Update prep material
export const updatePrepMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    const material = await prisma.prepMaterial.update({
      where: { id, createdById: userId },
      data: updates,
    });

    res.json(material);
  } catch (error) {
    console.error('Error updating prep material:', error);
    res.status(500).json({ error: 'Failed to update prep material' });
  }
};

// Delete prep material
export const deletePrepMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.prepMaterial.delete({
      where: { id, createdById: userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting prep material:', error);
    res.status(500).json({ error: 'Failed to delete prep material' });
  }
};

// Schedule prep material delivery
export const schedulePrepDelivery = async (req: Request, res: Response) => {
  try {
    const {
      materialId,
      recipientId,
      interviewId,
      deliveryMethod,
      scheduledFor,
    } = req.body;

    const delivery = await prisma.prepMaterialDelivery.create({
      data: {
        materialId,
        recipientId,
        interviewId,
        deliveryMethod: deliveryMethod || 'EMAIL',
        scheduledFor: new Date(scheduledFor),
      },
      include: {
        material: true,
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error scheduling prep delivery:', error);
    res.status(500).json({ error: 'Failed to schedule prep delivery' });
  }
};

// Get prep deliveries
export const getPrepDeliveries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, interviewId } = req.query;

    const where: any = { recipientId: userId };
    if (status) where.status = status;
    if (interviewId) where.interviewId = interviewId;

    const deliveries = await prisma.prepMaterialDelivery.findMany({
      where,
      include: {
        material: true,
        interview: {
          include: {
            application: {
              include: { job: true },
            },
          },
        },
      },
      orderBy: { scheduledFor: 'desc' },
    });

    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching prep deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch prep deliveries' });
  }
};

// Mark prep material as viewed
export const markPrepViewed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const delivery = await prisma.prepMaterialDelivery.update({
      where: { id },
      data: {
        status: 'VIEWED',
        viewedAt: new Date(),
        openCount: { increment: 1 },
      },
    });

    // Update material view count
    await prisma.prepMaterial.update({
      where: { id: delivery.materialId },
      data: { viewCount: { increment: 1 } },
    });

    res.json(delivery);
  } catch (error) {
    console.error('Error marking prep as viewed:', error);
    res.status(500).json({ error: 'Failed to mark prep as viewed' });
  }
};

// Submit prep material feedback
export const submitPrepFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { helpfulRating, feedbackText } = req.body;

    const delivery = await prisma.prepMaterialDelivery.update({
      where: { id },
      data: {
        helpfulRating,
        feedbackText,
      },
    });

    res.json(delivery);
  } catch (error) {
    console.error('Error submitting prep feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Unsubscribe from all notifications
export const unsubscribeAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { reason } = req.body;

    await prisma.notificationPreference.update({
      where: { userId },
      data: {
        notificationsEnabled: false,
        emailEnabled: false,
        smsEnabled: false,
        whatsappEnabled: false,
        pushEnabled: false,
        unsubscribedAt: new Date(),
        unsubscribeReason: reason,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// ============================================
// SEND NOTIFICATIONS (Internal helpers)
// ============================================

// Send test notification
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { channel, type } = req.body;

    // In production, actually send the notification
    // For now, simulate success
    res.json({
      success: true,
      message: `Test ${type} notification sent via ${channel}`,
      sentAt: new Date(),
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const [sent, delivered, failed, opened] = await Promise.all([
      prisma.reminderNotification.count({
        where: { userId, status: 'SENT', sentAt: dateFilter },
      }),
      prisma.reminderNotification.count({
        where: { userId, status: 'DELIVERED', deliveredAt: dateFilter },
      }),
      prisma.reminderNotification.count({
        where: { userId, status: 'FAILED', failedAt: dateFilter },
      }),
      prisma.reminderNotification.count({
        where: { userId, openedAt: { not: null } },
      }),
    ]);

    const byChannel = await prisma.reminderNotification.groupBy({
      by: ['channel'],
      where: { userId },
      _count: true,
    });

    res.json({
      total: { sent, delivered, failed, opened },
      deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(2) : 0,
      openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : 0,
      byChannel: byChannel.reduce((acc, item) => {
        acc[item.channel] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};
