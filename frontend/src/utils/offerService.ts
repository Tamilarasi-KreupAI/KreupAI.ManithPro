// Offer Management Service
// Handles job offer creation, approval workflow, and acceptance tracking

export type OfferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface Offer {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  status: OfferStatus;

  // Compensation
  baseSalary: number;
  currency: string;
  bonus?: number;
  equity?: {
    type: 'RSU' | 'STOCK_OPTIONS' | 'ISO';
    amount: number;
    vestingPeriod: number; // in months
  };
  signOnBonus?: number;

  // Benefits
  benefits: string[];
  ptoD

ays: number;
  healthInsurance: boolean;
  retirement401k: boolean;

  // Employment Details
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  startDate?: string;
  workLocation: 'REMOTE' | 'ONSITE' | 'HYBRID';
  location?: string;
  reportingTo?: string;

  // Offer Letter
  offerLetterUrl?: string;
  customClauses?: string[];

  // Approval Workflow
  approvers: {
    id: string;
    name: string;
    role: string;
    approved: boolean;
    approvedAt?: string;
    comments?: string;
  }[];

  // Timeline
  expiresAt?: string;
  sentAt?: string;
  respondedAt?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface OfferFilters {
  statuses?: OfferStatus[];
  jobIds?: string[];
  candidateIds?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface OfferStats {
  total: number;
  byStatus: Record<OfferStatus, number>;
  acceptanceRate: number;
  avgTimeToAccept: number; // in days
  pendingApproval: number;
  expiringSoon: number; // expires within 7 days
}

class OfferService {
  private static instance: OfferService;
  private apiBase = '/api/offers';

  private constructor() {}

  public static getInstance(): OfferService {
    if (!OfferService.instance) {
      OfferService.instance = new OfferService();
    }
    return OfferService.instance;
  }

  // Create new offer
  async createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) throw new Error('Failed to create offer');
      return await response.json();
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Update offer
  async updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update offer');
      return await response.json();
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  }

  // Get all offers
  async getOffers(filters?: OfferFilters): Promise<Offer[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
        if (filters.jobIds) params.append('jobIds', filters.jobIds.join(','));
        if (filters.candidateIds) params.append('candidateIds', filters.candidateIds.join(','));
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

      if (!response.ok) throw new Error('Failed to fetch offers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }

  // Get single offer
  async getOffer(id: string): Promise<Offer | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch offer');
      return await response.json();
    } catch (error) {
      console.error('Error fetching offer:', error);
      return null;
    }
  }

  // Submit for approval
  async submitForApproval(id: string): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to submit offer for approval');
      return await response.json();
    } catch (error) {
      console.error('Error submitting offer for approval:', error);
      throw error;
    }
  }

  // Approve offer
  async approveOffer(id: string, comments?: string): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) throw new Error('Failed to approve offer');
      return await response.json();
    } catch (error) {
      console.error('Error approving offer:', error);
      throw error;
    }
  }

  // Reject offer (by approver)
  async rejectOffer(id: string, reason: string): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject offer');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }

  // Send offer to candidate
  async sendOffer(id: string): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to send offer');
      return await response.json();
    } catch (error) {
      console.error('Error sending offer:', error);
      throw error;
    }
  }

  // Withdraw offer
  async withdrawOffer(id: string, reason: string): Promise<Offer> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to withdraw offer');
      return await response.json();
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      throw error;
    }
  }

  // Generate offer letter PDF
  async generateOfferLetter(id: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/generate-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to generate offer letter');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error generating offer letter:', error);
      throw error;
    }
  }

  // Get offer statistics
  async getOfferStats(): Promise<OfferStats> {
    try {
      const response = await fetch(`${this.apiBase}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch offer stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching offer stats:', error);
      return {
        total: 0,
        byStatus: {
          DRAFT: 0,
          PENDING_APPROVAL: 0,
          APPROVED: 0,
          SENT: 0,
          ACCEPTED: 0,
          DECLINED: 0,
          WITHDRAWN: 0,
          EXPIRED: 0,
        },
        acceptanceRate: 0,
        avgTimeToAccept: 0,
        pendingApproval: 0,
        expiringSoon: 0,
      };
    }
  }

  // Helper: Get status label
  getStatusLabel(status: OfferStatus): string {
    const labels: Record<OfferStatus, string> = {
      DRAFT: 'Draft',
      PENDING_APPROVAL: 'Pending Approval',
      APPROVED: 'Approved',
      SENT: 'Sent to Candidate',
      ACCEPTED: 'Accepted',
      DECLINED: 'Declined',
      WITHDRAWN: 'Withdrawn',
      EXPIRED: 'Expired',
    };
    return labels[status];
  }

  // Helper: Get status color
  getStatusColor(status: OfferStatus): string {
    const colors: Record<OfferStatus, string> = {
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      PENDING_APPROVAL: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      APPROVED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      SENT: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      ACCEPTED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      DECLINED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      WITHDRAWN: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
      EXPIRED: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    };
    return colors[status];
  }

  // Helper: Format compensation package
  formatCompensation(offer: Offer): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: offer.currency,
      minimumFractionDigits: 0,
    });

    let comp = formatter.format(offer.baseSalary);

    if (offer.bonus) {
      comp += ` + ${formatter.format(offer.bonus)} bonus`;
    }

    if (offer.equity) {
      comp += ` + ${offer.equity.amount} ${offer.equity.type}`;
    }

    return comp;
  }
}

export const offerService = OfferService.getInstance();
