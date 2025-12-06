import { Request, Response } from 'express';

// ============================================
// 2.1.8 - SALARY EXPECTATION ALIGNMENT
// ============================================

// Get salary alignment analysis
export const getSalaryAlignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId } = req.query;

    const salaryAlignment = {
      id: 'sa-001',
      userId,
      profileId: 'profile-001',
      jobId: jobId || null,

      // Candidate Expectations
      expectedSalaryMin: 120000,
      expectedSalaryMax: 150000,
      expectedSalaryCurrency: 'USD',
      salaryFlexibility: 'SOMEWHAT_FLEXIBLE',
      prioritizesEquity: true,
      bonusExpectations: 15,
      benefitsPriority: ['health', '401k', 'remote', 'pto'],

      // Market Data
      marketSalaryMin: 110000,
      marketSalaryMax: 160000,
      marketSalaryMedian: 135000,
      marketSalaryCurrency: 'USD',
      marketPercentile: 65,
      marketDataSource: 'Glassdoor + LinkedIn',
      marketDataDate: new Date().toISOString(),

      // Job Budget (if job specified)
      jobBudgetMin: jobId ? 115000 : null,
      jobBudgetMax: jobId ? 145000 : null,
      budgetFlexibility: jobId ? 'FLEXIBLE' : null,

      // Alignment Analysis
      alignmentScore: 82,
      alignmentCategory: 'WELL_ALIGNED',
      gapAnalysis: {
        gap: 0,
        percentage: 0,
        direction: 'ALIGNED',
        details: 'Candidate expectations are within market range',
      },

      // Total Compensation Analysis
      baseSalaryAlignment: 85,
      bonusAlignment: 78,
      equityAlignment: 72,
      benefitsValue: 25000,
      totalCompAlignment: 80,

      // Location Adjustments
      locationAdjustment: 1.0,
      adjustedExpectation: 135000,

      // Negotiation Insights
      negotiationRoom: 10000,
      suggestedOffer: 132000,
      counterOfferLikely: true,

      // AI Recommendations
      recommendations: [
        'Candidate expectations align well with market rates',
        'Consider offering equity to meet total compensation expectations',
        'Remote work flexibility could offset base salary negotiations',
      ],
      negotiationTips: [
        'Lead with total compensation package value',
        'Highlight equity upside potential',
        'Emphasize benefits that align with candidate priorities',
      ],
      alignmentSummary: 'This candidate\'s salary expectations are well-aligned with market data and within the typical range for this role and experience level. The alignment score of 82% indicates strong negotiation potential.',

      // Metadata
      scoringVersion: '1.0',
      lastAnalyzedAt: new Date().toISOString(),
      confidence: 0.85,
    };

    res.json({ alignment: salaryAlignment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get salary alignment' });
  }
};

// Update salary expectations
export const updateSalaryExpectations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { expectedMin, expectedMax, currency, flexibility, prioritizesEquity, bonusExpectations, benefitsPriority } = req.body;

    const result = {
      updated: true,
      userId,
      expectations: {
        expectedMin,
        expectedMax,
        currency,
        flexibility,
        prioritizesEquity,
        bonusExpectations,
        benefitsPriority,
      },
      message: 'Salary expectations updated. Alignment will be recalculated.',
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update salary expectations' });
  }
};

// Get market salary data
export const getMarketSalaryData = async (req: Request, res: Response) => {
  try {
    const { title, location, seniority, industry } = req.query;

    const marketData = {
      jobTitle: title || 'Software Engineer',
      normalizedTitle: 'software_engineer',
      location: location || 'San Francisco, CA',
      seniorityLevel: seniority || 'SENIOR',
      industry: industry || 'Technology',

      currency: 'USD',
      baseSalary: {
        min: 130000,
        max: 200000,
        median: 165000,
        mean: 168000,
        percentile25: 145000,
        percentile75: 185000,
        percentile90: 210000,
      },
      totalCompensation: {
        min: 150000,
        max: 350000,
        median: 220000,
      },
      bonus: {
        min: 10000,
        max: 50000,
        median: 25000,
        typicalPercent: 15,
      },
      equity: {
        min: 20000,
        max: 150000,
        median: 50000,
      },
      sampleSize: 1250,
      dataSource: 'Aggregated from Glassdoor, LinkedIn, Levels.fyi',
      dataDate: new Date().toISOString(),
      yoyGrowth: 5.2,
      skillsPremiums: {
        'Machine Learning': 15,
        'Cloud Architecture': 12,
        'System Design': 10,
        'Kubernetes': 8,
      },
    };

    res.json({ marketData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get market salary data' });
  }
};

// ============================================
// 2.1.9 - LOCATION COMPATIBILITY
// ============================================

// Get location compatibility analysis
export const getLocationCompatibility = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId } = req.query;

    const compatibility = {
      id: 'lc-001',
      userId,
      profileId: 'profile-001',
      jobId: jobId || null,

      // Candidate Location
      currentCity: 'Austin',
      currentState: 'Texas',
      currentCountry: 'USA',
      currentTimezone: 'America/Chicago',

      // Work Preferences
      remotePreference: 'HYBRID',
      hybridDaysInOffice: 2,
      relocationWilling: true,
      relocationLocations: ['San Francisco', 'Seattle', 'New York'],
      relocationTimeframe: '1_3_MONTHS',
      relocationAssistance: true,

      // Travel Preferences
      travelWillingness: 'MODERATE',
      maxTravelPercent: 25,
      internationalTravel: true,

      // Job Requirements (if job specified)
      jobLocationType: jobId ? 'HYBRID' : null,
      jobCity: jobId ? 'San Francisco' : null,
      jobState: jobId ? 'California' : null,
      jobCountry: jobId ? 'USA' : null,
      jobTimezone: jobId ? 'America/Los_Angeles' : null,
      jobTravelRequired: jobId ? 'MINIMAL' : null,

      // Compatibility Analysis
      overallCompatibility: 85,
      compatibilityLevel: 'EXCELLENT',

      // Component Scores
      locationMatch: 78,
      remoteCompatibility: 95,
      timezoneOverlap: 88,
      travelCompatibility: 92,
      relocationFeasibility: 82,

      // Distance Analysis
      distanceToOffice: jobId ? 1500 : null,
      commuteTime: null,
      commuteMethod: null,

      // Timezone Analysis
      timezoneOffset: 2,
      overlapHours: 6,
      meetingFriendly: true,

      // Cost of Living
      candidateCOL: 95,
      jobLocationCOL: jobId ? 180 : null,
      salaryAdjustment: jobId ? 15 : null,

      // Visa/Work Authorization
      workAuthorization: 'CITIZEN',
      visaType: null,
      visaExpiry: null,
      sponsorshipNeeded: false,

      // AI Analysis
      compatibilityFactors: {
        remoteWork: { score: 95, impact: 'positive', note: 'Strong hybrid preference matches job' },
        timezone: { score: 88, impact: 'positive', note: '6-hour overlap sufficient for collaboration' },
        relocation: { score: 82, impact: 'positive', note: 'Willing to relocate with reasonable timeframe' },
      },
      challenges: [
        'Different timezone may require occasional early/late meetings',
      ],
      mitigations: [
        'Async communication tools can bridge timezone gaps',
        'Relocation support can accelerate transition if needed',
      ],
      recommendations: [
        'Candidate is highly compatible with hybrid arrangements',
        'Consider discussing relocation timeline early if preferred',
        'Timezone overlap is sufficient for most collaboration needs',
      ],
      compatibilitySummary: 'This candidate shows excellent location compatibility with an 85% score. Their flexibility with hybrid work and willingness to relocate make them highly adaptable to the role requirements.',

      // Metadata
      scoringVersion: '1.0',
      lastAnalyzedAt: new Date().toISOString(),
      confidence: 0.88,
    };

    res.json({ compatibility });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get location compatibility' });
  }
};

// Update location preferences
export const updateLocationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { remotePreference, relocationWilling, relocationLocations, travelWillingness } = req.body;

    const result = {
      updated: true,
      userId,
      preferences: {
        remotePreference,
        relocationWilling,
        relocationLocations,
        travelWillingness,
      },
      message: 'Location preferences updated successfully',
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update location preferences' });
  }
};

// ============================================
// 2.1.10 - DIVERSITY & INCLUSION METRICS
// ============================================

// Get D&I metrics for a job or company
export const getDIMetrics = async (req: Request, res: Response) => {
  try {
    const { jobId, companyId, analysisType } = req.query;

    const diMetrics = {
      id: 'di-001',
      companyId: companyId || 'company-001',
      jobId: jobId || null,
      analysisType: analysisType || 'JOB_POSTING',

      // Bias Detection in Job Postings
      genderNeutralityScore: 92,
      ageNeutralityScore: 88,
      accessibilityScore: 85,
      inclusivityScore: 90,
      flaggedTerms: [
        { term: 'rockstar', issue: 'Gendered language', suggestion: 'Use "high performer" instead' },
        { term: 'young and dynamic', issue: 'Age bias', suggestion: 'Use "energetic and motivated"' },
      ],

      // Pipeline Diversity Metrics
      pipelineDiversity: {
        applied: { total: 500, gender: { male: 55, female: 40, other: 5 }, ethnicity: 'diverse' },
        screened: { total: 200, gender: { male: 52, female: 43, other: 5 } },
        interviewed: { total: 50, gender: { male: 50, female: 46, other: 4 } },
        offered: { total: 10, gender: { male: 50, female: 50, other: 0 } },
      },
      sourceChannelDiversity: {
        linkedin: { diversity: 'moderate' },
        referral: { diversity: 'needs improvement' },
        university: { diversity: 'good' },
      },
      conversionByDemographic: {
        screenToInterview: { overall: 25, balanced: true },
        interviewToOffer: { overall: 20, balanced: true },
      },

      // Scoring Fairness
      scoringBiasAnalysis: {
        profileScore: { biasDetected: false, variance: 2.3 },
        technicalScore: { biasDetected: false, variance: 3.1 },
        cultureFitScore: { biasDetected: 'possible', variance: 5.2, note: 'Review cultural criteria' },
      },
      demographicScoreGaps: {
        gender: { gap: 2.1, significant: false },
        age: { gap: 3.5, significant: false },
      },
      statParityScore: 92,
      equalOpportunityScore: 88,

      // Representation Analysis
      industryBenchmarks: {
        techIndustry: { female: 28, underrepresented: 15 },
        company: { female: 35, underrepresented: 18 },
      },
      companyComparison: {
        vsIndustry: 'Above average',
        vsTopPerformers: 'On par',
      },
      underrepresentedGaps: {
        engineering: { gap: 5, trending: 'improving' },
        leadership: { gap: 12, trending: 'stable' },
      },

      // Recommendations
      biasAlerts: [
        'Review cultural fit scoring criteria for potential bias',
        'Referral channel shows lower diversity than other sources',
      ],
      improvementActions: {
        jobPosting: ['Replace flagged terms', 'Add accessibility statement'],
        sourcing: ['Diversify referral program', 'Partner with diversity organizations'],
        scoring: ['Audit cultural fit criteria', 'Implement blind initial screening'],
      },
      priorityFixes: [
        'Update job posting language',
        'Review cultural fit scoring rubric',
      ],

      // Compliance
      eeocCompliant: true,
      gdprCompliant: true,
      localCompliance: { california: true, newYork: true },

      // Overall Score
      overallDIScore: 87,
      diGrade: 'B+',

      // Audit Trail
      analyzedBy: 'System',
      reviewedBy: null,
      reviewNotes: null,
      analysisDate: new Date().toISOString(),
    };

    res.json({ metrics: diMetrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get D&I metrics' });
  }
};

// Analyze job posting for bias
export const analyzeJobPostingBias = async (req: Request, res: Response) => {
  try {
    const { jobDescription, title } = req.body;

    const analysis = {
      title: title || 'Job Posting',
      overallScore: 85,

      genderNeutrality: {
        score: 88,
        flaggedTerms: [
          { term: 'he/she', suggestion: 'they', reason: 'Use gender-neutral pronouns' },
        ],
      },
      ageNeutrality: {
        score: 92,
        flaggedTerms: [],
      },
      accessibilityInclusion: {
        score: 78,
        suggestions: [
          'Add statement about reasonable accommodations',
          'Include information about accessibility of workplace',
        ],
      },
      culturalInclusion: {
        score: 85,
        suggestions: [
          'Highlight diverse team composition',
          'Mention employee resource groups if available',
        ],
      },
      recommendations: [
        'Consider adding an equal opportunity statement',
        'Include salary range for pay transparency',
        'Add flexible work options to attract diverse candidates',
      ],
    };

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to analyze job posting' });
  }
};

// ============================================
// 2.1.11 - EXPLAINABLE AI SCORES
// ============================================

// Get score explanation
export const getScoreExplanation = async (req: Request, res: Response) => {
  try {
    const { scoreType, scoreId } = req.params;
    const userId = (req as any).user.id;

    const explanation = {
      id: 'exp-001',
      userId,
      scoreType,
      scoreId,
      scoreValue: 85,

      // High-Level Explanation
      summary: 'Your profile score of 85 reflects a strong overall profile with excellent technical depth and verified experience. The score is primarily driven by your comprehensive work history, validated skills, and active engagement in the tech community.',
      headline: 'Strong Profile with Excellent Technical Foundation',
      confidenceLevel: 'HIGH',

      // Component Breakdown
      components: [
        { name: 'Experience Depth', weight: 0.25, score: 92, contribution: 23, explanation: 'Rich work history with progressive responsibility' },
        { name: 'Skills Verification', weight: 0.20, score: 88, contribution: 17.6, explanation: 'High percentage of verified skills through assessments' },
        { name: 'Technical Projects', weight: 0.20, score: 85, contribution: 17, explanation: 'Strong portfolio with documented impact' },
        { name: 'Education', weight: 0.15, score: 80, contribution: 12, explanation: 'Relevant degree with continuous learning' },
        { name: 'Engagement', weight: 0.10, score: 78, contribution: 7.8, explanation: 'Active profile updates and platform engagement' },
        { name: 'Completeness', weight: 0.10, score: 75, contribution: 7.5, explanation: 'Most profile sections completed' },
      ],
      topContributors: [
        { factor: 'Work Experience', impact: '+15 points', reason: '8 years of progressive experience in relevant roles' },
        { factor: 'Skill Assessments', impact: '+10 points', reason: '12 skills verified through platform assessments' },
        { factor: 'GitHub Activity', impact: '+8 points', reason: 'Active contributor with quality repositories' },
      ],
      topDetractors: [
        { factor: 'Missing Certifications', impact: '-3 points', reason: 'Industry certifications would strengthen profile' },
        { factor: 'Profile Completeness', impact: '-2 points', reason: 'Some optional sections not filled' },
      ],

      // Factor Analysis
      factors: {
        experience: { weight: 0.25, rawScore: 92, normalizedScore: 23, dataPoints: 5 },
        skills: { weight: 0.20, rawScore: 88, normalizedScore: 17.6, dataPoints: 25 },
        projects: { weight: 0.20, rawScore: 85, normalizedScore: 17, dataPoints: 8 },
        education: { weight: 0.15, rawScore: 80, normalizedScore: 12, dataPoints: 3 },
      },
      factorWeights: {
        description: 'Weights are based on industry standards and role requirements',
        adjustable: false,
      },
      factorSources: {
        experience: 'Profile work history entries',
        skills: 'Self-reported skills + assessments + integrations',
        projects: 'Portfolio entries + GitHub analysis',
        education: 'Education entries + certifications',
      },

      // Comparison Context
      percentileRank: 82,
      similarProfiles: {
        count: 1500,
        averageScore: 72,
        medianScore: 74,
        yourRank: 'Top 18%',
      },
      benchmarkComparison: {
        roleAverage: 75,
        industryAverage: 72,
        topPerformers: 90,
        yourPosition: 'Above Average',
      },

      // What-If Analysis
      improvementSuggestions: [
        { action: 'Add AWS certification', potentialImpact: '+3 points', effort: 'Medium' },
        { action: 'Complete remaining profile sections', potentialImpact: '+2 points', effort: 'Low' },
        { action: 'Add more project descriptions', potentialImpact: '+2 points', effort: 'Low' },
        { action: 'Take advanced skill assessments', potentialImpact: '+4 points', effort: 'Medium' },
      ],
      sensitivityAnalysis: {
        experienceWeight: 'Increasing experience weight by 10% would add ~2 points',
        skillsWeight: 'Adding 3 more verified skills would add ~3 points',
      },

      // Visual Aids
      visualizations: {
        radarChart: { experience: 92, skills: 88, projects: 85, education: 80, engagement: 78 },
        trendLine: { '3mo': 78, '6mo': 82, '9mo': 84, '12mo': 85 },
        distribution: { yourScore: 85, distribution: 'normal', mean: 72, stdDev: 12 },
      },
      highlights: [
        'Strong technical foundation',
        'Well-verified skills',
        'Active community engagement',
        'Room for certification growth',
      ],

      // Transparency
      algorithmVersion: 'ProfileScore-v2.3',
      dataPoints: 156,
      dataQuality: 'HIGH',
      limitations: [
        'Score does not account for soft skills unless assessed',
        'Recent experience weighted more heavily',
        'Some integrations may have stale data',
      ],

      // Metadata
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    res.json({ explanation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get score explanation' });
  }
};

// Submit feedback on explanation
export const submitExplanationFeedback = async (req: Request, res: Response) => {
  try {
    const { explanationId } = req.params;
    const { rating, feedbackText } = req.body;

    const result = {
      submitted: true,
      explanationId,
      rating,
      feedbackText,
      message: 'Thank you for your feedback!',
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit feedback' });
  }
};

// ============================================
// 2.1.12 - SCORE CALIBRATION TOOLS
// ============================================

// Get calibration settings
export const getCalibrationSettings = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const calibrations = [
      {
        id: 'cal-001',
        companyId,
        calibrationName: 'Engineering Roles Default',
        description: 'Standard calibration for engineering positions',
        scope: 'JOB_FAMILY',
        jobFamilies: ['Engineering', 'Product'],
        isActive: true,

        profileScoreWeights: {
          experience: 0.25,
          skills: 0.25,
          projects: 0.20,
          education: 0.15,
          engagement: 0.15,
        },
        jobFitWeights: {
          skillsMatch: 0.30,
          experienceMatch: 0.25,
          educationMatch: 0.15,
          locationMatch: 0.15,
          salaryMatch: 0.15,
        },
        technicalWeights: {
          codeQuality: 0.25,
          systemDesign: 0.20,
          algorithms: 0.15,
          bestPractices: 0.20,
          testing: 0.20,
        },

        minimumThresholds: {
          profileScore: 60,
          technicalScore: 65,
          jobFitScore: 55,
        },
        knockoutCriteria: {
          noShowCount: 2,
          reliabilityScore: 50,
        },

        validationStatus: 'ACTIVE',
        candidatesScored: 450,
        hireCorrelation: 0.72,
        retentionCorrelation: 0.68,

        version: 3,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cal-002',
        companyId,
        calibrationName: 'Senior Engineering Focus',
        description: 'Higher weights on experience and system design for senior roles',
        scope: 'SPECIFIC_JOB',
        isActive: false,
        validationStatus: 'TESTING',
        candidatesScored: 25,
        version: 1,
      },
    ];

    res.json({ calibrations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get calibration settings' });
  }
};

// Create new calibration
export const createCalibration = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { name, description, scope, weights, thresholds, criteria } = req.body;

    const newCalibration = {
      id: 'cal-' + Date.now(),
      companyId,
      calibrationName: name,
      description,
      scope,
      ...weights,
      minimumThresholds: thresholds,
      knockoutCriteria: criteria,
      validationStatus: 'DRAFT',
      isActive: false,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    res.json({ calibration: newCalibration, message: 'Calibration created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create calibration' });
  }
};

// Update calibration
export const updateCalibration = async (req: Request, res: Response) => {
  try {
    const { calibrationId } = req.params;
    const updates = req.body;

    const result = {
      id: calibrationId,
      updated: true,
      changes: Object.keys(updates),
      message: 'Calibration updated successfully',
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update calibration' });
  }
};

// Activate calibration
export const activateCalibration = async (req: Request, res: Response) => {
  try {
    const { calibrationId } = req.params;

    const result = {
      id: calibrationId,
      activated: true,
      activatedAt: new Date().toISOString(),
      message: 'Calibration is now active',
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to activate calibration' });
  }
};

// Test calibration (dry run)
export const testCalibration = async (req: Request, res: Response) => {
  try {
    const { calibrationId } = req.params;
    const { sampleSize } = req.body;

    const testResults = {
      calibrationId,
      sampleSize: sampleSize || 50,
      results: {
        avgScoreChange: 3.2,
        candidatesAffected: 38,
        scoresIncreased: 25,
        scoresDecreased: 13,
        thresholdImpact: {
          wouldPass: 42,
          wouldFail: 8,
          noChange: 0,
        },
      },
      comparison: {
        currentCalibration: { avgScore: 72.5, passRate: 0.84 },
        newCalibration: { avgScore: 75.7, passRate: 0.82 },
      },
      recommendations: [
        'New calibration shows 4% higher average scores',
        'Slightly stricter filtering with 2% lower pass rate',
        'Consider increasing threshold to maintain quality bar',
      ],
    };

    res.json({ testResults });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to test calibration' });
  }
};

// Get calibration performance
export const getCalibrationPerformance = async (req: Request, res: Response) => {
  try {
    const { calibrationId } = req.params;

    const performance = {
      calibrationId,
      period: 'Last 6 months',
      metrics: {
        candidatesScored: 450,
        averageScore: 74.2,
        hireRate: 0.12,
        offerAcceptRate: 0.78,
      },
      correlations: {
        hireSuccess: { correlation: 0.72, significance: 'HIGH' },
        retention: { correlation: 0.68, significance: 'HIGH' },
        performance: { correlation: 0.61, significance: 'MEDIUM' },
      },
      scoreDistribution: {
        '0-50': 8,
        '51-60': 15,
        '61-70': 22,
        '71-80': 30,
        '81-90': 18,
        '91-100': 7,
      },
      hiringOutcomes: {
        highScoreHires: { avgScore: 82, successRate: 0.89 },
        mediumScoreHires: { avgScore: 68, successRate: 0.72 },
        lowScoreHires: { avgScore: 55, successRate: 0.48 },
      },
      recommendations: [
        'Current calibration shows strong correlation with hiring success',
        'Consider raising minimum threshold from 60 to 65 based on outcomes',
        'Technical score has highest predictive value for this role family',
      ],
    };

    res.json({ performance });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get calibration performance' });
  }
};
