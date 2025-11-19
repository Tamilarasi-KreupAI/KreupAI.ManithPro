// B2B Candidate Verification & Quality Assurance Service
// Handles background checks, skills verification, and quality scoring

export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface CandidateVerification {
  id: string;
  candidateId: string;
  candidateName: string;
  vendorId: string;
  contractId: string;

  // Identity Verification
  identityCheck: {
    status: VerificationStatus;
    provider: string;
    documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
    documentNumber?: string;
    verifiedAt?: string;
    expiresAt?: string;
    passed: boolean;
    notes?: string;
  };

  // Background Check
  backgroundCheck: {
    status: VerificationStatus;
    provider: string;
    checks: {
      criminalRecord: boolean;
      employmentHistory: boolean;
      educationVerification: boolean;
      creditCheck: boolean;
      referenceChecks: boolean;
    };
    findings?: {
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      description: string;
    }[];
    passed: boolean;
    completedAt?: string;
    reportUrl?: string;
  };

  // Skills Verification
  skillsAssessment: {
    status: VerificationStatus;
    platform: 'HACKERRANK' | 'CODILITY' | 'TESTGORILLA' | 'CUSTOM';
    assessments: {
      skill: string;
      score: number; // 0-100
      level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      completedAt: string;
      certificateUrl?: string;
    }[];
    overallScore: number;
    passed: boolean;
  };

  // Education Verification
  educationVerification: {
    status: VerificationStatus;
    degrees: {
      institution: string;
      degree: string;
      field: string;
      graduationYear: number;
      verified: boolean;
      verifiedAt?: string;
    }[];
    passed: boolean;
  };

  // Employment Verification
  employmentVerification: {
    status: VerificationStatus;
    positions: {
      company: string;
      title: string;
      startDate: string;
      endDate?: string;
      verified: boolean;
      verifiedAt?: string;
      discrepancies?: string[];
    }[];
    passed: boolean;
  };

  // Reference Checks
  referenceChecks: {
    status: VerificationStatus;
    references: {
      name: string;
      relationship: string;
      company: string;
      contactedAt?: string;
      rating: number; // 1-5
      wouldRehire: boolean;
      comments: string;
      verified: boolean;
    }[];
    passed: boolean;
  };

  // Certifications
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    verified: boolean;
    verifiedAt?: string;
  }[];

  // Overall Assessment
  overallStatus: VerificationStatus;
  overallPassed: boolean;
  qualityScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  // Timeline
  initiatedAt: string;
  completedAt?: string;
  expiresAt?: string;

  // Flags
  flags: {
    type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    raisedAt: string;
  }[];
}

export interface QualityMetrics {
  vendorId: string;
  period: {
    from: string;
    to: string;
  };

  // Verification Metrics
  totalCandidates: number;
  verifiedCandidates: number;
  verificationPassRate: number; // percentage

  // Quality Scores
  avgQualityScore: number; // 0-100
  qualityDistribution: {
    excellent: number; // 90-100
    good: number; // 75-89
    average: number; // 60-74
    poor: number; // below 60
  };

  // Verification Breakdown
  verificationBreakdown: {
    identityPassRate: number;
    backgroundCheckPassRate: number;
    skillsPassRate: number;
    educationPassRate: number;
    employmentPassRate: number;
    referencePassRate: number;
  };

  // Issues & Flags
  totalFlags: number;
  flagsByType: Record<string, number>;
  criticalFlags: number;

  // Time Metrics
  avgVerificationTime: number; // hours
  completionRate: number; // percentage

  // Candidate Performance
  candidateRetentionRate: number; // percentage (90 days)
  clientSatisfactionScore: number; // 1-5
}

export interface SkillsAssessment {
  id: string;
  candidateId: string;
  skill: string;
  platform: string;

  // Test Details
  testName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number; // minutes
  questions: number;

  // Results
  score: number; // 0-100
  percentile: number; // vs other test takers
  timeSpent: number; // minutes
  completedAt: string;

  // Breakdown
  breakdown: {
    category: string;
    score: number;
    questionsAttempted: number;
    questionsCorrect: number;
  }[];

  // Certification
  certificateUrl?: string;
  certificateValidUntil?: string;

  // Proctoring (if enabled)
  proctored: boolean;
  proctoringReport?: {
    violations: string[];
    screenshots: string[];
    confidence: number; // 0-100
  };
}

class B2BVerificationService {
  private static instance: B2BVerificationService;
  private apiBase = '/api/b2b/verification';

  private constructor() {}

  public static getInstance(): B2BVerificationService {
    if (!B2BVerificationService.instance) {
      B2BVerificationService.instance = new B2BVerificationService();
    }
    return B2BVerificationService.instance;
  }

  // Initiate candidate verification
  async initiateVerification(candidateId: string, contractId: string, checks: string[]): Promise<CandidateVerification> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidateId, contractId, checks }),
      });

      if (!response.ok) throw new Error('Failed to initiate verification');
      return await response.json();
    } catch (error) {
      console.error('Error initiating verification:', error);
      throw error;
    }
  }

  // Get verification status
  async getVerification(id: string): Promise<CandidateVerification | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch verification');
      return await response.json();
    } catch (error) {
      console.error('Error fetching verification:', error);
      return null;
    }
  }

  // Get all verifications for contract
  async getVerifications(contractId: string): Promise<CandidateVerification[]> {
    try {
      const response = await fetch(`${this.apiBase}?contractId=${contractId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch verifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching verifications:', error);
      return [];
    }
  }

  // Request skills assessment
  async requestSkillsAssessment(candidateId: string, skills: string[], platform: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/skills-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidateId, skills, platform }),
      });

      if (!response.ok) throw new Error('Failed to request skills assessment');
    } catch (error) {
      console.error('Error requesting skills assessment:', error);
      throw error;
    }
  }

  // Get skills assessment results
  async getSkillsAssessment(candidateId: string, skill: string): Promise<SkillsAssessment | null> {
    try {
      const response = await fetch(`${this.apiBase}/skills-assessment?candidateId=${candidateId}&skill=${skill}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch skills assessment');
      return await response.json();
    } catch (error) {
      console.error('Error fetching skills assessment:', error);
      return null;
    }
  }

  // Upload verification document
  async uploadDocument(verificationId: string, documentType: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await fetch(`${this.apiBase}/${verificationId}/documents`, {
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

  // Add reference check
  async addReferenceCheck(verificationId: string, reference: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${verificationId}/references`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reference),
      });

      if (!response.ok) throw new Error('Failed to add reference check');
    } catch (error) {
      console.error('Error adding reference check:', error);
      throw error;
    }
  }

  // Flag verification issue
  async flagIssue(verificationId: string, type: string, severity: string, description: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${verificationId}/flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type, severity, description }),
      });

      if (!response.ok) throw new Error('Failed to flag issue');
    } catch (error) {
      console.error('Error flagging issue:', error);
      throw error;
    }
  }

  // Get quality metrics for vendor
  async getQualityMetrics(vendorId: string, period?: { from: string; to: string }): Promise<QualityMetrics> {
    try {
      const params = new URLSearchParams();
      if (period) {
        params.append('from', period.from);
        params.append('to', period.to);
      }

      const response = await fetch(`${this.apiBase}/vendors/${vendorId}/metrics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch quality metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      throw error;
    }
  }

  // Approve verification
  async approveVerification(id: string): Promise<CandidateVerification> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to approve verification');
      return await response.json();
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  // Reject verification
  async rejectVerification(id: string, reason: string): Promise<CandidateVerification> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject verification');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  // Helper: Calculate quality score
  calculateQualityScore(verification: CandidateVerification): number {
    let score = 0;
    let weights = 0;

    // Identity check (15%)
    if (verification.identityCheck.status === 'COMPLETED') {
      score += verification.identityCheck.passed ? 15 : 0;
      weights += 15;
    }

    // Background check (25%)
    if (verification.backgroundCheck.status === 'COMPLETED') {
      score += verification.backgroundCheck.passed ? 25 : 0;
      weights += 25;
    }

    // Skills assessment (30%)
    if (verification.skillsAssessment.status === 'COMPLETED') {
      score += (verification.skillsAssessment.overallScore / 100) * 30;
      weights += 30;
    }

    // Education (10%)
    if (verification.educationVerification.status === 'COMPLETED') {
      score += verification.educationVerification.passed ? 10 : 0;
      weights += 10;
    }

    // Employment (10%)
    if (verification.employmentVerification.status === 'COMPLETED') {
      score += verification.employmentVerification.passed ? 10 : 0;
      weights += 10;
    }

    // References (10%)
    if (verification.referenceChecks.status === 'COMPLETED') {
      score += verification.referenceChecks.passed ? 10 : 0;
      weights += 10;
    }

    return weights > 0 ? (score / weights) * 100 : 0;
  }

  // Helper: Get risk level
  getRiskLevel(verification: CandidateVerification): 'LOW' | 'MEDIUM' | 'HIGH' {
    const criticalFlags = verification.flags.filter(f => f.severity === 'CRITICAL').length;
    const warningFlags = verification.flags.filter(f => f.severity === 'WARNING').length;

    if (criticalFlags > 0) return 'HIGH';
    if (warningFlags > 2 || !verification.backgroundCheck.passed) return 'MEDIUM';
    return 'LOW';
  }
}

export const b2bVerificationService = B2BVerificationService.getInstance();
