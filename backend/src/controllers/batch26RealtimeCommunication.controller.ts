import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 7.1.1-7.1.2 USER PRESENCE
// ============================================================================

// Update user presence status
export const updatePresence = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, customStatus, currentPage, currentActivity, deviceType, browserInfo, platform } = req.body;

    const presence = await prisma.userPresence.upsert({
      where: { userId },
      update: {
        status,
        customStatus,
        currentPage,
        currentActivity,
        deviceType,
        browserInfo,
        platform,
        lastSeen: new Date(),
      },
      create: {
        userId,
        status: status || 'ONLINE',
        customStatus,
        currentPage,
        currentActivity,
        deviceType,
        browserInfo,
        platform,
      },
    });

    res.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update presence',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get user presence
export const getUserPresence = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const presence = await prisma.userPresence.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: presence || { userId, status: 'OFFLINE', lastSeen: null },
    });
  } catch (error) {
    console.error('Error fetching presence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch presence',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get multiple users' presence
export const getBulkPresence = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;

    const presences = await prisma.userPresence.findMany({
      where: { userId: { in: userIds } },
    });

    // Create map with default offline for missing users
    const presenceMap: Record<string, any> = {};
    userIds.forEach((id: string) => {
      presenceMap[id] = { userId: id, status: 'OFFLINE', lastSeen: null };
    });
    presences.forEach((p) => {
      presenceMap[p.userId] = p;
    });

    res.json({
      success: true,
      data: presenceMap,
    });
  } catch (error) {
    console.error('Error fetching bulk presence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk presence',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update presence preferences
export const updatePresencePreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { autoAway, autoAwayMinutes, showPresence } = req.body;

    const presence = await prisma.userPresence.upsert({
      where: { userId },
      update: { autoAway, autoAwayMinutes, showPresence },
      create: { userId, autoAway, autoAwayMinutes, showPresence },
    });

    res.json({
      success: true,
      data: presence,
      message: 'Presence preferences updated',
    });
  } catch (error) {
    console.error('Error updating presence preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update presence preferences',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.1.1 WEBSOCKET CONNECTIONS
// ============================================================================

// Register connection
export const registerConnection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { socketId, clientVersion, deviceId, ipAddress, userAgent } = req.body;

    const connection = await prisma.realtimeConnection.create({
      data: {
        userId,
        socketId,
        clientVersion,
        deviceId,
        ipAddress,
        userAgent,
        isActive: true,
      },
    });

    // Update user presence to online
    await prisma.userPresence.upsert({
      where: { userId },
      update: { status: 'ONLINE', lastSeen: new Date() },
      create: { userId, status: 'ONLINE' },
    });

    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error('Error registering connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register connection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Disconnect
export const disconnectConnection = async (req: Request, res: Response) => {
  try {
    const { socketId } = req.params;
    const { reason } = req.body;

    const connection = await prisma.realtimeConnection.update({
      where: { socketId },
      data: {
        isActive: false,
        disconnectedAt: new Date(),
        disconnectReason: reason,
      },
    });

    // Check if user has other active connections
    const activeConnections = await prisma.realtimeConnection.count({
      where: { userId: connection.userId, isActive: true },
    });

    if (activeConnections === 0) {
      await prisma.userPresence.update({
        where: { userId: connection.userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });
    }

    res.json({
      success: true,
      message: 'Disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Subscribe to channels
export const subscribeToChannels = async (req: Request, res: Response) => {
  try {
    const { socketId } = req.params;
    const { channels } = req.body;

    const connection = await prisma.realtimeConnection.update({
      where: { socketId },
      data: {
        subscribedChannels: channels,
      },
    });

    res.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error('Error subscribing to channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to channels',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.1.3 REAL-TIME NOTIFICATIONS
// ============================================================================

// Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      companyId,
      type,
      title,
      body,
      icon,
      imageUrl,
      entityType,
      entityId,
      actionUrl,
      priority,
      sound,
      vibrate,
      persistent,
      actions,
      expiresAt,
      metadata,
    } = req.body;

    const notification = await prisma.realtimeNotification.create({
      data: {
        userId,
        companyId,
        type,
        title,
        body,
        icon,
        imageUrl,
        entityType,
        entityId,
        actionUrl,
        priority: priority || 'NORMAL',
        sound: sound !== false,
        vibrate: vibrate !== false,
        persistent: persistent || false,
        actions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata,
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, isRead, page = 1, limit = 20 } = req.query;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.realtimeNotification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.realtimeNotification.count({ where }),
      prisma.realtimeNotification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Mark notification as read
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.realtimeNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.realtimeNotification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Dismiss notification
export const dismissNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.realtimeNotification.update({
      where: { id },
      data: {
        isDismissed: true,
        dismissedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.1-7.2.2 CONVERSATIONS
// ============================================================================

// Create conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      companyId,
      type,
      name,
      description,
      avatarUrl,
      contextType,
      contextId,
      participantIds,
      isPublic,
      maxParticipants,
    } = req.body;

    // For direct messages, check if conversation already exists
    if (type === 'DIRECT' && participantIds && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: [userId, participantIds[0]] },
            },
          },
        },
        include: { participants: true },
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return res.json({
          success: true,
          data: existingConversation,
          message: 'Existing conversation found',
        });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        companyId,
        type: type || 'DIRECT',
        name,
        description,
        avatarUrl,
        contextType,
        contextId,
        isPublic: isPublic || false,
        maxParticipants,
        createdBy: userId,
        participants: {
          create: [
            { userId, role: 'OWNER' },
            ...(participantIds || []).map((pid: string) => ({ userId: pid, role: 'MEMBER' })),
          ],
        },
      },
      include: { participants: true },
    });

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully',
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, isArchived, page = 1, limit = 20 } = req.query;

    const where: any = {
      participants: {
        some: { userId, isActive: true },
      },
    };
    if (type) where.type = type;
    if (isArchived !== undefined) where.isArchived = isArchived === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { lastMessageAt: 'desc' },
        include: {
          participants: true,
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({
      success: true,
      data: conversations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get conversation by ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update conversation
export const updateConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, avatarUrl, isArchived, isMuted, allowReactions, allowAttachments } = req.body;

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        name,
        description,
        avatarUrl,
        isArchived,
        isMuted,
        allowReactions,
        allowAttachments,
      },
    });

    res.json({
      success: true,
      data: conversation,
      message: 'Conversation updated successfully',
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add participant to conversation
export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId: id,
        userId,
        role: role || 'MEMBER',
      },
    });

    res.status(201).json({
      success: true,
      data: participant,
      message: 'Participant added successfully',
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove participant from conversation
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const removedBy = (req as any).user.id;

    await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: {
        isActive: false,
        leftAt: new Date(),
        removedBy,
      },
    });

    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update participant settings
export const updateParticipantSettings = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.id;
    const { isMuted, isPinned, notifyOnMessage, notifyOnMention } = req.body;

    const participant = await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { isMuted, isPinned, notifyOnMessage, notifyOnMention },
    });

    res.json({
      success: true,
      data: participant,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating participant settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.1 MESSAGES
// ============================================================================

// Send message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { conversationId, type, content, richContent, replyToId, mentions, metadata } = req.body;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        type: type || 'TEXT',
        content,
        richContent,
        replyToId,
        mentions,
        metadata,
        status: 'SENT',
      },
      include: {
        attachments: true,
        reactions: true,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    // Update unread counts for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    // If reply, increment thread count
    if (replyToId) {
      await prisma.message.update({
        where: { id: replyToId },
        data: { threadCount: { increment: 1 } },
      });
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get messages
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { before, after, limit = 50 } = req.query;

    const where: any = { conversationId, deletedAt: null };
    if (before) where.createdAt = { lt: new Date(before as string) };
    if (after) where.createdAt = { gt: new Date(after as string) };

    const messages = await prisma.message.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        attachments: true,
        reactions: true,
      },
    });

    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Edit message
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, richContent } = req.body;

    const message = await prisma.message.update({
      where: { id },
      data: {
        content,
        richContent,
        editedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: message,
      message: 'Message edited successfully',
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBy = (req as any).user.id;

    const message = await prisma.message.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    res.json({
      success: true,
      data: message,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Mark messages as read (7.1.6)
export const markMessagesRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.id;
    const { lastMessageId } = req.body;

    // Update participant's read status
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: {
        lastReadMessageId: lastMessageId,
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add reaction
export const addReaction = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).user.id;
    const { emoji } = req.body;

    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
    });

    res.status(201).json({
      success: true,
      data: reaction,
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove reaction
export const removeReaction = async (req: Request, res: Response) => {
  try {
    const { messageId, emoji } = req.params;
    const userId = (req as any).user.id;

    await prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
    });

    res.json({
      success: true,
      message: 'Reaction removed',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.3 MESSAGE TEMPLATES
// ============================================================================

// Create template
export const createMessageTemplate = async (req: Request, res: Response) => {
  try {
    const createdBy = (req as any).user.id;
    const { companyId, name, shortcut, category, content, richContent, variables, isShared } = req.body;

    const template = await prisma.messageTemplate.create({
      data: {
        companyId,
        userId: isShared ? null : createdBy,
        name,
        shortcut,
        category,
        content,
        richContent,
        variables,
        isShared: isShared || false,
        createdBy,
      },
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get templates
export const getMessageTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, companyId, page = 1, limit = 50 } = req.query;

    const where: any = {
      OR: [
        { userId },
        { isShared: true },
      ],
      isActive: true,
    };
    if (category) where.category = category;
    if (companyId) where.companyId = companyId;

    const skip = (Number(page) - 1) * Number(limit);

    const [templates, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { usageCount: 'desc' },
      }),
      prisma.messageTemplate.count({ where }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Use template (increment usage)
export const useMessageTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to use template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update template
export const updateMessageTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete template
export const deleteMessageTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.messageTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.4 SCHEDULED MESSAGES
// ============================================================================

// Schedule message
export const scheduleMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const {
      conversationId,
      type,
      content,
      richContent,
      attachmentIds,
      scheduledFor,
      timezone,
      isRecurring,
      recurrenceRule,
    } = req.body;

    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        conversationId,
        senderId,
        type: type || 'TEXT',
        content,
        richContent,
        attachmentIds,
        scheduledFor: new Date(scheduledFor),
        timezone: timezone || 'UTC',
        isRecurring: isRecurring || false,
        recurrenceRule,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: scheduledMessage,
      message: 'Message scheduled successfully',
    });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get scheduled messages
export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { conversationId, status, page = 1, limit = 20 } = req.query;

    const where: any = { senderId };
    if (conversationId) where.conversationId = conversationId;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      prisma.scheduledMessage.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledFor: 'asc' },
      }),
      prisma.scheduledMessage.count({ where }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Cancel scheduled message
export const cancelScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.scheduledMessage.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      data: message,
      message: 'Scheduled message cancelled',
    });
  } catch (error) {
    console.error('Error cancelling scheduled message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update scheduled message
export const updateScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, richContent, scheduledFor, timezone } = req.body;

    const message = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        content,
        richContent,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        timezone,
      },
    });

    res.json({
      success: true,
      data: message,
      message: 'Scheduled message updated',
    });
  } catch (error) {
    console.error('Error updating scheduled message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.5 MESSAGE SEARCH
// ============================================================================

// Search messages
export const searchMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, conversationId, senderId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Get user's conversations
    const userConversations = await prisma.conversationParticipant.findMany({
      where: { userId, isActive: true },
      select: { conversationId: true },
    });

    const conversationIds = userConversations.map((c) => c.conversationId);

    const where: any = {
      conversationId: conversationId ? { equals: conversationId } : { in: conversationIds },
      deletedAt: null,
    };

    if (query) {
      where.content = { contains: query as string, mode: 'insensitive' };
    }
    if (senderId) where.senderId = senderId;
    if (type) where.type = type;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { conversation: true },
      }),
      prisma.message.count({ where }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.6 FILE ATTACHMENTS
// ============================================================================

// Upload attachment
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const { messageId, fileName, fileType, fileSize, fileUrl, thumbnailUrl, attachmentType, dimensions, duration } = req.body;

    const attachment = await prisma.messageAttachment.create({
      data: {
        messageId,
        fileName,
        fileType,
        fileSize,
        fileUrl,
        thumbnailUrl,
        attachmentType,
        dimensions,
        duration,
        isProcessed: true,
      },
    });

    res.status(201).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload attachment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.1.5 TYPING INDICATORS
// ============================================================================

// Set typing indicator
export const setTypingIndicator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId, isTyping } = req.body;

    if (isTyping) {
      await prisma.typingIndicator.upsert({
        where: { conversationId_userId: { conversationId, userId } },
        update: {
          isTyping: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 5000), // 5 seconds
        },
        create: {
          conversationId,
          userId,
          isTyping: true,
          expiresAt: new Date(Date.now() + 5000),
        },
      });
    } else {
      await prisma.typingIndicator.deleteMany({
        where: { conversationId, userId },
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error setting typing indicator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set typing indicator',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get typing indicators for conversation
export const getTypingIndicators = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const indicators = await prisma.typingIndicator.findMany({
      where: {
        conversationId,
        expiresAt: { gt: new Date() },
      },
    });

    res.json({
      success: true,
      data: indicators,
    });
  } catch (error) {
    console.error('Error fetching typing indicators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch typing indicators',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// 7.2.8 EMAIL FALLBACK
// ============================================================================

// Get email fallback config
export const getEmailFallbackConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const config = await prisma.emailFallbackConfig.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: config || {
        userId,
        enabled: true,
        offlineMinutes: 15,
        digestMode: false,
        includeContent: true,
      },
    });
  } catch (error) {
    console.error('Error fetching email fallback config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email fallback config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update email fallback config
export const updateEmailFallbackConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { enabled, offlineMinutes, digestMode, digestIntervalHours, includeContent, includeSender, maxEmailsPerDay } = req.body;

    const config = await prisma.emailFallbackConfig.upsert({
      where: { userId },
      update: { enabled, offlineMinutes, digestMode, digestIntervalHours, includeContent, includeSender, maxEmailsPerDay },
      create: { userId, enabled, offlineMinutes, digestMode, digestIntervalHours, includeContent, includeSender, maxEmailsPerDay },
    });

    res.json({
      success: true,
      data: config,
      message: 'Email fallback config updated',
    });
  } catch (error) {
    console.error('Error updating email fallback config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email fallback config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================================================
// STATS
// ============================================================================

// Get communication stats
export const getCommunicationStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [
      totalConversations,
      unreadMessages,
      totalMessages,
      scheduledMessages,
      templates,
    ] = await Promise.all([
      prisma.conversationParticipant.count({ where: { userId, isActive: true } }),
      prisma.conversationParticipant.aggregate({
        where: { userId, isActive: true },
        _sum: { unreadCount: true },
      }),
      prisma.message.count({ where: { senderId: userId } }),
      prisma.scheduledMessage.count({ where: { senderId: userId, status: 'PENDING' } }),
      prisma.messageTemplate.count({ where: { OR: [{ userId }, { isShared: true }], isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalConversations,
        unreadMessages: unreadMessages._sum.unreadCount || 0,
        totalMessagesSent: totalMessages,
        pendingScheduled: scheduledMessages,
        availableTemplates: templates,
      },
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
