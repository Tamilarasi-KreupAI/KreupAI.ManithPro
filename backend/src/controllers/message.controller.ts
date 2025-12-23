import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendMessageNotificationEmail } from '../utils/email';

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

    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: {
        recruiterProfile: true,
      },
    });

    if (!sender) {
      res.status(404).json({ error: 'Sender not found' });
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

    let companyName = 'Company';

    // If applicationId is provided, verify access and eligibility
    if (applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              postedBy: true,
            },
          },
          candidate: true,
        },
      });

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      applicationData = application;
      companyName = application.job.companyName || 'Company';

      // Verify user is either candidate or recruiter for this application
      const isCandidate = application.candidateId === senderId;
      const isRecruiter = application.job.postedById === senderId;

      if (!isCandidate && !isRecruiter) {
        res.status(403).json({ error: 'You do not have permission to send messages for this application' });
        return;
      }

      // Check if recruiter is messaging a candidate - verify eligibility
      if (isRecruiter && receiver.role === 'CANDIDATE') {
        const eligibleStatuses = ['SHORTLISTED', 'INTERVIEW_SCHEDULED'];
        if (!eligibleStatuses.includes(application.status)) {
          res.status(403).json({
            error: 'You can only message candidates who are shortlisted or scheduled for an interview',
            currentStatus: application.status,
            eligibleStatuses
          });
          return;
        }
      }
    } else {
      // If no applicationId, get company name from recruiter profile if sender is recruiter
      if (sender.role === 'RECRUITER' && sender.recruiterProfile) {
        companyName = sender.recruiterProfile.companyName;
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
<<<<<<< Updated upstream
        message: `You have a new message`,
=======
        message: `You have a new message from ${sender.firstName} ${sender.lastName}`,
>>>>>>> Stashed changes
        link: `/messages`,
        userId: receiverId,
      },
    });

    // Send email notification to receiver
    try {
      const senderName = `${sender.firstName} ${sender.lastName}`;
      const receiverName = `${receiver.firstName} ${receiver.lastName}`;
      const messagePreview = content.length > 200 ? content.substring(0, 200) + '...' : content;

      // Determine company name based on who is sending
      let emailCompanyName = companyName;
      if (sender.role === 'RECRUITER' && sender.recruiterProfile) {
        emailCompanyName = sender.recruiterProfile.companyName;
      }

      await sendMessageNotificationEmail(
        receiver.email,
        receiverName,
        senderName,
        emailCompanyName,
        messagePreview
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the message sending if email fails
    }

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

// Get eligible candidates for messaging (recruiter only)
export const getEligibleCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (userRole !== 'RECRUITER') {
      res.status(403).json({ error: 'Only recruiters can access this endpoint' });
      return;
    }

    // Get all applications for jobs posted by this recruiter where candidates are eligible
    const eligibleApplications = await prisma.application.findMany({
      where: {
        job: {
          postedById: userId,
        },
        status: {
          in: ['SHORTLISTED', 'INTERVIEW_SCHEDULED'],
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            skills: true,
            location: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      eligibleCandidates: eligibleApplications,
      count: eligibleApplications.length,
    });
  } catch (error) {
    console.error('Error fetching eligible candidates:', error);
    res.status(500).json({ error: 'Failed to fetch eligible candidates' });
  }
};
