import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, applicationId, attachments } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    // If applicationId is provided, verify access
    if (applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              postedBy: true,
            },
          },
        },
      });

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      // Verify user is either candidate or recruiter for this application
      const isCandidate = application.candidateId === senderId;
      const isRecruiter = application.job.postedById === senderId;

      if (!isCandidate && !isRecruiter) {
        res.status(403).json({ error: 'You do not have permission to send messages for this application' });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        applicationId,
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You have a new message`,
        link: `/messages`,
        userId: receiverId,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        status: {
          not: 'READ',
        },
      },
      data: {
        status: 'READ',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Get all conversations for current user
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all users the current user has exchanged messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by conversation partner
    const conversationMap = new Map();

    messages.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        const unreadCount = messages.filter(
          (m) => m.senderId === partnerId && m.receiverId === userId && m.status !== 'READ'
        ).length;

        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount,
        });
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get messages for an application
export const getApplicationMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user has access to this application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            postedBy: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // User must be either the candidate or the recruiter
    if (application.candidateId !== userId && application.job.postedById !== userId) {
      res.status(403).json({ error: 'You do not have permission to view these messages' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        applicationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        applicationId,
        receiverId: userId,
        status: {
          not: 'READ',
        },
      },
      data: {
        status: 'READ',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching application messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Mark message as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Only the receiver can mark as read
    if (message.receiverId !== userId) {
      res.status(403).json({ error: 'You can only mark your own messages as read' });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        status: 'READ',
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Get unread message count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        status: {
          not: 'READ',
        },
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
