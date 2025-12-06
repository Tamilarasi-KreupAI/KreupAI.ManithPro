// Batch 30: Recruitment Analytics Controller (9.1.1-9.1.12)
import { Request, Response } from 'express';

// ==========================================
// 9.1.1 Funnel Analytics
// ==========================================

export const getFunnelAnalytics = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, recruiterId, periodType, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'funnel-1',
        organizationId: 'org-1',
        jobId: jobId || null,
        departmentId: departmentId || null,
        recruiterId: recruiterId || null,
        periodStart: startDate || '2024-01-01',
        periodEnd: endDate || '2024-03-31',
        periodType: periodType || 'quarterly',
        sourced: 500,
        applied: 320,
        screened: 180,
        interviewed: 75,
        offered: 25,
        hired: 20,
        sourceToApply: 64.0,
        applyToScreen: 56.25,
        screenToInterview: 41.67,
        interviewToOffer: 33.33,
        offerToHire: 80.0,
        overallConversion: 4.0
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funnel analytics' });
  }
};

export const createFunnelSnapshot = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const snapshot = {
      id: `funnel-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create funnel snapshot' });
  }
};

export const getFunnelTrends = async (req: Request, res: Response) => {
  try {
    const { jobId, periods } = req.query;
    const mockTrends = {
      periods: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
      sourced: [500, 620, 580, 700],
      applied: [320, 410, 390, 480],
      screened: [180, 230, 210, 270],
      interviewed: [75, 95, 88, 112],
      offered: [25, 32, 30, 38],
      hired: [20, 26, 24, 31],
      conversionRates: [4.0, 4.2, 4.1, 4.4]
    };
    res.json(mockTrends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funnel trends' });
  }
};

// ==========================================
// 9.1.2 Time-to-Hire Tracking
// ==========================================

export const getTimeToHireMetrics = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, recruiterId, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'tth-1',
        organizationId: 'org-1',
        jobId: 'job-1',
        recruiterId: 'rec-1',
        candidateId: 'cand-1',
        hireDate: '2024-03-15',
        jobOpenDate: '2024-01-15',
        firstApplyDate: '2024-01-20',
        firstScreenDate: '2024-01-25',
        firstInterviewDate: '2024-02-05',
        offerDate: '2024-03-01',
        offerAcceptDate: '2024-03-10',
        timeToFill: 59,
        timeToHire: 54,
        timeToScreen: 5,
        timeToInterview: 11,
        timeToOffer: 24,
        timeToAccept: 9,
        jobType: 'Full-time',
        seniorityLevel: 'Mid',
        department: 'Engineering',
        location: 'New York'
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time-to-hire metrics' });
  }
};

export const getTimeToHireAverages = async (req: Request, res: Response) => {
  try {
    const { groupBy } = req.query;
    const mockAverages = {
      overall: {
        avgTimeToFill: 45,
        avgTimeToHire: 38,
        avgTimeToScreen: 4,
        avgTimeToInterview: 12,
        avgTimeToOffer: 18,
        avgTimeToAccept: 6
      },
      byDepartment: [
        { department: 'Engineering', avgTimeToHire: 42 },
        { department: 'Sales', avgTimeToHire: 32 },
        { department: 'Marketing', avgTimeToHire: 35 },
        { department: 'Finance', avgTimeToHire: 48 }
      ],
      bySeniority: [
        { level: 'Junior', avgTimeToHire: 28 },
        { level: 'Mid', avgTimeToHire: 38 },
        { level: 'Senior', avgTimeToHire: 52 },
        { level: 'Executive', avgTimeToHire: 75 }
      ],
      trend: 'improving'
    };
    res.json(mockAverages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time-to-hire averages' });
  }
};

export const recordHireTime = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = {
      id: `tth-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record hire time' });
  }
};

// ==========================================
// 9.1.3 Cost-per-Hire Analysis
// ==========================================

export const getCostPerHireMetrics = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'cph-1',
        organizationId: 'org-1',
        jobId: 'job-1',
        candidateId: 'cand-1',
        hireDate: '2024-03-15',
        recruiterTime: 1200,
        hiringManagerTime: 800,
        interviewerTime: 600,
        adminTime: 200,
        internalCostTotal: 2800,
        jobBoardFees: 500,
        agencyFees: 0,
        advertisingCost: 300,
        backgroundCheckCost: 150,
        assessmentCost: 200,
        relocationCost: 0,
        signingBonus: 5000,
        travelCost: 250,
        externalCostTotal: 6400,
        totalCost: 9200,
        costPerHire: 9200,
        currency: 'USD',
        source: 'LinkedIn',
        department: 'Engineering'
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cost-per-hire metrics' });
  }
};

export const getCostBreakdown = async (req: Request, res: Response) => {
  try {
    const mockBreakdown = {
      averageCostPerHire: 8500,
      medianCostPerHire: 7200,
      totalHiringCost: 425000,
      totalHires: 50,
      byCategory: {
        internalCosts: 140000,
        externalCosts: 285000
      },
      bySource: [
        { source: 'LinkedIn', avgCost: 9500, hires: 15 },
        { source: 'Indeed', avgCost: 6800, hires: 12 },
        { source: 'Referral', avgCost: 4200, hires: 18 },
        { source: 'Agency', avgCost: 15000, hires: 5 }
      ],
      byDepartment: [
        { department: 'Engineering', avgCost: 12000 },
        { department: 'Sales', avgCost: 8500 },
        { department: 'Marketing', avgCost: 7200 }
      ],
      trend: {
        currentPeriod: 8500,
        previousPeriod: 9200,
        change: -7.6
      }
    };
    res.json(mockBreakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cost breakdown' });
  }
};

export const recordHireCost = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = {
      id: `cph-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record hire cost' });
  }
};

// ==========================================
// 9.1.4 Source Effectiveness
// ==========================================

export const getSourceEffectiveness = async (req: Request, res: Response) => {
  try {
    const { periodType, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'src-1',
        organizationId: 'org-1',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        sourceName: 'LinkedIn',
        sourceCategory: 'Social',
        candidatesSourced: 250,
        applicants: 180,
        screened: 90,
        interviewed: 40,
        offers: 15,
        hires: 12,
        avgTimeToHire: 42,
        avgCostPerHire: 9500,
        avgQualityScore: 4.2,
        retentionRate: 92,
        totalSpend: 15000,
        costPerApplicant: 83.33,
        costPerHire: 1250,
        roi: 3.2,
        isActive: true
      },
      {
        id: 'src-2',
        organizationId: 'org-1',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        sourceName: 'Referral',
        sourceCategory: 'Referral',
        candidatesSourced: 80,
        applicants: 75,
        screened: 60,
        interviewed: 35,
        offers: 18,
        hires: 16,
        avgTimeToHire: 28,
        avgCostPerHire: 4200,
        avgQualityScore: 4.6,
        retentionRate: 96,
        totalSpend: 8000,
        costPerApplicant: 106.67,
        costPerHire: 500,
        roi: 5.8,
        isActive: true
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source effectiveness' });
  }
};

export const getSourceROI = async (req: Request, res: Response) => {
  try {
    const mockROI = {
      topSources: [
        { name: 'Referral', roi: 5.8, hires: 16 },
        { name: 'LinkedIn', roi: 3.2, hires: 12 },
        { name: 'Indeed', roi: 2.8, hires: 8 }
      ],
      recommendations: [
        { action: 'increase', source: 'Referral', reason: 'Highest ROI and quality' },
        { action: 'maintain', source: 'LinkedIn', reason: 'Good volume and quality' },
        { action: 'reduce', source: 'Agency', reason: 'High cost, low ROI' }
      ]
    };
    res.json(mockROI);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source ROI' });
  }
};

export const updateSourceSpend = async (req: Request, res: Response) => {
  try {
    const { sourceId } = req.params;
    const data = req.body;
    const updated = {
      id: sourceId,
      ...data,
      updatedAt: new Date().toISOString()
    };
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update source spend' });
  }
};

// ==========================================
// 9.1.5 Recruiter Performance
// ==========================================

export const getRecruiterPerformance = async (req: Request, res: Response) => {
  try {
    const { recruiterId, periodType, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'rp-1',
        organizationId: 'org-1',
        recruiterId: 'rec-1',
        recruiterName: 'Sarah Johnson',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        jobsHandled: 12,
        candidatesSourced: 180,
        screensCompleted: 95,
        interviewsScheduled: 48,
        offersExtended: 18,
        hiresCompleted: 15,
        avgTimeToFill: 38,
        avgTimeToHire: 32,
        avgCostPerHire: 7800,
        fillRate: 83.3,
        offerAcceptRate: 83.3,
        candidateSatisfaction: 4.5,
        hiringManagerSatisfaction: 4.3,
        qualityOfHireScore: 4.2,
        activePipeline: 45,
        pipelineVelocity: 8.5,
        rank: 1,
        tier: 'Top'
      },
      {
        id: 'rp-2',
        organizationId: 'org-1',
        recruiterId: 'rec-2',
        recruiterName: 'Michael Chen',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        jobsHandled: 10,
        candidatesSourced: 150,
        screensCompleted: 78,
        interviewsScheduled: 35,
        offersExtended: 12,
        hiresCompleted: 10,
        avgTimeToFill: 45,
        avgTimeToHire: 38,
        avgCostPerHire: 8500,
        fillRate: 70.0,
        offerAcceptRate: 83.3,
        candidateSatisfaction: 4.2,
        hiringManagerSatisfaction: 4.0,
        qualityOfHireScore: 4.0,
        activePipeline: 38,
        pipelineVelocity: 6.8,
        rank: 2,
        tier: 'Top'
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruiter performance' });
  }
};

export const getRecruiterLeaderboard = async (req: Request, res: Response) => {
  try {
    const mockLeaderboard = {
      period: 'Q1 2024',
      rankings: [
        { rank: 1, name: 'Sarah Johnson', hires: 15, score: 92 },
        { rank: 2, name: 'Michael Chen', hires: 10, score: 85 },
        { rank: 3, name: 'Emily Davis', hires: 8, score: 82 },
        { rank: 4, name: 'James Wilson', hires: 7, score: 78 },
        { rank: 5, name: 'Lisa Thompson', hires: 6, score: 75 }
      ],
      teamAverage: {
        hires: 9.2,
        avgTimeToHire: 40,
        fillRate: 75
      }
    };
    res.json(mockLeaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruiter leaderboard' });
  }
};

export const getRecruiterGoals = async (req: Request, res: Response) => {
  try {
    const { recruiterId } = req.params;
    const mockGoals = {
      recruiterId,
      period: 'Q1 2024',
      goals: [
        { metric: 'hires', target: 12, actual: 15, progress: 125 },
        { metric: 'timeToFill', target: 45, actual: 38, progress: 116 },
        { metric: 'fillRate', target: 80, actual: 83, progress: 104 },
        { metric: 'candidateSatisfaction', target: 4.0, actual: 4.5, progress: 113 }
      ],
      overallProgress: 114.5
    };
    res.json(mockGoals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruiter goals' });
  }
};

// ==========================================
// 9.1.6 Offer Acceptance Tracking
// ==========================================

export const getOfferAcceptanceMetrics = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'offer-1',
        organizationId: 'org-1',
        jobId: 'job-1',
        recruiterId: 'rec-1',
        candidateId: 'cand-1',
        offerDate: '2024-03-01',
        responseDate: '2024-03-10',
        status: 'accepted',
        offeredSalary: 120000,
        expectedSalary: 115000,
        salarySatisfaction: 4.5,
        currency: 'USD',
        daysToDecision: 9,
        negotiationRounds: 1,
        department: 'Engineering',
        seniorityLevel: 'Senior',
        jobType: 'Full-time',
        location: 'New York'
      },
      {
        id: 'offer-2',
        organizationId: 'org-1',
        jobId: 'job-2',
        recruiterId: 'rec-1',
        candidateId: 'cand-2',
        offerDate: '2024-03-05',
        responseDate: '2024-03-12',
        status: 'declined',
        offeredSalary: 95000,
        expectedSalary: 110000,
        salarySatisfaction: 2.5,
        currency: 'USD',
        declineReason: 'Compensation',
        declineDetails: 'Received higher offer elsewhere',
        competitorName: 'TechCorp',
        competitorOffer: 115000,
        daysToDecision: 7,
        negotiationRounds: 2,
        department: 'Engineering',
        seniorityLevel: 'Mid',
        jobType: 'Full-time',
        location: 'San Francisco'
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer acceptance metrics' });
  }
};

export const getOfferAcceptanceRates = async (req: Request, res: Response) => {
  try {
    const mockRates = {
      overall: {
        totalOffers: 50,
        accepted: 40,
        declined: 8,
        pending: 2,
        acceptanceRate: 80,
        avgDaysToDecision: 8.5
      },
      byDepartment: [
        { department: 'Engineering', rate: 85, total: 20 },
        { department: 'Sales', rate: 75, total: 16 },
        { department: 'Marketing', rate: 78, total: 14 }
      ],
      declineReasons: [
        { reason: 'Compensation', count: 4, percentage: 50 },
        { reason: 'Counter-offer', count: 2, percentage: 25 },
        { reason: 'Location', count: 1, percentage: 12.5 },
        { reason: 'Role fit', count: 1, percentage: 12.5 }
      ],
      trend: {
        currentPeriod: 80,
        previousPeriod: 75,
        change: 5
      }
    };
    res.json(mockRates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer acceptance rates' });
  }
};

export const recordOffer = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = {
      id: `offer-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record offer' });
  }
};

export const updateOfferStatus = async (req: Request, res: Response) => {
  try {
    const { offerId } = req.params;
    const data = req.body;
    const updated = {
      id: offerId,
      ...data,
      responseDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer status' });
  }
};

// ==========================================
// 9.1.7 Pipeline Velocity
// ==========================================

export const getPipelineVelocity = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, periodType } = req.query;

    const mockData = [
      {
        id: 'pv-1',
        organizationId: 'org-1',
        jobId: jobId || null,
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: periodType || 'quarterly',
        inSourced: 120,
        inScreening: 85,
        inInterview: 45,
        inOffer: 12,
        hired: 40,
        rejected: 180,
        withdrawn: 25,
        sourcedToScreening: 3.2,
        screeningToInterview: 5.8,
        interviewToOffer: 12.5,
        offerToHire: 7.2,
        totalVelocity: 28.7,
        candidatesEntered: 320,
        candidatesExited: 245,
        netPipelineChange: 75,
        bottleneckStage: 'Interview'
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline velocity' });
  }
};

export const getVelocityTrends = async (req: Request, res: Response) => {
  try {
    const mockTrends = {
      periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      totalVelocity: [32, 30, 28, 27, 28, 26],
      stageVelocity: {
        sourcedToScreening: [4.0, 3.5, 3.2, 3.0, 3.1, 2.9],
        screeningToInterview: [7.0, 6.5, 5.8, 5.5, 5.7, 5.2],
        interviewToOffer: [14.0, 13.5, 12.5, 12.0, 12.2, 11.8],
        offerToHire: [8.0, 7.5, 7.2, 7.0, 7.0, 6.8]
      },
      improvement: 18.75
    };
    res.json(mockTrends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch velocity trends' });
  }
};

export const getBottleneckAnalysis = async (req: Request, res: Response) => {
  try {
    const mockAnalysis = {
      currentBottleneck: {
        stage: 'Interview',
        avgDays: 12.5,
        targetDays: 8,
        impact: 'High',
        candidatesStuck: 45
      },
      recommendations: [
        { action: 'Add more interviewers', priority: 'High', expectedImprovement: '20%' },
        { action: 'Implement interview scheduling tool', priority: 'Medium', expectedImprovement: '15%' },
        { action: 'Reduce interview rounds', priority: 'Medium', expectedImprovement: '25%' }
      ],
      historicalBottlenecks: [
        { period: 'Q4 2023', stage: 'Screening', resolved: true },
        { period: 'Q3 2023', stage: 'Offer', resolved: true }
      ]
    };
    res.json(mockAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bottleneck analysis' });
  }
};

// ==========================================
// 9.1.8 Quality of Hire
// ==========================================

export const getQualityOfHireMetrics = async (req: Request, res: Response) => {
  try {
    const { recruiterId, startDate, endDate } = req.query;

    const mockData = [
      {
        id: 'qoh-1',
        organizationId: 'org-1',
        hireId: 'hire-1',
        candidateId: 'cand-1',
        jobId: 'job-1',
        recruiterId: 'rec-1',
        hireDate: '2024-01-15',
        assessmentDate: '2024-04-15',
        performanceScore30: 4.0,
        performanceScore60: 4.2,
        performanceScore90: 4.5,
        isRetained: true,
        retainedAt30Days: true,
        retainedAt90Days: true,
        managerSatisfaction: 4.5,
        meetingExpectations: 'Exceeds',
        wouldRehire: true,
        promotionTimeline: '12-18 months',
        culturalFitScore: 4.3,
        teamIntegration: 4.5,
        timeToProductivity: 45,
        trainingCompleted: true,
        overallQualityScore: 4.4
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quality of hire metrics' });
  }
};

export const getQualityScoreSummary = async (req: Request, res: Response) => {
  try {
    const mockSummary = {
      overall: {
        avgQualityScore: 4.2,
        avgPerformance90: 4.1,
        retentionRate90Days: 94,
        retentionRate1Year: 88,
        avgTimeToProductivity: 52,
        managerSatisfactionAvg: 4.0
      },
      bySource: [
        { source: 'Referral', avgQuality: 4.6, retention: 96 },
        { source: 'LinkedIn', avgQuality: 4.1, retention: 92 },
        { source: 'Indeed', avgQuality: 3.8, retention: 88 }
      ],
      byRecruiter: [
        { name: 'Sarah Johnson', avgQuality: 4.4, hires: 15 },
        { name: 'Michael Chen', avgQuality: 4.0, hires: 10 }
      ],
      trend: {
        currentPeriod: 4.2,
        previousPeriod: 4.0,
        change: 5
      }
    };
    res.json(mockSummary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quality score summary' });
  }
};

export const recordQualityAssessment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = {
      id: `qoh-${Date.now()}`,
      ...data,
      assessmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record quality assessment' });
  }
};

export const updateQualityMetrics = async (req: Request, res: Response) => {
  try {
    const { hireId } = req.params;
    const data = req.body;
    const updated = {
      hireId,
      ...data,
      updatedAt: new Date().toISOString()
    };
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quality metrics' });
  }
};

// ==========================================
// 9.1.9 Diversity Analytics
// ==========================================

export const getDiversityAnalytics = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, periodType, startDate, endDate } = req.query;

    const mockData = {
      id: 'div-1',
      organizationId: 'org-1',
      periodStart: startDate || '2024-01-01',
      periodEnd: endDate || '2024-03-31',
      periodType: periodType || 'quarterly',
      totalApplicants: 500,
      genderDistribution: {
        male: 280,
        female: 195,
        nonBinary: 15,
        undisclosed: 10
      },
      ethnicityDistribution: {
        white: 200,
        black: 85,
        hispanic: 75,
        asian: 110,
        other: 20,
        undisclosed: 10
      },
      ageDistribution: {
        '18-25': 80,
        '26-35': 220,
        '36-45': 120,
        '46-55': 55,
        '56+': 15,
        undisclosed: 10
      },
      veteranStatus: {
        yes: 25,
        no: 460,
        undisclosed: 15
      },
      disabilityStatus: {
        yes: 20,
        no: 455,
        undisclosed: 25
      },
      hiresTotal: 40,
      hiresDiversity: {
        male: 22,
        female: 17,
        nonBinary: 1
      }
    };

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diversity analytics' });
  }
};

export const getDiversityGoals = async (req: Request, res: Response) => {
  try {
    const mockGoals = {
      goals: [
        { metric: 'femaleHires', target: 45, actual: 42.5, status: 'on_track' },
        { metric: 'underrepresentedMinorities', target: 30, actual: 28, status: 'on_track' },
        { metric: 'veterans', target: 5, actual: 4, status: 'at_risk' }
      ],
      initiatives: [
        { name: 'Women in Tech Partnership', status: 'active', impact: 'High' },
        { name: 'HBCU Recruiting Program', status: 'active', impact: 'Medium' },
        { name: 'Veterans Transition Program', status: 'planning', impact: 'Medium' }
      ]
    };
    res.json(mockGoals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diversity goals' });
  }
};

export const getDiversityConversionRates = async (req: Request, res: Response) => {
  try {
    const mockConversion = {
      byGender: [
        { group: 'Male', applyRate: 56, screenRate: 58, interviewRate: 55, offerRate: 52, hireRate: 55 },
        { group: 'Female', applyRate: 39, screenRate: 38, interviewRate: 40, offerRate: 43, hireRate: 42.5 },
        { group: 'Non-Binary', applyRate: 3, screenRate: 3, interviewRate: 4, offerRate: 4, hireRate: 2.5 }
      ],
      byEthnicity: [
        { group: 'White', applyRate: 40, hireRate: 42 },
        { group: 'Asian', applyRate: 22, hireRate: 25 },
        { group: 'Black', applyRate: 17, hireRate: 15 },
        { group: 'Hispanic', applyRate: 15, hireRate: 13 }
      ],
      disparityFlags: [
        { stage: 'Screen to Interview', group: 'Black', disparity: '-12%', severity: 'medium' }
      ]
    };
    res.json(mockConversion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diversity conversion rates' });
  }
};

// ==========================================
// 9.1.10 Interview-to-Offer Ratio
// ==========================================

export const getInterviewOfferRatios = async (req: Request, res: Response) => {
  try {
    const { jobId, recruiterId, periodType } = req.query;

    const mockData = [
      {
        id: 'ior-1',
        organizationId: 'org-1',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        phoneScreens: 250,
        technicalInterviews: 120,
        onsiteInterviews: 60,
        finalInterviews: 45,
        totalInterviews: 475,
        uniqueCandidatesInterviewed: 180,
        passedScreening: 120,
        passedTechnical: 65,
        passedOnsite: 48,
        offersExtended: 40,
        offersAccepted: 32,
        hires: 32,
        interviewsPerHire: 14.8,
        screenPassRate: 66.7,
        technicalPassRate: 54.2,
        onsitePassRate: 73.8,
        offerRate: 22.2,
        acceptanceRate: 80
      }
    ];

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview-offer ratios' });
  }
};

export const getInterviewEfficiency = async (req: Request, res: Response) => {
  try {
    const mockEfficiency = {
      currentInterviewsPerHire: 14.8,
      targetInterviewsPerHire: 12,
      industryBenchmark: 15,
      byRole: [
        { role: 'Software Engineer', interviewsPerHire: 16, target: 14 },
        { role: 'Product Manager', interviewsPerHire: 12, target: 10 },
        { role: 'Sales Rep', interviewsPerHire: 8, target: 8 }
      ],
      passRatesByStage: {
        screening: { rate: 66.7, benchmark: 60 },
        technical: { rate: 54.2, benchmark: 50 },
        onsite: { rate: 73.8, benchmark: 70 },
        final: { rate: 88.9, benchmark: 85 }
      },
      recommendations: [
        { action: 'Improve screening criteria', impact: 'Reduce unnecessary interviews by 15%' },
        { action: 'Add technical pre-screen', impact: 'Improve technical pass rate by 10%' }
      ]
    };
    res.json(mockEfficiency);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview efficiency' });
  }
};

// ==========================================
// 9.1.11 Drop-off Analysis
// ==========================================

export const getDropOffAnalysis = async (req: Request, res: Response) => {
  try {
    const { jobId, departmentId, periodType } = req.query;

    const mockData = {
      id: 'doa-1',
      organizationId: 'org-1',
      periodStart: '2024-01-01',
      periodEnd: '2024-03-31',
      periodType: 'quarterly',
      stageDropOffs: {
        sourceToApply: { count: 180, rate: 36 },
        applyToScreen: { count: 140, rate: 43.75 },
        screenToInterview: { count: 105, rate: 58.33 },
        interviewToOffer: { count: 50, rate: 66.67 },
        offerToHire: { count: 8, rate: 20 }
      },
      withdrawalReasons: [
        { reason: 'Found another job', count: 45, percentage: 35 },
        { reason: 'Process too long', count: 30, percentage: 23 },
        { reason: 'Poor communication', count: 20, percentage: 15 },
        { reason: 'Salary expectations', count: 18, percentage: 14 },
        { reason: 'Role changed', count: 15, percentage: 12 }
      ],
      rejectionReasons: [
        { reason: 'Skills mismatch', count: 120, percentage: 40 },
        { reason: 'Experience level', count: 90, percentage: 30 },
        { reason: 'Culture fit', count: 45, percentage: 15 },
        { reason: 'Failed assessment', count: 30, percentage: 10 },
        { reason: 'Other', count: 15, percentage: 5 }
      ],
      avgDaysBeforeDropOff: {
        sourceToApply: 2,
        applyToScreen: 5,
        screenToInterview: 8,
        interviewToOffer: 15,
        offerToHire: 4
      },
      reEngaged: 25,
      reEngagementRate: 8,
      worstStage: 'interviewToOffer',
      worstDropRate: 66.67
    };

    res.json(mockData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drop-off analysis' });
  }
};

export const getDropOffRecommendations = async (req: Request, res: Response) => {
  try {
    const mockRecommendations = {
      criticalIssues: [
        {
          stage: 'Interview to Offer',
          issue: 'High drop-off rate (66.67%)',
          rootCauses: ['Long interview process', 'Delayed feedback', 'Competitor offers'],
          recommendations: [
            'Reduce interview rounds from 5 to 3',
            'Implement same-day feedback policy',
            'Speed up offer approval process'
          ],
          expectedImprovement: '25% reduction in drop-off'
        }
      ],
      quickWins: [
        { action: 'Send application confirmation immediately', impact: '5% improvement' },
        { action: 'Weekly candidate status updates', impact: '10% improvement' },
        { action: 'Mobile-friendly application', impact: '8% improvement' }
      ]
    };
    res.json(mockRecommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drop-off recommendations' });
  }
};

// ==========================================
// 9.1.12 SLA Tracking
// ==========================================

export const getSLAs = async (req: Request, res: Response) => {
  try {
    const mockSLAs = [
      {
        id: 'sla-1',
        organizationId: 'org-1',
        name: 'Initial Response SLA',
        description: 'Respond to new applications within 48 hours',
        slaType: 'response_time',
        targetMetric: 'time_to_first_response',
        targetValue: 48,
        targetUnit: 'hours',
        priority: 'high',
        escalationEnabled: true,
        escalationThreshold: 80,
        isActive: true
      },
      {
        id: 'sla-2',
        organizationId: 'org-1',
        name: 'Screening SLA',
        description: 'Complete initial screening within 5 business days',
        slaType: 'stage_duration',
        targetMetric: 'time_to_screen',
        targetValue: 5,
        targetUnit: 'business_days',
        priority: 'high',
        escalationEnabled: true,
        escalationThreshold: 80,
        isActive: true
      },
      {
        id: 'sla-3',
        organizationId: 'org-1',
        name: 'Interview Feedback SLA',
        description: 'Submit interview feedback within 24 hours',
        slaType: 'feedback',
        targetMetric: 'time_to_feedback',
        targetValue: 24,
        targetUnit: 'hours',
        priority: 'medium',
        escalationEnabled: true,
        escalationThreshold: 90,
        isActive: true
      }
    ];

    res.json(mockSLAs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SLAs' });
  }
};

export const createSLA = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const sla = {
      id: `sla-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    res.status(201).json(sla);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SLA' });
  }
};

export const updateSLA = async (req: Request, res: Response) => {
  try {
    const { slaId } = req.params;
    const data = req.body;
    const updated = {
      id: slaId,
      ...data,
      updatedAt: new Date().toISOString()
    };
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update SLA' });
  }
};

export const deleteSLA = async (req: Request, res: Response) => {
  try {
    const { slaId } = req.params;
    res.json({ message: 'SLA deleted successfully', id: slaId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete SLA' });
  }
};

export const getSLATracking = async (req: Request, res: Response) => {
  try {
    const { slaId, periodType, startDate, endDate } = req.query;

    const mockTracking = [
      {
        id: 'slat-1',
        organizationId: 'org-1',
        slaId: 'sla-1',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        totalMeasured: 320,
        metSLA: 288,
        missedSLA: 32,
        complianceRate: 90,
        avgActualTime: 36,
        minTime: 2,
        maxTime: 96,
        medianTime: 32,
        p90Time: 72,
        escalationsTriggered: 15,
        previousPeriodCompliance: 85,
        trend: 'improving'
      },
      {
        id: 'slat-2',
        organizationId: 'org-1',
        slaId: 'sla-2',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        periodType: 'quarterly',
        totalMeasured: 280,
        metSLA: 238,
        missedSLA: 42,
        complianceRate: 85,
        avgActualTime: 4.2,
        minTime: 1,
        maxTime: 12,
        medianTime: 4,
        p90Time: 7,
        escalationsTriggered: 20,
        previousPeriodCompliance: 82,
        trend: 'improving'
      }
    ];

    res.json(mockTracking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SLA tracking' });
  }
};

export const getSLABreaches = async (req: Request, res: Response) => {
  try {
    const { slaId, startDate, endDate } = req.query;

    const mockBreaches = {
      totalBreaches: 74,
      bySLA: [
        { slaId: 'sla-1', name: 'Initial Response SLA', breaches: 32, rate: 10 },
        { slaId: 'sla-2', name: 'Screening SLA', breaches: 42, rate: 15 }
      ],
      recentBreaches: [
        {
          id: 'breach-1',
          slaId: 'sla-1',
          candidateId: 'cand-123',
          jobId: 'job-45',
          targetHours: 48,
          actualHours: 72,
          breach: 24,
          recruiterId: 'rec-2',
          timestamp: '2024-03-10T14:30:00Z'
        }
      ],
      byRecruiter: [
        { recruiterId: 'rec-2', name: 'Michael Chen', breaches: 18, rate: 12 },
        { recruiterId: 'rec-3', name: 'Emily Davis', breaches: 15, rate: 10 }
      ]
    };

    res.json(mockBreaches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SLA breaches' });
  }
};

// ==========================================
// Analytics Dashboard & Stats
// ==========================================

export const getRecruitmentAnalyticsDashboard = async (req: Request, res: Response) => {
  try {
    const mockDashboard = {
      summary: {
        totalHires: 50,
        openPositions: 35,
        activeCandidates: 280,
        avgTimeToHire: 38,
        avgCostPerHire: 8500,
        offerAcceptanceRate: 80,
        diversityScore: 78
      },
      funnelSnapshot: {
        sourced: 500,
        applied: 320,
        screened: 180,
        interviewed: 75,
        offered: 50,
        hired: 40
      },
      trends: {
        hiresOverTime: [8, 12, 10, 15, 18, 12],
        timeToHireTrend: [42, 40, 38, 36, 38, 35],
        costPerHireTrend: [9200, 8800, 8500, 8600, 8400, 8300]
      },
      topSources: [
        { name: 'Referral', hires: 16, percentage: 32 },
        { name: 'LinkedIn', hires: 12, percentage: 24 },
        { name: 'Indeed', hires: 8, percentage: 16 }
      ],
      topRecruiters: [
        { name: 'Sarah Johnson', hires: 15, avgTime: 32 },
        { name: 'Michael Chen', hires: 10, avgTime: 38 }
      ],
      slaCompliance: {
        overall: 88,
        byType: {
          response: 90,
          screening: 85,
          feedback: 88
        }
      },
      alerts: [
        { type: 'warning', message: 'Interview bottleneck detected - 45 candidates waiting', priority: 'high' },
        { type: 'info', message: 'Referral program exceeded Q1 target', priority: 'low' }
      ]
    };

    res.json(mockDashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
  }
};

export const getRecruitmentStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const mockStats = {
      period: {
        start: startDate || '2024-01-01',
        end: endDate || '2024-03-31'
      },
      hiring: {
        totalHires: 50,
        targetHires: 60,
        progress: 83.3,
        avgTimeToHire: 38,
        avgCostPerHire: 8500
      },
      pipeline: {
        totalCandidates: 500,
        activeInPipeline: 280,
        hiredThisPeriod: 50,
        rejectedThisPeriod: 150,
        withdrawnThisPeriod: 20
      },
      efficiency: {
        funnelConversion: 10,
        interviewsPerHire: 14.8,
        offerAcceptanceRate: 80,
        slaCompliance: 88
      },
      diversity: {
        femaleHires: 42.5,
        minorityHires: 35,
        veteranHires: 4
      },
      quality: {
        avgQualityScore: 4.2,
        retention90Days: 94,
        managerSatisfaction: 4.0
      }
    };

    res.json(mockStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruitment stats' });
  }
};

export const exportAnalyticsReport = async (req: Request, res: Response) => {
  try {
    const { reportType, format, startDate, endDate } = req.body;
    const report = {
      id: `report-${Date.now()}`,
      reportType,
      format: format || 'pdf',
      period: {
        start: startDate,
        end: endDate
      },
      status: 'generating',
      downloadUrl: null,
      createdAt: new Date().toISOString()
    };
    res.status(202).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export analytics report' });
  }
};
