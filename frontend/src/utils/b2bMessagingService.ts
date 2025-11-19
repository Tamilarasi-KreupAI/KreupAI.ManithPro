// B2B Messaging & Communication Service
// Handles vendor-client messaging, negotiations, and Q&A

export type MessageType = 'TEXT' | 'DOCUMENT' | 'PROPOSAL_UPDATE' | 'MILESTONE_UPDATE' | 'PAYMENT_NOTIFICATION' | 'SYSTEM';

export interface B2BConversation {
  id: string;
  bulkRequestId?: string;
  proposalId?: string;
  contractId?: string;

  participants: {
    companyId: string;
    companyName: string;
    companyLogo?: string;
    role: 'CLIENT' | 'VENDOR';
    users: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    }[];
  }[];

  subject: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';

  lastMessage?: B2BMessage;
  unreadCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface B2BMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderCompany: string;
  senderRole: 'CLIENT' | 'VENDOR';

  type: MessageType;
  content: string;

  // Attachments
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];

  // Rich content
  richContent?: {
    proposalUpdate?: {
      field: string;
      oldValue: any;
      newValue: any;
    };
    milestoneUpdate?: {
      milestoneId: string;
      milestoneName: string;
      status: string;
    };
    paymentInfo?: {
      amount: number;
      currency: string;
      status: string;
    };
  };

  // Reactions
  reactions?: {
    emoji: string;
    userId: string;
    userName: string;
  }[];

  // Threading
  replyTo?: string;
  replyCount: number;

  isRead: boolean;
  readBy: {
    userId: string;
    readAt: string;
  }[];

  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
}

export interface NegotiationThread {
  id: string;
  conversationId: string;
  proposalId: string;

  subject: string;
  status: 'OPEN' | 'RESOLVED' | 'STALLED';

  // Negotiation items
  items: {
    id: string;
    field: string; // e.g., "pricing", "timeline", "candidateCount"
    clientProposal: any;
    vendorProposal: any;
    agreedValue?: any;
    status: 'PENDING' | 'AGREED' | 'REJECTED';
    notes?: string;
  }[];

  messages: B2BMessage[];

  createdAt: string;
  resolvedAt?: string;
}

export interface VideoCallSession {
  id: string;
  conversationId: string;

  title: string;
  scheduledAt: string;
  duration: number; // minutes

  participants: {
    userId: string;
    userName: string;
    companyName: string;
    role: 'HOST' | 'PARTICIPANT';
    joinedAt?: string;
    leftAt?: string;
  }[];

  meetingLink: string;
  platform: 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'CUSTOM';

  // Recording
  recordingUrl?: string;
  recordingAvailable: boolean;

  // Notes & Summary
  agenda?: string[];
  notes?: string;
  actionItems?: {
    description: string;
    assignedTo: string;
    dueDate?: string;
    completed: boolean;
  }[];

  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  createdAt: string;
  completedAt?: string;
}

class B2BMessagingService {
  private static instance: B2BMessagingService;
  private apiBase = '/api/b2b/messaging';

  private constructor() {}

  public static getInstance(): B2BMessagingService {
    if (!B2BMessagingService.instance) {
      B2BMessagingService.instance = new B2BMessagingService();
    }
    return B2BMessagingService.instance;
  }

  // Get all conversations
  async getConversations(filters?: { status?: string, companyId?: string }): Promise<B2BConversation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(`${this.apiBase}/conversations?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Get conversation
  async getConversation(id: string): Promise<B2BConversation | null> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch conversation');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  // Create conversation
  async createConversation(data: {
    bulkRequestId?: string;
    proposalId?: string;
    contractId?: string;
    participants: any[];
    subject: string;
  }): Promise<B2BConversation> {
    try {
      const response = await fetch(`${this.apiBase}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get messages
  async getMessages(conversationId: string, limit?: number, offset?: number): Promise<B2BMessage[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/messages?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Send message
  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<B2BMessage> {
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (attachments) {
        attachments.forEach(file => formData.append('attachments', file));
      }

      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  // Add reaction
  async addReaction(conversationId: string, messageId: string, emoji: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Start negotiation thread
  async startNegotiation(conversationId: string, proposalId: string, subject: string, items: any[]): Promise<NegotiationThread> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/negotiations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ proposalId, subject, items }),
      });

      if (!response.ok) throw new Error('Failed to start negotiation');
      return await response.json();
    } catch (error) {
      console.error('Error starting negotiation:', error);
      throw error;
    }
  }

  // Update negotiation item
  async updateNegotiationItem(negotiationId: string, itemId: string, proposal: any): Promise<NegotiationThread> {
    try {
      const response = await fetch(`${this.apiBase}/negotiations/${negotiationId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ proposal }),
      });

      if (!response.ok) throw new Error('Failed to update negotiation item');
      return await response.json();
    } catch (error) {
      console.error('Error updating negotiation item:', error);
      throw error;
    }
  }

  // Accept negotiation item
  async acceptNegotiationItem(negotiationId: string, itemId: string): Promise<NegotiationThread> {
    try {
      const response = await fetch(`${this.apiBase}/negotiations/${negotiationId}/items/${itemId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to accept negotiation item');
      return await response.json();
    } catch (error) {
      console.error('Error accepting negotiation item:', error);
      throw error;
    }
  }

  // Schedule video call
  async scheduleVideoCall(conversationId: string, data: {
    title: string;
    scheduledAt: string;
    duration: number;
    platform: string;
    agenda?: string[];
  }): Promise<VideoCallSession> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/video-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to schedule video call');
      return await response.json();
    } catch (error) {
      console.error('Error scheduling video call:', error);
      throw error;
    }
  }

  // Get video calls
  async getVideoCalls(conversationId: string): Promise<VideoCallSession[]> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${conversationId}/video-calls`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch video calls');
      return await response.json();
    } catch (error) {
      console.error('Error fetching video calls:', error);
      return [];
    }
  }

  // Add action item to video call
  async addActionItem(videoCallId: string, description: string, assignedTo: string, dueDate?: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/video-calls/${videoCallId}/action-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ description, assignedTo, dueDate }),
      });

      if (!response.ok) throw new Error('Failed to add action item');
    } catch (error) {
      console.error('Error adding action item:', error);
      throw error;
    }
  }

  // Archive conversation
  async archiveConversation(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/conversations/${id}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to archive conversation');
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(query: string, conversationId?: string): Promise<B2BMessage[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (conversationId) params.append('conversationId', conversationId);

      const response = await fetch(`${this.apiBase}/messages/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to search messages');
      return await response.json();
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }
}

export const b2bMessagingService = B2BMessagingService.getInstance();
