// B2B Bulk Hiring Service
// Handles company-to-company bulk candidate requests and marketplace

export type BulkRequestStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'CANDIDATES_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type IndustryType =
  | 'TECHNOLOGY'
  | 'FINANCE'
  | 'HEALTHCARE'
  | 'MANUFACTURING'
  | 'RETAIL'
  | 'EDUCATION'
  | 'CONSULTING'
  | 'OTHER';

export interface BulkHiringRequest {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  industry: IndustryType;
  status: BulkRequestStatus;

  // Request Details
  title: string;
  description: string;
  numberOfCandidates: number;
  roles: {
    title: string;
    count: number;
    experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
    requiredSkills: string[];
    description: string;
  }[];

  // Requirements
  timeline: string; // e.g., "Within 3 months"
  budget?: {
    perCandidateFee: number;
    totalBudget: number;
    currency: string;
  };
  preferredLocations: string[];
  remoteOptions: 'REMOTE_ONLY' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';

  // Qualification Criteria
  minimumExperience: number; // in years
  requiredCertifications?: string[];
  educationLevel?: 'HIGH_SCHOOL' | 'BACHELORS' | 'MASTERS' | 'PHD';
  industryExperience?: IndustryType[];

  // Additional Services
  requiresOnboarding: boolean;
  requiresBackgroundCheck: boolean;
  requiresVisaSponsorship: boolean;

  // Proposals
  proposals: BulkHiringProposal[];
  selectedProposalId?: string;

  // Timeline
  deadline?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  completedAt?: string;
}

export interface BulkHiringProposal {
  id: string;
  bulkRequestId: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number; // 1-5
  vendorCompletedProjects: number;

  // Proposal Details
  proposedCandidates: number;
  timeline: string;
  pricing: {
    perCandidateFee: number;
    totalCost: number;
    currency: string;
    paymentTerms: string;
  };

  // Candidate Pool Info
  candidateBreakdown: {
    roleTitle: string;
    availableCount: number;
    averageExperience: number;
    topSkills: string[];
  }[];

  // Value Proposition
  coverLetter: string;
  guarantees: string[];
  additionalServices: string[];

  // Candidate Submissions
  submittedCandidates?: {
    candidateId: string;
    name: string;
    role: string;
    experience: number;
    skills: string[];
    resumeUrl: string;
    status: 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEWING' | 'HIRED' | 'REJECTED';
  }[];

  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
  respondedAt?: string;
}

export interface CompanyMarketplaceProfile {
  id: string;
  companyName: string;
  companyLogo?: string;
  industry: IndustryType;
  description: string;
  website?: string;
  size: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

  // Recruitment Capabilities
  specializations: IndustryType[];
  candidateDatabase: {
    total: number;
    byRole: Record<string, number>;
    byExperience: Record<string, number>;
  };

  // Track Record
  completedProjects: number;
  averageRating: number;
  successRate: number; // percentage
  averagePlacementTime: number; // in days

  // Services
  services: string[];
  certifications: string[];

  isVerified: boolean;
  joinedDate: string;
}

export interface BulkRequestFilters {
  statuses?: BulkRequestStatus[];
  industries?: IndustryType[];
  minBudget?: number;
  maxBudget?: number;
  numberOfCandidates?: {
    min: number;
    max: number;
  };
  remoteOptions?: string[];
}

class BulkHiringService {
  private static instance: BulkHiringService;
  private apiBase = '/api/bulk-hiring';

  private constructor() {}

  public static getInstance(): BulkHiringService {
    if (!BulkHiringService.instance) {
      BulkHiringService.instance = new BulkHiringService();
    }
    return BulkHiringService.instance;
  }

  // Create bulk hiring request
  async createRequest(requestData: Omit<BulkHiringRequest, 'id' | 'createdAt' | 'updatedAt' | 'proposals'>): Promise<BulkHiringRequest> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to create bulk hiring request');
      return await response.json();
    } catch (error) {
      console.error('Error creating bulk hiring request:', error);
      throw error;
    }
  }

  // Update bulk hiring request
  async updateRequest(id: string, data: Partial<BulkHiringRequest>): Promise<BulkHiringRequest> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update bulk hiring request');
      return await response.json();
    } catch (error) {
      console.error('Error updating bulk hiring request:', error);
      throw error;
    }
  }

  // Get all bulk hiring requests (marketplace view)
  async getRequests(filters?: BulkRequestFilters): Promise<BulkHiringRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
        if (filters.industries) params.append('industries', filters.industries.join(','));
        if (filters.minBudget) params.append('minBudget', filters.minBudget.toString());
        if (filters.maxBudget) params.append('maxBudget', filters.maxBudget.toString());
        if (filters.remoteOptions) params.append('remoteOptions', filters.remoteOptions.join(','));
      }

      const response = await fetch(`${this.apiBase}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bulk hiring requests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bulk hiring requests:', error);
      return [];
    }
  }

  // Get single bulk hiring request
  async getRequest(id: string): Promise<BulkHiringRequest | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bulk hiring request');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bulk hiring request:', error);
      return null;
    }
  }

  // Publish request to marketplace
  async publishRequest(id: string): Promise<BulkHiringRequest> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to publish bulk hiring request');
      return await response.json();
    } catch (error) {
      console.error('Error publishing bulk hiring request:', error);
      throw error;
    }
  }

  // Submit proposal for bulk request
  async submitProposal(requestId: string, proposalData: Omit<BulkHiringProposal, 'id' | 'submittedAt' | 'status'>): Promise<BulkHiringProposal> {
    try {
      const response = await fetch(`${this.apiBase}/${requestId}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) throw new Error('Failed to submit proposal');
      return await response.json();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw error;
    }
  }

  // Accept proposal
  async acceptProposal(requestId: string, proposalId: string): Promise<BulkHiringRequest> {
    try {
      const response = await fetch(`${this.apiBase}/${requestId}/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to accept proposal');
      return await response.json();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      throw error;
    }
  }

  // Reject proposal
  async rejectProposal(requestId: string, proposalId: string, reason: string): Promise<BulkHiringRequest> {
    try {
      const response = await fetch(`${this.apiBase}/${requestId}/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject proposal');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      throw error;
    }
  }

  // Submit candidates for accepted proposal
  async submitCandidates(requestId: string, proposalId: string, candidates: any[]): Promise<BulkHiringProposal> {
    try {
      const response = await fetch(`${this.apiBase}/${requestId}/proposals/${proposalId}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidates }),
      });

      if (!response.ok) throw new Error('Failed to submit candidates');
      return await response.json();
    } catch (error) {
      console.error('Error submitting candidates:', error);
      throw error;
    }
  }

  // Get marketplace companies
  async getMarketplaceCompanies(filters?: { industries?: IndustryType[], minRating?: number }): Promise<CompanyMarketplaceProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.industries) params.append('industries', filters.industries.join(','));
        if (filters.minRating) params.append('minRating', filters.minRating.toString());
      }

      const response = await fetch(`${this.apiBase}/marketplace/companies?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch marketplace companies');
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketplace companies:', error);
      return [];
    }
  }

  // Helper: Get status label
  getStatusLabel(status: BulkRequestStatus): string {
    const labels: Record<BulkRequestStatus, string> = {
      DRAFT: 'Draft',
      PUBLISHED: 'Published',
      IN_PROGRESS: 'In Progress',
      CANDIDATES_SUBMITTED: 'Candidates Submitted',
      UNDER_REVIEW: 'Under Review',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labels[status];
  }

  // Helper: Get status color
  getStatusColor(status: BulkRequestStatus): string {
    const colors: Record<BulkRequestStatus, string> = {
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      PUBLISHED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      IN_PROGRESS: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      CANDIDATES_SUBMITTED: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      COMPLETED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
    };
    return colors[status];
  }

  // Helper: Format budget
  formatBudget(budget?: { perCandidateFee: number; totalBudget: number; currency: string }): string {
    if (!budget) return 'Budget not specified';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget.currency,
      minimumFractionDigits: 0,
    });

    return `${formatter.format(budget.perCandidateFee)}/candidate (Total: ${formatter.format(budget.totalBudget)})`;
  }
}

export const bulkHiringService = BulkHiringService.getInstance();
