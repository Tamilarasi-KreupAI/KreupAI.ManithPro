// Interview Scheduling Service
// Handles interview scheduling, management, and feedback collection

export type InterviewType =
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'CODING'
  | 'ONSITE'
  | 'FINAL'
  | 'CULTURAL_FIT';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string; // ISO date string
  duration: number; // in minutes
  location?: string; // Physical location or video link
  meetingLink?: string;
  timezone: string;
  interviewers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  description?: string;
  agenda?: string[];
  feedback?: InterviewFeedback[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reminderSent: boolean;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-5
  technicalSkills?: number; // 1-5
  communication?: number; // 1-5
  problemSolving?: number; // 1-5
  cultureFit?: number; // 1-5
  strengths: string[];
  weaknesses: string[];
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  comments: string;
  createdAt: string;
}

export interface InterviewFilters {
  statuses?: InterviewStatus[];
  types?: InterviewType[];
  interviewerId?: string;
  candidateId?: string;
  jobId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface InterviewSlot {
  start: string;
  end: string;
  available: boolean;
  interviewerId?: string;
}

class InterviewService {
  private static instance: InterviewService;
  private apiBase = '/api/interviews';

  private constructor() {}

  public static getInstance(): InterviewService {
    if (!InterviewService.instance) {
      InterviewService.instance = new InterviewService();
    }
    return InterviewService.instance;
  }

  // Create new interview
  async createInterview(interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent'>): Promise<Interview> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) throw new Error('Failed to create interview');
      return await response.json();
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  }

  // Update interview
  async updateInterview(id: string, data: Partial<Interview>): Promise<Interview> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update interview');
      return await response.json();
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  }

  // Get all interviews
  async getInterviews(filters?: InterviewFilters): Promise<Interview[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
        if (filters.types) params.append('types', filters.types.join(','));
        if (filters.interviewerId) params.append('interviewerId', filters.interviewerId);
        if (filters.candidateId) params.append('candidateId', filters.candidateId);
        if (filters.jobId) params.append('jobId', filters.jobId);
        if (filters.dateRange) {
          params.append('dateFrom', filters.dateRange.from);
          params.append('dateTo', filters.dateRange.to);
        }
      }

      const response = await fetch(`${this.apiBase}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch interviews');
      return await response.json();
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return [];
    }
  }

  // Get single interview
  async getInterview(id: string): Promise<Interview | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch interview');
      return await response.json();
    } catch (error) {
      console.error('Error fetching interview:', error);
      return null;
    }
  }

  // Change interview status
  async changeStatus(id: string, status: InterviewStatus, note?: string): Promise<Interview> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, note }),
      });

      if (!response.ok) throw new Error('Failed to change interview status');
      return await response.json();
    } catch (error) {
      console.error('Error changing interview status:', error);
      throw error;
    }
  }

  // Reschedule interview
  async rescheduleInterview(id: string, newDateTime: string, note?: string): Promise<Interview> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ scheduledAt: newDateTime, note }),
      });

      if (!response.ok) throw new Error('Failed to reschedule interview');
      return await response.json();
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      throw error;
    }
  }

  // Cancel interview
  async cancelInterview(id: string, reason: string): Promise<Interview> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel interview');
      return await response.json();
    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error;
    }
  }

  // Add feedback to interview
  async addFeedback(interviewId: string, feedback: Omit<InterviewFeedback, 'id' | 'createdAt'>): Promise<InterviewFeedback> {
    try {
      const response = await fetch(`${this.apiBase}/${interviewId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) throw new Error('Failed to add feedback');
      return await response.json();
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  // Get available time slots
  async getAvailableSlots(
    interviewerIds: string[],
    startDate: string,
    endDate: string,
    duration: number
  ): Promise<InterviewSlot[]> {
    try {
      const params = new URLSearchParams({
        interviewers: interviewerIds.join(','),
        startDate,
        endDate,
        duration: duration.toString(),
      });

      const response = await fetch(`${this.apiBase}/available-slots?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch available slots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  // Send calendar invite
  async sendCalendarInvite(interviewId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${interviewId}/send-invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to send calendar invite');
    } catch (error) {
      console.error('Error sending calendar invite:', error);
      throw error;
    }
  }

  // Helper: Get interview type label
  getTypeLabel(type: InterviewType): string {
    const labels: Record<InterviewType, string> = {
      PHONE_SCREEN: 'Phone Screen',
      TECHNICAL: 'Technical Interview',
      BEHAVIORAL: 'Behavioral Interview',
      SYSTEM_DESIGN: 'System Design',
      CODING: 'Coding Interview',
      ONSITE: 'Onsite Interview',
      FINAL: 'Final Interview',
      CULTURAL_FIT: 'Cultural Fit',
    };
    return labels[type];
  }

  // Helper: Get status label
  getStatusLabel(status: InterviewStatus): string {
    const labels: Record<InterviewStatus, string> = {
      SCHEDULED: 'Scheduled',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      RESCHEDULED: 'Rescheduled',
      NO_SHOW: 'No Show',
    };
    return labels[status];
  }

  // Helper: Get status color
  getStatusColor(status: InterviewStatus): string {
    const colors: Record<InterviewStatus, string> = {
      SCHEDULED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      CONFIRMED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      IN_PROGRESS: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      COMPLETED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      RESCHEDULED: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      NO_SHOW: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    };
    return colors[status];
  }

  // Helper: Format interview duration
  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
}

export const interviewService = InterviewService.getInstance();
