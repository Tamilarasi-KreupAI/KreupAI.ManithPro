// B2B Contract & SLA Management Service
// Handles contracts, agreements, milestones, and SLA tracking

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURES'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'DISPUTED';

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export interface B2BContract {
  id: string;
  bulkRequestId: string;
  proposalId: string;
  clientCompanyId: string;
  clientCompanyName: string;
  vendorCompanyId: string;
  vendorCompanyName: string;
  status: ContractStatus;

  // Contract Terms
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentTerms: 'MILESTONE' | 'MONTHLY' | 'PER_PLACEMENT' | 'UPFRONT';

  // SLA (Service Level Agreement)
  sla: {
    candidateSubmissionDeadline: number; // days
    replacementGuarantee: number; // days (if hire doesn't work out)
    responseTime: number; // hours for communication
    qualityMetrics: {
      minInterviewRate: number; // percentage
      minHireRate: number; // percentage
      minRetentionRate: number; // percentage after 90 days
    };
    penalties: {
      lateSubmission: number; // percentage of contract value
      qualityBreach: number; // percentage of contract value
    };
  };

  // Milestones
  milestones: ContractMilestone[];

  // Legal Documents
  documents: {
    id: string;
    type: 'MSA' | 'SOW' | 'NDA' | 'DPA' | 'AMENDMENT';
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];

  // Signatures
  signatures: {
    partyType: 'CLIENT' | 'VENDOR';
    signerName: string;
    signerEmail: string;
    signedAt?: string;
    ipAddress?: string;
    signature?: string; // Base64 encoded signature image
  }[];

  // Compliance
  gdprCompliant: boolean;
  dataRetentionPeriod: number; // days
  backgroundCheckRequired: boolean;

  // Performance Tracking
  performance: {
    candidatesSubmitted: number;
    candidatesInterviewed: number;
    candidatesHired: number;
    avgTimeToSubmit: number; // days
    slaBreaches: number;
    qualityScore: number; // 0-100
  };

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  name: string;
  description: string;
  status: MilestoneStatus;

  // Deliverables
  deliverables: {
    type: 'CANDIDATES' | 'PLACEMENTS' | 'REPORTS';
    quantity: number;
    completed: number;
  }[];

  // Payment
  paymentAmount: number;
  paymentDueDate?: string;
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'DISPUTED';
  invoiceId?: string;

  // Deadlines
  dueDate: string;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;

  // Quality Check
  qualityCheckRequired: boolean;
  qualityCheckPassed?: boolean;
  qualityCheckNotes?: string;
}

export interface PaymentTransaction {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  type: 'ESCROW_DEPOSIT' | 'MILESTONE_PAYMENT' | 'FINAL_PAYMENT' | 'REFUND' | 'PENALTY';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  // Payment Method
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PAYPAL' | 'STRIPE' | 'WIRE';

  // Escrow
  heldInEscrow: boolean;
  escrowReleaseDate?: string;

  // Details
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;

  initiatedBy: string;
  processedAt?: string;
  completedAt?: string;

  createdAt: string;
}

export interface VendorPerformanceReport {
  vendorId: string;
  vendorName: string;
  period: {
    from: string;
    to: string;
  };

  // Overall Metrics
  overallScore: number; // 0-100
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;

  // Delivery Metrics
  onTimeDelivery: number; // percentage
  avgDeliveryTime: number; // days
  slaComplianceRate: number; // percentage

  // Quality Metrics
  candidateQuality: {
    avgInterviewRate: number; // percentage
    avgHireRate: number; // percentage
    avgRetentionRate: number; // percentage (90 days)
  };

  // Financial Metrics
  totalRevenue: number;
  avgDealSize: number;
  paymentDisputes: number;

  // Client Satisfaction
  avgClientRating: number; // 1-5
  repeatClientRate: number; // percentage

  // Efficiency
  avgResponseTime: number; // hours
  candidatesPerContract: number;
  placementsPerContract: number;

  // Trends
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
  strengths: string[];
  areasForImprovement: string[];
}

class B2BContractService {
  private static instance: B2BContractService;
  private apiBase = '/api/b2b/contracts';

  private constructor() {}

  public static getInstance(): B2BContractService {
    if (!B2BContractService.instance) {
      B2BContractService.instance = new B2BContractService();
    }
    return B2BContractService.instance;
  }

  // Create contract from accepted proposal
  async createContract(proposalId: string, contractData: Partial<B2BContract>): Promise<B2BContract> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ proposalId, ...contractData }),
      });

      if (!response.ok) throw new Error('Failed to create contract');
      return await response.json();
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  // Get contract
  async getContract(id: string): Promise<B2BContract | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch contract');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  // Get all contracts
  async getContracts(filters?: { status?: ContractStatus[], companyId?: string }): Promise<B2BContract[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status.join(','));
      if (filters?.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(`${this.apiBase}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch contracts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }
  }

  // Sign contract
  async signContract(id: string, signature: string): Promise<B2BContract> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) throw new Error('Failed to sign contract');
      return await response.json();
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }

  // Update milestone status
  async updateMilestone(contractId: string, milestoneId: string, status: MilestoneStatus, data?: any): Promise<ContractMilestone> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, ...data }),
      });

      if (!response.ok) throw new Error('Failed to update milestone');
      return await response.json();
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  // Submit milestone for approval
  async submitMilestone(contractId: string, milestoneId: string, deliverables: any[]): Promise<ContractMilestone> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/milestones/${milestoneId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ deliverables }),
      });

      if (!response.ok) throw new Error('Failed to submit milestone');
      return await response.json();
    } catch (error) {
      console.error('Error submitting milestone:', error);
      throw error;
    }
  }

  // Approve milestone
  async approveMilestone(contractId: string, milestoneId: string): Promise<ContractMilestone> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to approve milestone');
      return await response.json();
    } catch (error) {
      console.error('Error approving milestone:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(contractId: string, milestoneId: string, paymentMethod: string): Promise<PaymentTransaction> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ milestoneId, paymentMethod }),
      });

      if (!response.ok) throw new Error('Failed to process payment');
      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Get payment transactions
  async getPayments(contractId: string): Promise<PaymentTransaction[]> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch payments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  // Report SLA breach
  async reportSLABreach(contractId: string, breachType: string, description: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${contractId}/sla-breach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ breachType, description }),
      });

      if (!response.ok) throw new Error('Failed to report SLA breach');
    } catch (error) {
      console.error('Error reporting SLA breach:', error);
      throw error;
    }
  }

  // Terminate contract
  async terminateContract(id: string, reason: string): Promise<B2BContract> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to terminate contract');
      return await response.json();
    } catch (error) {
      console.error('Error terminating contract:', error);
      throw error;
    }
  }

  // Get vendor performance report
  async getVendorPerformance(vendorId: string, period?: { from: string; to: string }): Promise<VendorPerformanceReport> {
    try {
      const params = new URLSearchParams();
      if (period) {
        params.append('from', period.from);
        params.append('to', period.to);
      }

      const response = await fetch(`${this.apiBase}/vendors/${vendorId}/performance?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch vendor performance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
      throw error;
    }
  }

  // Upload contract document
  async uploadDocument(contractId: string, file: File, type: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.apiBase}/${contractId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload document');
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Helper: Calculate contract health score
  calculateHealthScore(contract: B2BContract): { score: number; issues: string[] } {
    let score = 100;
    const issues: string[] = [];

    // Check SLA compliance
    if (contract.performance.slaBreaches > 0) {
      score -= contract.performance.slaBreaches * 10;
      issues.push(`${contract.performance.slaBreaches} SLA breaches`);
    }

    // Check quality metrics
    if (contract.performance.qualityScore < 70) {
      score -= 20;
      issues.push('Low quality score');
    }

    // Check milestone delays
    const delayedMilestones = contract.milestones.filter(m =>
      new Date(m.dueDate) < new Date() && m.status !== 'APPROVED' && m.status !== 'PAID'
    );
    if (delayedMilestones.length > 0) {
      score -= delayedMilestones.length * 15;
      issues.push(`${delayedMilestones.length} delayed milestones`);
    }

    return { score: Math.max(0, score), issues };
  }

  // Helper: Format payment terms
  formatPaymentTerms(terms: string): string {
    const labels: Record<string, string> = {
      MILESTONE: 'Milestone-based',
      MONTHLY: 'Monthly payments',
      PER_PLACEMENT: 'Per placement',
      UPFRONT: 'Upfront payment',
    };
    return labels[terms] || terms;
  }
}

export const b2bContractService = B2BContractService.getInstance();
