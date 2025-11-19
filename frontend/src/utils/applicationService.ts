// Application Management Service
// Handles candidate application workflow, status tracking, and review management

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'PHONE_SCREEN'
  | 'TECHNICAL_INTERVIEW'
  | 'ONSITE_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER_EXTENDED'
  | 'OFFER_ACCEPTED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateAvatar?: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdated: string;
  source: 'DIRECT' | 'REFERRAL' | 'LINKEDIN' | 'INDEED' | 'OTHER';
  resumeUrl?: string;
  coverLetterUrl?: string;
  portfolioUrl?: string;
  rating?: number; // 1-5 stars
  overallScore?: number; // 0-100
  matchScore?: number; // From matching service
  notes: ApplicationNote[];
  reviews: ApplicationReview[];
  timeline: ApplicationTimelineEvent[];
  tags: string[];
  isBookmarked: boolean;
  assignedTo?: string; // Recruiter ID
}

export interface ApplicationNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface ApplicationReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  stage: ApplicationStatus;
  ratings: {
    technicalSkills: number; // 1-5
    communication: number;
    cultureFit: number;
    experience: number;
    problemSolving: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  comments: string;
  createdAt: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'REVIEW_ADDED' | 'EMAIL_SENT' | 'INTERVIEW_SCHEDULED' | 'DOCUMENT_UPLOADED';
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: any;
}

export interface ApplicationFilters {
  jobIds?: string[];
  statuses?: ApplicationStatus[];
  sources?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  minRating?: number;
  tags?: string[];
  assignedTo?: string;
  searchQuery?: string;
  isBookmarked?: boolean;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  bySource: Record<string, number>;
  averageRating: number;
  averageTimeToHire: number; // in days
  conversionRate: number; // percentage
  recentActivity: number; // last 7 days
}

export interface BulkActionPayload {
  applicationIds: string[];
  action: 'CHANGE_STATUS' | 'ASSIGN' | 'TAG' | 'SEND_EMAIL' | 'SCHEDULE_INTERVIEW' | 'EXPORT';
  data: any;
}

class ApplicationService {
  private static instance: ApplicationService;
  private apiBase = '/api/applications';

  private constructor() {}

  public static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  // Get all applications with optional filtering
  async getApplications(filters?: ApplicationFilters): Promise<Application[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.jobIds) params.append('jobIds', filters.jobIds.join(','));
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
        if (filters.sources) params.append('sources', filters.sources.join(','));
        if (filters.dateRange) {
          params.append('dateFrom', filters.dateRange.from);
          params.append('dateTo', filters.dateRange.to);
        }
        if (filters.minRating) params.append('minRating', filters.minRating.toString());
        if (filters.tags) params.append('tags', filters.tags.join(','));
        if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters.searchQuery) params.append('q', filters.searchQuery);
        if (filters.isBookmarked !== undefined) params.append('bookmarked', filters.isBookmarked.toString());
      }

      const response = await fetch(`${this.apiBase}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch applications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching applications:', error);
      return this.getMockApplications(filters);
    }
  }

  // Get single application by ID
  async getApplication(id: string): Promise<Application | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch application');
      return await response.json();
    } catch (error) {
      console.error('Error fetching application:', error);
      return null;
    }
  }

  // Update application status
  async updateApplicationStatus(id: string, status: ApplicationStatus, note?: string): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, note }),
      });

      if (!response.ok) throw new Error('Failed to update application status');
      return await response.json();
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Add note to application
  async addNote(applicationId: string, content: string, isPrivate: boolean = false): Promise<ApplicationNote> {
    try {
      const response = await fetch(`${this.apiBase}/${applicationId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, isPrivate }),
      });

      if (!response.ok) throw new Error('Failed to add note');
      return await response.json();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Add review to application
  async addReview(applicationId: string, review: Omit<ApplicationReview, 'id' | 'createdAt'>): Promise<ApplicationReview> {
    try {
      const response = await fetch(`${this.apiBase}/${applicationId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to add review');
      return await response.json();
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Rate application
  async rateApplication(id: string, rating: number): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/rating`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) throw new Error('Failed to rate application');
      return await response.json();
    } catch (error) {
      console.error('Error rating application:', error);
      throw error;
    }
  }

  // Toggle bookmark
  async toggleBookmark(id: string): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle bookmark');
      return await response.json();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  // Assign application to recruiter
  async assignApplication(id: string, recruiterId: string): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ recruiterId }),
      });

      if (!response.ok) throw new Error('Failed to assign application');
      return await response.json();
    } catch (error) {
      console.error('Error assigning application:', error);
      throw error;
    }
  }

  // Add tags to application
  async addTag(id: string, tag: string): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) throw new Error('Failed to add tag');
      return await response.json();
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  // Remove tag from application
  async removeTag(id: string, tag: string): Promise<Application> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to remove tag');
      return await response.json();
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStats(jobId?: string): Promise<ApplicationStats> {
    try {
      const url = jobId ? `${this.apiBase}/stats?jobId=${jobId}` : `${this.apiBase}/stats`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch application stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching application stats:', error);
      return this.getMockStats();
    }
  }

  // Bulk actions
  async performBulkAction(payload: BulkActionPayload): Promise<{ success: boolean; affectedCount: number }> {
    try {
      const response = await fetch(`${this.apiBase}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to perform bulk action');
      return await response.json();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  // Export applications
  async exportApplications(filters?: ApplicationFilters, format: 'csv' | 'pdf' = 'csv'): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters) {
        if (filters.jobIds) params.append('jobIds', filters.jobIds.join(','));
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
      }

      const response = await fetch(`${this.apiBase}/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export applications');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  }

  // Helper: Get status label
  getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      APPLIED: 'Applied',
      SCREENING: 'Screening',
      PHONE_SCREEN: 'Phone Screen',
      TECHNICAL_INTERVIEW: 'Technical Interview',
      ONSITE_INTERVIEW: 'Onsite Interview',
      FINAL_INTERVIEW: 'Final Interview',
      OFFER_EXTENDED: 'Offer Extended',
      OFFER_ACCEPTED: 'Offer Accepted',
      HIRED: 'Hired',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn',
    };
    return labels[status];
  }

  // Helper: Get status color
  getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      APPLIED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      SCREENING: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      PHONE_SCREEN: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      TECHNICAL_INTERVIEW: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
      ONSITE_INTERVIEW: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700',
      FINAL_INTERVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      OFFER_EXTENDED: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
      OFFER_ACCEPTED: 'bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300 border-lime-300 dark:border-lime-700',
      HIRED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      REJECTED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      WITHDRAWN: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
    };
    return colors[status];
  }

  // Helper: Get next possible statuses
  getNextStatuses(currentStatus: ApplicationStatus): ApplicationStatus[] {
    const workflow: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
      SCREENING: ['PHONE_SCREEN', 'REJECTED', 'WITHDRAWN'],
      PHONE_SCREEN: ['TECHNICAL_INTERVIEW', 'REJECTED', 'WITHDRAWN'],
      TECHNICAL_INTERVIEW: ['ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'REJECTED', 'WITHDRAWN'],
      ONSITE_INTERVIEW: ['FINAL_INTERVIEW', 'OFFER_EXTENDED', 'REJECTED', 'WITHDRAWN'],
      FINAL_INTERVIEW: ['OFFER_EXTENDED', 'REJECTED', 'WITHDRAWN'],
      OFFER_EXTENDED: ['OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      OFFER_ACCEPTED: ['HIRED'],
      HIRED: [],
      REJECTED: [],
      WITHDRAWN: [],
    };
    return workflow[currentStatus] || [];
  }

  // Mock data for development
  private getMockApplications(filters?: ApplicationFilters): Application[] {
    const mockApps: Application[] = [
      {
        id: 'app-1',
        jobId: 'job-1',
        jobTitle: 'Senior Frontend Developer',
        candidateId: 'cand-1',
        candidateName: 'Sarah Johnson',
        candidateEmail: 'sarah.j@email.com',
        candidatePhone: '+1-555-0101',
        status: 'TECHNICAL_INTERVIEW',
        appliedDate: '2025-01-10',
        lastUpdated: '2025-01-15',
        source: 'LINKEDIN',
        rating: 4,
        matchScore: 85,
        notes: [],
        reviews: [],
        timeline: [],
        tags: ['frontend', 'react', 'senior'],
        isBookmarked: true,
      },
      {
        id: 'app-2',
        jobId: 'job-1',
        jobTitle: 'Senior Frontend Developer',
        candidateId: 'cand-2',
        candidateName: 'Michael Chen',
        candidateEmail: 'mchen@email.com',
        status: 'SCREENING',
        appliedDate: '2025-01-12',
        lastUpdated: '2025-01-12',
        source: 'DIRECT',
        rating: 3,
        matchScore: 72,
        notes: [],
        reviews: [],
        timeline: [],
        tags: ['frontend'],
        isBookmarked: false,
      },
    ];
    return mockApps;
  }

  private getMockStats(): ApplicationStats {
    return {
      total: 150,
      byStatus: {
        APPLIED: 45,
        SCREENING: 30,
        PHONE_SCREEN: 20,
        TECHNICAL_INTERVIEW: 15,
        ONSITE_INTERVIEW: 10,
        FINAL_INTERVIEW: 8,
        OFFER_EXTENDED: 5,
        OFFER_ACCEPTED: 3,
        HIRED: 10,
        REJECTED: 2,
        WITHDRAWN: 2,
      },
      bySource: {
        DIRECT: 60,
        LINKEDIN: 45,
        INDEED: 30,
        REFERRAL: 15,
      },
      averageRating: 3.8,
      averageTimeToHire: 21,
      conversionRate: 6.7,
      recentActivity: 23,
    };
  }
}

export const applicationService = ApplicationService.getInstance();
