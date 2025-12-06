import axios from 'axios';
import {
  ScreeningCriteria,
  CandidateSummary,
  RejectionEmail,
  OfferLetter,
  JobAdTest,
  ABTestResults,
  CompetitorJobAnalysis,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockScreeningCriteria: ScreeningCriteria[] = [
  {
    id: 'sc-001',
    companyId: 'company-001',
    createdById: 'user-001',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    seniorityLevel: 'SENIOR',
    knockoutQuestions: [
      {
        id: 'kq-001',
        question: 'Do you have at least 5 years of professional software development experience?',
        expectedAnswer: true,
        weight: 'REQUIRED',
      },
      {
        id: 'kq-002',
        question: 'Are you authorized to work in the United States without sponsorship?',
        expectedAnswer: true,
        weight: 'REQUIRED',
      },
    ],
    scoringQuestions: [
      {
        id: 'sq-001',
        question: 'Rate your experience with distributed systems (1-5)',
        maxScore: 5,
        category: 'TECHNICAL',
        rubric: { 1: 'Beginner', 3: 'Intermediate', 5: 'Expert' },
      },
      {
        id: 'sq-002',
        question: 'Describe a complex technical problem you solved',
        maxScore: 10,
        category: 'PROBLEM_SOLVING',
        rubric: { 1: 'Basic', 5: 'Good', 10: 'Exceptional' },
      },
    ],
    mustHaveCriteria: [
      'Strong proficiency in TypeScript or JavaScript',
      'Experience with cloud platforms (AWS, GCP, or Azure)',
      'Experience with CI/CD pipelines',
    ],
    preferredCriteria: [
      'Experience with Kubernetes',
      'Open source contributions',
      'Public speaking or technical writing',
    ],
    totalPossibleScore: 100,
    passingThreshold: 60,
    autoAdvanceThreshold: 85,
    legalCompliance: true,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockCandidateSummaries: CandidateSummary[] = [
  {
    id: 'cs-001',
    companyId: 'company-001',
    candidateId: 'candidate-001',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    candidateName: 'John Smith',
    executiveSummary: 'John is a highly experienced software engineer with 8 years of full-stack development experience. He has a strong track record of leading technical projects and mentoring junior developers. His expertise in distributed systems and cloud architecture aligns well with our technical requirements.',
    strengthsHighlight: [
      { area: 'Technical Skills', description: 'Expert-level TypeScript and React skills with extensive cloud experience' },
      { area: 'Leadership', description: 'Led teams of 5-8 engineers on critical projects' },
      { area: 'Problem Solving', description: 'Demonstrated creative solutions to complex scaling challenges' },
    ],
    concernsHighlight: [
      { area: 'Remote Experience', description: 'Limited experience with fully remote teams', severity: 'LOW' },
    ],
    roleAlignment: {
      overallFit: 92,
      technicalFit: 95,
      cultureFit: 88,
      experienceFit: 90,
      keyAlignments: ['Strong TypeScript background', 'Cloud architecture expertise'],
      keyGaps: ['No Kubernetes production experience'],
    },
    experienceRelevance: 95,
    skillMatch: 90,
    recommendation: 'STRONG_HIRE',
    confidenceScore: 88,
    generatedAt: new Date('2024-01-16'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
];

const mockRejectionEmails: RejectionEmail[] = [
  {
    id: 're-001',
    companyId: 'company-001',
    createdById: 'user-001',
    candidateId: 'candidate-002',
    jobId: 'job-001',
    candidateName: 'Jane Doe',
    candidateEmail: 'jane.doe@email.com',
    jobTitle: 'Senior Software Engineer',
    rejectionStage: 'INTERVIEW',
    rejectionReason: 'While technically strong, the candidate expressed preferences for project types that don\'t align with our current roadmap.',
    positiveFeedback: [
      'Strong communication skills',
      'Excellent problem-solving approach',
      'Good cultural fit with the team',
    ],
    constructiveFeedback: [
      'Consider gaining more experience with distributed systems',
      'Practice system design interviews',
    ],
    futureOpportunities: true,
    alternativeRoles: ['Full Stack Developer', 'Frontend Engineer'],
    subject: 'Update on Your Application for Senior Software Engineer',
    fullEmail: `Dear Jane,

Thank you for taking the time to interview with us for the Senior Software Engineer position. We truly enjoyed learning about your experience and discussing your career goals.

After careful consideration, we have decided to move forward with other candidates whose backgrounds more closely align with our current needs. This was a difficult decision as we were impressed by your strong communication skills and thoughtful problem-solving approach.

We encourage you to continue developing your expertise in distributed systems, which would strengthen future applications. We would be happy to consider you for other roles that may be a better fit, such as Full Stack Developer or Frontend Engineer positions.

Thank you again for your interest in our company. We wish you the best in your career journey.

Best regards,
The Hiring Team`,
    toneLevel: 'WARM',
    includeReasoning: true,
    status: 'DRAFT',
    sentAt: null,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
];

const mockOfferLetters: OfferLetter[] = [
  {
    id: 'ol-001',
    companyId: 'company-001',
    createdById: 'user-001',
    candidateId: 'candidate-001',
    jobId: 'job-001',
    candidateName: 'John Smith',
    candidateEmail: 'john.smith@email.com',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    reportingTo: 'Sarah Johnson, Engineering Manager',
    startDate: new Date('2024-02-15'),
    employmentType: 'FULL_TIME',
    workLocation: 'HYBRID',
    baseSalary: 180000,
    salaryFrequency: 'ANNUAL',
    currency: 'USD',
    signingBonus: 20000,
    annualBonus: {
      targetPercentage: 15,
      description: 'Based on individual and company performance',
    },
    equityGrant: {
      type: 'RSU',
      amount: 50000,
      vestingSchedule: '4 years with 1 year cliff',
      totalShares: 2500,
    },
    benefits: [
      { name: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
      { name: '401(k)', description: '4% company match' },
      { name: 'PTO', description: 'Unlimited paid time off' },
      { name: 'Remote Work', description: 'Flexible hybrid work arrangement' },
    ],
    additionalPerks: [
      'Home office stipend ($1,500)',
      'Learning & development budget ($2,000/year)',
      'Wellness program',
    ],
    contingencies: [
      'Background check clearance',
      'Reference verification',
      'Proof of work authorization',
    ],
    expirationDate: new Date('2024-01-31'),
    fullLetter: `Dear John,

We are thrilled to extend an offer of employment for the position of Senior Software Engineer at TechCorp Inc.

POSITION DETAILS:
- Title: Senior Software Engineer
- Department: Engineering
- Reports to: Sarah Johnson, Engineering Manager
- Start Date: February 15, 2024
- Employment Type: Full-time
- Work Location: Hybrid (3 days in office, 2 days remote)

COMPENSATION:
- Base Salary: $180,000 annually
- Signing Bonus: $20,000 (payable within 30 days of start date)
- Annual Bonus: Target of 15% based on individual and company performance

EQUITY:
- RSU Grant: $50,000 value (approximately 2,500 shares)
- Vesting Schedule: 4 years with 1-year cliff

BENEFITS:
- Comprehensive health, dental, and vision insurance
- 401(k) with 4% company match
- Unlimited PTO
- $1,500 home office stipend
- $2,000 annual learning & development budget

This offer is contingent upon:
- Successful completion of background check
- Reference verification
- Proof of work authorization

This offer expires on January 31, 2024.

We are excited about the possibility of you joining our team and look forward to your response.

Best regards,
The TechCorp Team`,
    status: 'PENDING',
    sentAt: null,
    responseDeadline: new Date('2024-01-31'),
    acceptedAt: null,
    declinedAt: null,
    negotiationNotes: null,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
];

const mockABTests: JobAdTest[] = [
  {
    id: 'abt-001',
    companyId: 'company-001',
    createdById: 'user-001',
    jobId: 'job-001',
    testName: 'Job Title Impact Test',
    testType: 'TITLE',
    hypothesis: 'A more specific job title will attract better-qualified candidates',
    variants: [
      {
        id: 'var-001',
        testId: 'abt-001',
        variantName: 'Control - Generic Title',
        variantType: 'CONTROL',
        content: { title: 'Software Engineer' },
        impressions: 1250,
        clicks: 87,
        applications: 34,
        qualifiedApplications: 12,
        isControl: true,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: 'var-002',
        testId: 'abt-001',
        variantName: 'Variant A - Specific Title',
        variantType: 'VARIANT',
        content: { title: 'Senior Backend Engineer - Distributed Systems' },
        impressions: 1180,
        clicks: 156,
        applications: 48,
        qualifiedApplications: 28,
        isControl: false,
        createdAt: new Date('2024-01-10'),
      },
    ],
    targetMetric: 'QUALIFIED_APPLICATIONS',
    minimumSampleSize: 2000,
    confidenceLevel: 95,
    currentSampleSize: 2430,
    startedAt: new Date('2024-01-10'),
    endedAt: new Date('2024-01-20'),
    winningVariantId: 'var-002',
    statisticalSignificance: 98.5,
    status: 'COMPLETED',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'abt-002',
    companyId: 'company-001',
    createdById: 'user-001',
    jobId: 'job-002',
    testName: 'Salary Transparency Test',
    testType: 'SALARY_DISPLAY',
    hypothesis: 'Showing salary range upfront will increase application rate',
    variants: [
      {
        id: 'var-003',
        testId: 'abt-002',
        variantName: 'Control - No Salary',
        variantType: 'CONTROL',
        content: { showSalary: false },
        impressions: 890,
        clicks: 45,
        applications: 18,
        qualifiedApplications: 8,
        isControl: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'var-004',
        testId: 'abt-002',
        variantName: 'Variant A - Range Shown',
        variantType: 'VARIANT',
        content: { showSalary: true, range: '$150K - $200K' },
        impressions: 920,
        clicks: 98,
        applications: 42,
        qualifiedApplications: 22,
        isControl: false,
        createdAt: new Date('2024-01-15'),
      },
    ],
    targetMetric: 'APPLICATIONS',
    minimumSampleSize: 2000,
    confidenceLevel: 95,
    currentSampleSize: 1810,
    startedAt: new Date('2024-01-15'),
    endedAt: null,
    winningVariantId: null,
    statisticalSignificance: null,
    status: 'RUNNING',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-21'),
  },
];

const mockCompetitorAnalyses: CompetitorJobAnalysis[] = [
  {
    id: 'ca-001',
    companyId: 'company-001',
    createdById: 'user-001',
    jobId: 'job-001',
    ourJobTitle: 'Senior Software Engineer',
    ourJobData: {
      title: 'Senior Software Engineer',
      salaryRange: { min: 170000, max: 200000 },
      benefits: ['Health', '401k', 'Unlimited PTO', 'Remote'],
      requirements: ['5+ years experience', 'TypeScript', 'Cloud platforms'],
    },
    competitorJobs: [
      {
        company: 'TechGiant Inc.',
        title: 'Staff Software Engineer',
        salaryRange: { min: 185000, max: 230000 },
        benefits: ['Health', '401k match', 'RSUs', 'On-site perks'],
        requirements: ['7+ years experience', 'System design', 'Leadership'],
        source: 'LinkedIn',
        postedDate: new Date('2024-01-12'),
      },
      {
        company: 'StartupX',
        title: 'Senior Engineer',
        salaryRange: { min: 150000, max: 180000 },
        benefits: ['Health', 'Equity', 'Flexible hours'],
        requirements: ['4+ years experience', 'Full-stack', 'Startup mindset'],
        source: 'Company website',
        postedDate: new Date('2024-01-14'),
      },
      {
        company: 'FinTech Corp',
        title: 'Senior Software Developer',
        salaryRange: { min: 175000, max: 210000 },
        benefits: ['Health', '401k', 'Bonus', 'Hybrid'],
        requirements: ['5+ years experience', 'Financial systems', 'Security'],
        source: 'Indeed',
        postedDate: new Date('2024-01-10'),
      },
    ],
    salaryComparison: {
      ourPosition: 'COMPETITIVE',
      marketMedian: 185000,
      ourMidpoint: 185000,
      percentile: 55,
      recommendation: 'Our salary range is competitive but consider increasing the upper bound to attract top talent from larger tech companies.',
    },
    benefitsComparison: {
      ourStrengths: ['Unlimited PTO is attractive', 'Remote work flexibility'],
      ourWeaknesses: ['No signing bonus mentioned', 'Equity details unclear'],
      industryStandard: ['Health insurance', '401k', 'PTO'],
      uniqueOfferings: ['Unlimited PTO', 'Full remote option'],
    },
    requirementsComparison: {
      ourDifficulty: 'MODERATE',
      marketAverage: 'MODERATE',
      potentialBarriers: ['5+ years may exclude strong mid-level candidates'],
      suggestions: ['Consider 4+ years to widen candidate pool'],
    },
    competitiveStrengths: [
      'Strong remote work policy',
      'Unlimited PTO differentiator',
      'Competitive base salary',
      'Clear technical requirements',
    ],
    competitiveWeaknesses: [
      'Salary cap below top-tier competitors',
      'No explicit equity package in posting',
      'Generic job title compared to specialized titles',
    ],
    recommendations: [
      'Add specific equity/RSU information to the posting',
      'Consider a more specific title like "Senior Backend Engineer"',
      'Highlight unique perks like learning budget',
      'Add salary range transparency',
    ],
    overallCompetitivenessScore: 78,
    marketPosition: 'COMPETITIVE',
    analyzedAt: new Date('2024-01-19'),
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
];

// ============================================
// API FUNCTIONS
// ============================================

// 2.2.7 - Screening Criteria
export const screeningCriteriaAPI = {
  generate: async (data: {
    jobId?: string;
    jobTitle: string;
    seniorityLevel: string;
    department?: string;
    keyResponsibilities?: string[];
    requiredSkills?: string[];
  }): Promise<ScreeningCriteria> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        ...mockScreeningCriteria[0],
        id: `sc-${Date.now()}`,
        jobId: data.jobId || null,
        jobTitle: data.jobTitle,
        seniorityLevel: data.seniorityLevel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/screening/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ criteria: ScreeningCriteria[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { criteria: mockScreeningCriteria, total: mockScreeningCriteria.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/screening`, { params });
    return response.data;
  },

  update: async (id: string, data: Partial<ScreeningCriteria>): Promise<ScreeningCriteria> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const criteria = mockScreeningCriteria.find(c => c.id === id);
      return { ...criteria!, ...data, updatedAt: new Date() };
    }
    const response = await axios.put(`${API_BASE_URL}/ai-content-extended/screening/${id}`, data);
    return response.data;
  },

  activate: async (id: string): Promise<ScreeningCriteria> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const criteria = mockScreeningCriteria.find(c => c.id === id);
      return { ...criteria!, status: 'ACTIVE', updatedAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/screening/${id}/activate`);
    return response.data;
  },
};

// 2.2.8 - Candidate Summary
export const candidateSummaryAPI = {
  generate: async (data: {
    candidateId: string;
    jobId: string;
    includeAIAnalysis?: boolean;
  }): Promise<CandidateSummary> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockCandidateSummaries[0],
        id: `cs-${Date.now()}`,
        candidateId: data.candidateId,
        jobId: data.jobId,
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/summary/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    candidateId?: string;
    recommendation?: string;
    page?: number;
    limit?: number;
  }): Promise<{ summaries: CandidateSummary[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { summaries: mockCandidateSummaries, total: mockCandidateSummaries.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/summaries`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<CandidateSummary> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCandidateSummaries[0];
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/summary/${id}`);
    return response.data;
  },

  regenerate: async (id: string): Promise<CandidateSummary> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { ...mockCandidateSummaries[0], id, generatedAt: new Date(), updatedAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/summary/${id}/regenerate`);
    return response.data;
  },
};

// 2.2.9 - Rejection Email
export const rejectionEmailAPI = {
  generate: async (data: {
    candidateId: string;
    jobId: string;
    rejectionStage: 'SCREENING' | 'INTERVIEW' | 'FINAL' | 'OFFER';
    rejectionReason?: string;
    toneLevel?: 'FORMAL' | 'PROFESSIONAL' | 'WARM';
    includeReasoning?: boolean;
    suggestAlternatives?: boolean;
  }): Promise<RejectionEmail> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        ...mockRejectionEmails[0],
        id: `re-${Date.now()}`,
        candidateId: data.candidateId,
        jobId: data.jobId,
        rejectionStage: data.rejectionStage,
        rejectionReason: data.rejectionReason || mockRejectionEmails[0].rejectionReason,
        toneLevel: data.toneLevel || 'PROFESSIONAL',
        includeReasoning: data.includeReasoning ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/rejection/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ emails: RejectionEmail[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { emails: mockRejectionEmails, total: mockRejectionEmails.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/rejections`, { params });
    return response.data;
  },

  update: async (id: string, data: Partial<RejectionEmail>): Promise<RejectionEmail> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const email = mockRejectionEmails.find(e => e.id === id);
      return { ...email!, ...data, updatedAt: new Date() };
    }
    const response = await axios.put(`${API_BASE_URL}/ai-content-extended/rejection/${id}`, data);
    return response.data;
  },

  send: async (id: string): Promise<{ success: boolean; sentAt: Date }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, sentAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/rejection/${id}/send`);
    return response.data;
  },
};

// 2.2.10 - Offer Letter
export const offerLetterAPI = {
  generate: async (data: {
    candidateId: string;
    jobId: string;
    baseSalary: number;
    currency?: string;
    startDate: Date;
    signingBonus?: number;
    equityGrant?: {
      type: string;
      amount: number;
      vestingSchedule: string;
    };
    benefits?: string[];
    expirationDays?: number;
  }): Promise<OfferLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockOfferLetters[0],
        id: `ol-${Date.now()}`,
        candidateId: data.candidateId,
        jobId: data.jobId,
        baseSalary: data.baseSalary,
        currency: data.currency || 'USD',
        startDate: data.startDate,
        signingBonus: data.signingBonus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/offer/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ offers: OfferLetter[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { offers: mockOfferLetters, total: mockOfferLetters.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/offers`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<OfferLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockOfferLetters[0];
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/offer/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<OfferLetter>): Promise<OfferLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const offer = mockOfferLetters.find(o => o.id === id);
      return { ...offer!, ...data, updatedAt: new Date() };
    }
    const response = await axios.put(`${API_BASE_URL}/ai-content-extended/offer/${id}`, data);
    return response.data;
  },

  send: async (id: string): Promise<{ success: boolean; sentAt: Date }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, sentAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/offer/${id}/send`);
    return response.data;
  },

  recordResponse: async (id: string, response: 'ACCEPTED' | 'DECLINED' | 'NEGOTIATING', notes?: string): Promise<OfferLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const offer = mockOfferLetters.find(o => o.id === id);
      return {
        ...offer!,
        status: response === 'ACCEPTED' ? 'ACCEPTED' : response === 'DECLINED' ? 'DECLINED' : 'NEGOTIATING',
        acceptedAt: response === 'ACCEPTED' ? new Date() : null,
        declinedAt: response === 'DECLINED' ? new Date() : null,
        negotiationNotes: notes || null,
        updatedAt: new Date(),
      };
    }
    const res = await axios.post(`${API_BASE_URL}/ai-content-extended/offer/${id}/response`, { response, notes });
    return res.data;
  },
};

// 2.2.11 - A/B Testing
export const abTestingAPI = {
  create: async (data: {
    jobId: string;
    testName: string;
    testType: 'TITLE' | 'DESCRIPTION' | 'REQUIREMENTS' | 'SALARY_DISPLAY' | 'BENEFITS' | 'CTA';
    hypothesis: string;
    variants: Array<{
      variantName: string;
      variantType: 'CONTROL' | 'VARIANT';
      content: Record<string, unknown>;
      isControl: boolean;
    }>;
    targetMetric: 'IMPRESSIONS' | 'CLICKS' | 'APPLICATIONS' | 'QUALIFIED_APPLICATIONS';
    minimumSampleSize?: number;
    confidenceLevel?: number;
  }): Promise<JobAdTest> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: `abt-${Date.now()}`,
        companyId: 'company-001',
        createdById: 'user-001',
        jobId: data.jobId,
        testName: data.testName,
        testType: data.testType,
        hypothesis: data.hypothesis,
        variants: data.variants.map((v, i) => ({
          ...v,
          id: `var-${Date.now()}-${i}`,
          testId: `abt-${Date.now()}`,
          impressions: 0,
          clicks: 0,
          applications: 0,
          qualifiedApplications: 0,
          createdAt: new Date(),
        })),
        targetMetric: data.targetMetric,
        minimumSampleSize: data.minimumSampleSize || 1000,
        confidenceLevel: data.confidenceLevel || 95,
        currentSampleSize: 0,
        startedAt: null,
        endedAt: null,
        winningVariantId: null,
        statisticalSignificance: null,
        status: 'SETUP',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/ab-test`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tests: JobAdTest[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { tests: mockABTests, total: mockABTests.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/ab-tests`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<JobAdTest> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockABTests.find(t => t.id === id) || mockABTests[0];
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/ab-test/${id}`);
    return response.data;
  },

  start: async (id: string): Promise<JobAdTest> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const test = mockABTests.find(t => t.id === id);
      return { ...test!, status: 'RUNNING', startedAt: new Date(), updatedAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/ab-test/${id}/start`);
    return response.data;
  },

  stop: async (id: string): Promise<JobAdTest> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const test = mockABTests.find(t => t.id === id);
      return { ...test!, status: 'PAUSED', updatedAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/ab-test/${id}/stop`);
    return response.data;
  },

  getResults: async (id: string): Promise<ABTestResults> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const test = mockABTests.find(t => t.id === id) || mockABTests[0];
      return {
        testId: id,
        testName: test.testName,
        status: test.status,
        duration: test.startedAt ? Math.floor((new Date().getTime() - test.startedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        totalSampleSize: test.currentSampleSize,
        variantResults: test.variants.map(v => ({
          variantId: v.id,
          variantName: v.variantName,
          isControl: v.isControl,
          metrics: {
            impressions: v.impressions,
            clicks: v.clicks,
            applications: v.applications,
            qualifiedApplications: v.qualifiedApplications || 0,
            clickRate: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
            applicationRate: v.clicks > 0 ? (v.applications / v.clicks) * 100 : 0,
            qualificationRate: v.applications > 0 ? ((v.qualifiedApplications || 0) / v.applications) * 100 : 0,
          },
          improvement: v.isControl ? 0 : 23.5,
          confidence: v.isControl ? 100 : 98.5,
        })),
        winner: test.winningVariantId ? {
          variantId: test.winningVariantId,
          variantName: test.variants.find(v => v.id === test.winningVariantId)?.variantName || '',
          improvement: 23.5,
          confidence: 98.5,
        } : null,
        statisticalSignificance: test.statisticalSignificance || null,
        recommendation: test.status === 'COMPLETED'
          ? 'The variant with specific job title significantly outperformed the control. Recommend implementing the change.'
          : 'Test still in progress. Continue monitoring until minimum sample size is reached.',
      };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/ab-test/${id}/results`);
    return response.data;
  },

  conclude: async (id: string, winningVariantId: string): Promise<JobAdTest> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const test = mockABTests.find(t => t.id === id);
      return {
        ...test!,
        status: 'COMPLETED',
        winningVariantId,
        endedAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/ab-test/${id}/conclude`, { winningVariantId });
    return response.data;
  },
};

// 2.2.12 - Competitor Analysis
export const competitorAnalysisAPI = {
  analyze: async (data: {
    jobId: string;
    competitorCompanies?: string[];
    includeMarketData?: boolean;
    includeBenefitsComparison?: boolean;
  }): Promise<CompetitorJobAnalysis> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        ...mockCompetitorAnalyses[0],
        id: `ca-${Date.now()}`,
        jobId: data.jobId,
        analyzedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/competitor/analyze`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ analyses: CompetitorJobAnalysis[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { analyses: mockCompetitorAnalyses, total: mockCompetitorAnalyses.length };
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/competitor/analyses`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<CompetitorJobAnalysis> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCompetitorAnalyses[0];
    }
    const response = await axios.get(`${API_BASE_URL}/ai-content-extended/competitor/${id}`);
    return response.data;
  },

  refresh: async (id: string): Promise<CompetitorJobAnalysis> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        ...mockCompetitorAnalyses[0],
        id,
        analyzedAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/ai-content-extended/competitor/${id}/refresh`);
    return response.data;
  },
};

// Export all APIs
export default {
  screeningCriteria: screeningCriteriaAPI,
  candidateSummary: candidateSummaryAPI,
  rejectionEmail: rejectionEmailAPI,
  offerLetter: offerLetterAPI,
  abTesting: abTestingAPI,
  competitorAnalysis: competitorAnalysisAPI,
};
