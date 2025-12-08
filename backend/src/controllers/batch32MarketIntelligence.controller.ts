// Batch 32: Market Intelligence Controller (9.3.1-9.3.6)
import { Request, Response } from 'express';

// ==========================================
// 9.3.1 Salary Market Data Controllers
// ==========================================

// Get salary market data
export const getSalaryMarketData = async (req: Request, res: Response) => {
  try {
    const { jobTitle, location, level, industry, companySize } = req.query;

    // Mock salary data
    const salaryData = [
      {
        id: 'smd-001',
        organizationId: 'org-001',
        jobTitle: 'Software Engineer',
        jobFamily: 'Engineering',
        level: 'senior',
        location: 'San Francisco, CA',
        country: 'USA',
        region: 'West',
        isRemote: false,
        currency: 'USD',
        minSalary: 150000,
        maxSalary: 220000,
        medianSalary: 180000,
        percentile25: 160000,
        percentile75: 200000,
        percentile90: 215000,
        bonusMin: 10000,
        bonusMax: 50000,
        bonusMedian: 25000,
        equityMin: 50000,
        equityMax: 200000,
        equityMedian: 100000,
        dataSource: 'market_data_provider',
        sampleSize: 1250,
        confidenceLevel: 0.95,
        effectiveDate: new Date().toISOString(),
        industry: 'Technology',
        companySize: 'large',
        trendDirection: 'increasing',
        trendPercentage: 5.2,
      },
      {
        id: 'smd-002',
        organizationId: 'org-001',
        jobTitle: 'Product Manager',
        jobFamily: 'Product',
        level: 'mid',
        location: 'New York, NY',
        country: 'USA',
        region: 'East',
        isRemote: true,
        currency: 'USD',
        minSalary: 120000,
        maxSalary: 180000,
        medianSalary: 145000,
        percentile25: 130000,
        percentile75: 165000,
        percentile90: 175000,
        bonusMin: 15000,
        bonusMax: 40000,
        bonusMedian: 25000,
        dataSource: 'survey',
        sampleSize: 850,
        confidenceLevel: 0.92,
        effectiveDate: new Date().toISOString(),
        industry: 'Technology',
        companySize: 'medium',
        trendDirection: 'stable',
        trendPercentage: 2.1,
      },
    ];

    res.json({
      success: true,
      salaryData,
      total: salaryData.length,
      filters: { jobTitle, location, level, industry, companySize },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch salary market data' });
  }
};

// Get salary comparison
export const getSalaryComparison = async (req: Request, res: Response) => {
  try {
    const { jobTitle, location, companySize } = req.query;

    const comparison = {
      jobTitle: jobTitle || 'Software Engineer',
      location: location || 'San Francisco, CA',
      organizationSalary: {
        min: 145000,
        max: 200000,
        median: 170000,
      },
      marketSalary: {
        min: 150000,
        max: 220000,
        median: 180000,
      },
      variance: {
        minVariance: -3.3,
        maxVariance: -9.1,
        medianVariance: -5.6,
      },
      competitiveness: 'slightly_below_market',
      recommendations: [
        'Consider increasing salary range by 5-10% to remain competitive',
        'Remote options could offset lower salary',
        'Review total compensation including equity and benefits',
      ],
    };

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch salary comparison' });
  }
};

// Get salary trends
export const getSalaryTrends = async (req: Request, res: Response) => {
  try {
    const { jobTitle, location, period = '12months' } = req.query;

    const trends = {
      jobTitle: jobTitle || 'Software Engineer',
      location: location || 'All',
      period,
      dataPoints: [
        { month: 'Jan 2024', median: 165000, change: 0 },
        { month: 'Feb 2024', median: 166000, change: 0.6 },
        { month: 'Mar 2024', median: 168000, change: 1.2 },
        { month: 'Apr 2024', median: 170000, change: 1.2 },
        { month: 'May 2024', median: 172000, change: 1.2 },
        { month: 'Jun 2024', median: 175000, change: 1.7 },
        { month: 'Jul 2024', median: 176000, change: 0.6 },
        { month: 'Aug 2024', median: 178000, change: 1.1 },
        { month: 'Sep 2024', median: 180000, change: 1.1 },
        { month: 'Oct 2024', median: 180000, change: 0 },
        { month: 'Nov 2024', median: 182000, change: 1.1 },
        { month: 'Dec 2024', median: 185000, change: 1.6 },
      ],
      overallChange: 12.1,
      averageMonthlyChange: 1.0,
      forecast: {
        nextQuarter: 190000,
        nextYear: 205000,
        confidence: 0.85,
      },
    };

    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch salary trends' });
  }
};

// ==========================================
// 9.3.2 Talent Pool Analysis Controllers
// ==========================================

// Get talent pool analyses
export const getTalentPoolAnalyses = async (req: Request, res: Response) => {
  try {
    const { status, analysisType } = req.query;

    const analyses = [
      {
        id: 'tpa-001',
        organizationId: 'org-001',
        analysisName: 'Senior Frontend Engineers - SF Bay Area',
        analysisType: 'combined',
        status: 'completed',
        targetSkills: ['React', 'TypeScript', 'Node.js'],
        targetLocations: ['San Francisco', 'San Jose', 'Oakland'],
        experienceRange: { min: 5, max: 10 },
        educationLevel: 'bachelors',
        totalCandidates: 12500,
        qualifiedCandidates: 3200,
        activeJobSeekers: 450,
        passiveCandidates: 2750,
        skillDistribution: {
          'React': 2800,
          'TypeScript': 2100,
          'Node.js': 1900,
          'GraphQL': 800,
        },
        locationDistribution: {
          'San Francisco': 1800,
          'San Jose': 900,
          'Oakland': 500,
        },
        availabilityScore: 72,
        competitionLevel: 'high',
        avgTimeToHire: 35,
        recommendations: [
          'Consider expanding to remote candidates',
          'Skills gap in GraphQL - may need training programs',
          'Active talent pool is limited - focus on passive sourcing',
        ],
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tpa-002',
        organizationId: 'org-001',
        analysisName: 'Data Scientists - Remote US',
        analysisType: 'skill_based',
        status: 'completed',
        targetSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
        targetLocations: ['Remote - US'],
        experienceRange: { min: 3, max: 8 },
        totalCandidates: 28000,
        qualifiedCandidates: 5500,
        activeJobSeekers: 1200,
        passiveCandidates: 4300,
        availabilityScore: 68,
        competitionLevel: 'very_high',
        avgTimeToHire: 42,
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      analyses,
      total: analyses.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch talent pool analyses' });
  }
};

// Create talent pool analysis
export const createTalentPoolAnalysis = async (req: Request, res: Response) => {
  try {
    const { analysisName, analysisType, targetSkills, targetLocations, experienceRange, educationLevel } = req.body;

    const analysis = {
      id: `tpa-${Date.now()}`,
      organizationId: 'org-001',
      analysisName,
      analysisType,
      status: 'pending',
      targetSkills,
      targetLocations,
      experienceRange,
      educationLevel,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, analysis, message: 'Analysis started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create talent pool analysis' });
  }
};

// Get talent pool analysis
export const getTalentPoolAnalysis = async (req: Request, res: Response) => {
  try {
    const { analysisId } = req.params;

    const analysis = {
      id: analysisId,
      organizationId: 'org-001',
      analysisName: 'Senior Frontend Engineers - SF Bay Area',
      analysisType: 'combined',
      status: 'completed',
      targetSkills: ['React', 'TypeScript', 'Node.js'],
      targetLocations: ['San Francisco', 'San Jose', 'Oakland'],
      experienceRange: { min: 5, max: 10 },
      educationLevel: 'bachelors',
      totalCandidates: 12500,
      qualifiedCandidates: 3200,
      activeJobSeekers: 450,
      passiveCandidates: 2750,
      skillDistribution: {
        'React': 2800,
        'TypeScript': 2100,
        'Node.js': 1900,
        'GraphQL': 800,
      },
      locationDistribution: {
        'San Francisco': 1800,
        'San Jose': 900,
        'Oakland': 500,
      },
      experienceDistribution: {
        '5-6 years': 1200,
        '7-8 years': 1100,
        '9-10 years': 900,
      },
      salaryDistribution: {
        '150k-175k': 800,
        '175k-200k': 1400,
        '200k-225k': 700,
        '225k+': 300,
      },
      availabilityScore: 72,
      competitionLevel: 'high',
      avgTimeToHire: 35,
      recommendations: [
        'Consider expanding to remote candidates',
        'Skills gap in GraphQL - may need training programs',
        'Active talent pool is limited - focus on passive sourcing',
      ],
      completedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch talent pool analysis' });
  }
};

// ==========================================
// 9.3.3 Competitor Hiring Insights Controllers
// ==========================================

// Get competitor insights
export const getCompetitorInsights = async (req: Request, res: Response) => {
  try {
    const { industry, companySize } = req.query;

    const competitors = [
      {
        id: 'ci-001',
        organizationId: 'org-001',
        competitorName: 'TechCorp Inc',
        competitorDomain: 'techcorp.com',
        industry: 'Technology',
        companySize: 'large',
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalJobPostings: 245,
        activeJobPostings: 82,
        closedJobPostings: 163,
        engineeringJobs: 120,
        salesJobs: 45,
        marketingJobs: 30,
        operationsJobs: 25,
        otherJobs: 25,
        avgPostingDuration: 28,
        hiringVelocity: 'aggressive',
        topSkills: ['Python', 'Kubernetes', 'AWS', 'React', 'Machine Learning'],
        emergingSkills: ['Rust', 'WebAssembly', 'Edge Computing'],
        primaryLocations: ['San Francisco', 'Austin', 'Remote'],
        remoteRatio: 45,
        avgSalaryRange: { min: 140000, max: 250000, currency: 'USD' },
        growthTrend: 'growing',
        growthRate: 25,
        source: 'linkedin',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ci-002',
        organizationId: 'org-001',
        competitorName: 'DataFlow Systems',
        competitorDomain: 'dataflow.io',
        industry: 'Technology',
        companySize: 'medium',
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalJobPostings: 78,
        activeJobPostings: 35,
        closedJobPostings: 43,
        engineeringJobs: 45,
        salesJobs: 15,
        marketingJobs: 10,
        operationsJobs: 5,
        otherJobs: 3,
        avgPostingDuration: 35,
        hiringVelocity: 'normal',
        topSkills: ['Go', 'PostgreSQL', 'Kafka', 'React', 'TypeScript'],
        emergingSkills: ['dbt', 'Snowflake'],
        primaryLocations: ['New York', 'Remote'],
        remoteRatio: 65,
        avgSalaryRange: { min: 130000, max: 220000, currency: 'USD' },
        growthTrend: 'stable',
        growthRate: 8,
        source: 'linkedin',
        lastUpdated: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      competitors,
      total: competitors.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch competitor insights' });
  }
};

// Add competitor to track
export const addCompetitor = async (req: Request, res: Response) => {
  try {
    const { competitorName, competitorDomain, industry, companySize } = req.body;

    const competitor = {
      id: `ci-${Date.now()}`,
      organizationId: 'org-001',
      competitorName,
      competitorDomain,
      industry,
      companySize,
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      totalJobPostings: 0,
      activeJobPostings: 0,
      status: 'tracking_started',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, competitor, message: 'Competitor tracking started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add competitor' });
  }
};

// Get competitor insight
export const getCompetitorInsight = async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;

    const competitor = {
      id: competitorId,
      organizationId: 'org-001',
      competitorName: 'TechCorp Inc',
      competitorDomain: 'techcorp.com',
      industry: 'Technology',
      companySize: 'large',
      periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      totalJobPostings: 245,
      activeJobPostings: 82,
      closedJobPostings: 163,
      engineeringJobs: 120,
      salesJobs: 45,
      marketingJobs: 30,
      operationsJobs: 25,
      otherJobs: 25,
      avgPostingDuration: 28,
      hiringVelocity: 'aggressive',
      topSkills: ['Python', 'Kubernetes', 'AWS', 'React', 'Machine Learning'],
      emergingSkills: ['Rust', 'WebAssembly', 'Edge Computing'],
      primaryLocations: ['San Francisco', 'Austin', 'Remote'],
      remoteRatio: 45,
      avgSalaryRange: { min: 140000, max: 250000, currency: 'USD' },
      growthTrend: 'growing',
      growthRate: 25,
      historicalData: [
        { month: 'Oct 2024', postings: 65, hires: 45 },
        { month: 'Nov 2024', postings: 72, hires: 52 },
        { month: 'Dec 2024', postings: 82, hires: 66 },
      ],
    };

    res.json({ success: true, competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch competitor insight' });
  }
};

// Delete competitor tracking
export const deleteCompetitor = async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;

    res.json({ success: true, message: 'Competitor tracking removed', competitorId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete competitor' });
  }
};

// ==========================================
// 9.3.4 Skills Demand Trends Controllers
// ==========================================

// Get skills demand trends
export const getSkillsDemandTrends = async (req: Request, res: Response) => {
  try {
    const { skillCategory, industry, trendDirection } = req.query;

    const trends = [
      {
        id: 'sdt-001',
        organizationId: 'org-001',
        skillName: 'Generative AI',
        skillCategory: 'technical',
        skillType: 'methodology',
        periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        granularity: 'monthly',
        demandScore: 95,
        mentionCount: 45000,
        jobPostingCount: 12500,
        growthRate: 280,
        trendDirection: 'emerging',
        velocityScore: 9.5,
        maturityLevel: 'emerging',
        industryDemand: {
          Technology: 85,
          Finance: 65,
          Healthcare: 50,
          Retail: 40,
        },
        salaryPremium: 25,
        avgSalaryWithSkill: 195000,
        relatedSkills: ['Python', 'LLMs', 'Prompt Engineering', 'RAG'],
        forecastDemand: { '6months': 115, '12months': 125 },
        confidenceScore: 0.92,
      },
      {
        id: 'sdt-002',
        organizationId: 'org-001',
        skillName: 'Kubernetes',
        skillCategory: 'technical',
        skillType: 'tool',
        periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        granularity: 'monthly',
        demandScore: 88,
        mentionCount: 62000,
        jobPostingCount: 28000,
        growthRate: 15,
        trendDirection: 'growing',
        velocityScore: 6.2,
        maturityLevel: 'mature',
        industryDemand: {
          Technology: 90,
          Finance: 75,
          Healthcare: 55,
          Retail: 45,
        },
        salaryPremium: 18,
        avgSalaryWithSkill: 175000,
        relatedSkills: ['Docker', 'AWS', 'Terraform', 'Helm'],
        forecastDemand: { '6months': 92, '12months': 95 },
        confidenceScore: 0.95,
      },
      {
        id: 'sdt-003',
        organizationId: 'org-001',
        skillName: 'React',
        skillCategory: 'technical',
        skillType: 'framework',
        periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        granularity: 'monthly',
        demandScore: 82,
        mentionCount: 85000,
        jobPostingCount: 42000,
        growthRate: 5,
        trendDirection: 'stable',
        velocityScore: 3.1,
        maturityLevel: 'mature',
        industryDemand: {
          Technology: 85,
          Finance: 70,
          Healthcare: 60,
          Retail: 75,
        },
        salaryPremium: 12,
        avgSalaryWithSkill: 165000,
        relatedSkills: ['TypeScript', 'Next.js', 'Redux', 'GraphQL'],
        forecastDemand: { '6months': 80, '12months': 78 },
        confidenceScore: 0.93,
      },
    ];

    res.json({
      success: true,
      trends,
      total: trends.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch skills demand trends' });
  }
};

// Get emerging skills
export const getEmergingSkills = async (req: Request, res: Response) => {
  try {
    const { industry, limit = 10 } = req.query;

    const emergingSkills = [
      { skillName: 'Generative AI', growthRate: 280, demandScore: 95, category: 'AI/ML' },
      { skillName: 'Prompt Engineering', growthRate: 350, demandScore: 78, category: 'AI/ML' },
      { skillName: 'RAG (Retrieval Augmented Generation)', growthRate: 420, demandScore: 72, category: 'AI/ML' },
      { skillName: 'Rust', growthRate: 85, demandScore: 68, category: 'Programming' },
      { skillName: 'WebAssembly', growthRate: 95, demandScore: 55, category: 'Web' },
      { skillName: 'Edge Computing', growthRate: 75, demandScore: 62, category: 'Infrastructure' },
      { skillName: 'Vector Databases', growthRate: 180, demandScore: 58, category: 'Data' },
      { skillName: 'Platform Engineering', growthRate: 120, demandScore: 70, category: 'DevOps' },
      { skillName: 'FinOps', growthRate: 110, demandScore: 52, category: 'Operations' },
      { skillName: 'Zero Trust Security', growthRate: 90, demandScore: 65, category: 'Security' },
    ];

    res.json({
      success: true,
      emergingSkills: emergingSkills.slice(0, Number(limit)),
      industry: industry || 'All',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch emerging skills' });
  }
};

// Get skill forecast
export const getSkillForecast = async (req: Request, res: Response) => {
  try {
    const { skillName } = req.params;

    const forecast = {
      skillName: skillName || 'Generative AI',
      currentDemandScore: 95,
      forecast: [
        { period: 'Q1 2025', demandScore: 98, confidence: 0.92 },
        { period: 'Q2 2025', demandScore: 105, confidence: 0.88 },
        { period: 'Q3 2025', demandScore: 112, confidence: 0.82 },
        { period: 'Q4 2025', demandScore: 118, confidence: 0.75 },
      ],
      factors: [
        { factor: 'Industry adoption', impact: 'positive', weight: 0.35 },
        { factor: 'Tool maturity', impact: 'positive', weight: 0.25 },
        { factor: 'Talent supply', impact: 'negative', weight: 0.20 },
        { factor: 'Educational programs', impact: 'positive', weight: 0.20 },
      ],
      recommendations: [
        'Start upskilling programs now to build internal capability',
        'Consider hiring contractors while building permanent team',
        'Partner with universities for talent pipeline',
      ],
    };

    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch skill forecast' });
  }
};

// ==========================================
// 9.3.5 Location Intelligence Controllers
// ==========================================

// Get location intelligence
export const getLocationIntelligence = async (req: Request, res: Response) => {
  try {
    const { country, locationType } = req.query;

    const locations = [
      {
        id: 'li-001',
        organizationId: 'org-001',
        locationName: 'San Francisco',
        locationType: 'city',
        country: 'USA',
        region: 'West',
        timezone: 'America/Los_Angeles',
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalTalentPool: 285000,
        activeTalentPool: 42000,
        costOfLiving: 182,
        avgSalary: 175000,
        salaryIndex: 145,
        remoteRatio: 45,
        hybridRatio: 35,
        onsiteRatio: 20,
        remoteGrowth: 15,
        competitorPresence: 450,
        hiringActivity: 'high',
        talentDemand: 92,
        unemploymentRate: 3.2,
        techJobGrowth: 8.5,
        startupActivity: 95,
        techInfrastructure: 98,
        connectivity: 95,
        recommendations: [
          'High competition - consider premium compensation',
          'Strong talent pool but expensive market',
          'Remote/hybrid options increasingly expected',
        ],
      },
      {
        id: 'li-002',
        organizationId: 'org-001',
        locationName: 'Austin',
        locationType: 'city',
        country: 'USA',
        region: 'South',
        timezone: 'America/Chicago',
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalTalentPool: 125000,
        activeTalentPool: 22000,
        costOfLiving: 105,
        avgSalary: 145000,
        salaryIndex: 118,
        remoteRatio: 50,
        hybridRatio: 30,
        onsiteRatio: 20,
        remoteGrowth: 20,
        competitorPresence: 280,
        hiringActivity: 'high',
        talentDemand: 85,
        unemploymentRate: 3.5,
        techJobGrowth: 12.5,
        startupActivity: 88,
        techInfrastructure: 92,
        connectivity: 90,
        recommendations: [
          'Growing tech hub with competitive costs',
          'Strong migration of tech talent',
          'Good balance of talent and cost',
        ],
      },
      {
        id: 'li-003',
        organizationId: 'org-001',
        locationName: 'Remote - US',
        locationType: 'region',
        country: 'USA',
        region: 'National',
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalTalentPool: 1500000,
        activeTalentPool: 280000,
        avgSalary: 155000,
        salaryIndex: 125,
        remoteRatio: 100,
        competitorPresence: 2500,
        hiringActivity: 'very_high',
        talentDemand: 78,
        recommendations: [
          'Largest talent pool with diverse skills',
          'Highly competitive for top candidates',
          'Need strong remote culture and tooling',
        ],
      },
    ];

    res.json({
      success: true,
      locations,
      total: locations.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch location intelligence' });
  }
};

// Get location comparison
export const getLocationComparison = async (req: Request, res: Response) => {
  try {
    const { locations } = req.body;

    const comparison = {
      locations: locations || ['San Francisco', 'Austin', 'Remote - US'],
      metrics: [
        {
          metric: 'Avg Salary',
          'San Francisco': '$175,000',
          'Austin': '$145,000',
          'Remote - US': '$155,000',
        },
        {
          metric: 'Cost of Living Index',
          'San Francisco': 182,
          'Austin': 105,
          'Remote - US': 'Varies',
        },
        {
          metric: 'Talent Pool Size',
          'San Francisco': '285,000',
          'Austin': '125,000',
          'Remote - US': '1,500,000',
        },
        {
          metric: 'Competition Level',
          'San Francisco': 'Very High',
          'Austin': 'High',
          'Remote - US': 'High',
        },
        {
          metric: 'Remote Adoption',
          'San Francisco': '45%',
          'Austin': '50%',
          'Remote - US': '100%',
        },
      ],
      recommendation: 'Austin offers the best balance of talent availability and cost-effectiveness',
    };

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to compare locations' });
  }
};

// Get remote work trends
export const getRemoteWorkTrends = async (req: Request, res: Response) => {
  try {
    const trends = {
      overallRemoteAdoption: 52,
      hybridAdoption: 28,
      onsiteOnly: 20,
      yearOverYearChange: {
        remote: 8,
        hybrid: 12,
        onsite: -20,
      },
      byRole: {
        'Software Engineering': { remote: 65, hybrid: 25, onsite: 10 },
        'Product Management': { remote: 55, hybrid: 35, onsite: 10 },
        'Data Science': { remote: 60, hybrid: 30, onsite: 10 },
        'Sales': { remote: 40, hybrid: 40, onsite: 20 },
        'Marketing': { remote: 50, hybrid: 35, onsite: 15 },
      },
      byCompanySize: {
        'Startup': { remote: 70, hybrid: 20, onsite: 10 },
        'Medium': { remote: 55, hybrid: 30, onsite: 15 },
        'Large': { remote: 45, hybrid: 35, onsite: 20 },
        'Enterprise': { remote: 35, hybrid: 40, onsite: 25 },
      },
      forecast: {
        '2025': { remote: 55, hybrid: 30, onsite: 15 },
        '2026': { remote: 58, hybrid: 30, onsite: 12 },
      },
    };

    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch remote work trends' });
  }
};

// ==========================================
// 9.3.6 Industry Trends Controllers
// ==========================================

// Get industry trends
export const getIndustryTrends = async (req: Request, res: Response) => {
  try {
    const { industry } = req.query;

    const trends = [
      {
        id: 'it-001',
        organizationId: 'org-001',
        industryName: 'Technology',
        industryCode: 'NAICS-54',
        periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalHiring: 485000,
        hiringGrowth: 12,
        hiringVelocity: 'fast',
        seasonality: {
          Q1: 22,
          Q2: 28,
          Q3: 25,
          Q4: 25,
        },
        topRoles: [
          { role: 'Software Engineer', percentage: 28, growth: 8 },
          { role: 'Data Scientist', percentage: 12, growth: 15 },
          { role: 'Product Manager', percentage: 10, growth: 5 },
          { role: 'DevOps Engineer', percentage: 8, growth: 18 },
          { role: 'AI/ML Engineer', percentage: 7, growth: 45 },
        ],
        emergingRoles: ['AI Engineer', 'Platform Engineer', 'Developer Experience'],
        decliningRoles: ['Manual QA', 'System Administrator'],
        topSkills: ['Python', 'JavaScript', 'AWS', 'Kubernetes', 'React'],
        emergingSkills: ['Generative AI', 'Rust', 'Platform Engineering'],
        skillGaps: ['AI/ML', 'Cybersecurity', 'Cloud Architecture'],
        avgSalaryGrowth: 6.5,
        remoteAdoption: 55,
        hybridAdoption: 30,
        marketSize: 5.2,
        marketGrowth: 8.5,
        outlook: 'positive',
        confidenceScore: 0.92,
      },
      {
        id: 'it-002',
        organizationId: 'org-001',
        industryName: 'Healthcare',
        industryCode: 'NAICS-62',
        periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalHiring: 320000,
        hiringGrowth: 8,
        hiringVelocity: 'normal',
        topRoles: [
          { role: 'Healthcare IT Specialist', percentage: 18, growth: 12 },
          { role: 'Data Analyst', percentage: 15, growth: 10 },
          { role: 'Software Engineer', percentage: 12, growth: 15 },
          { role: 'Clinical Informaticist', percentage: 8, growth: 20 },
        ],
        emergingRoles: ['Health AI Specialist', 'Telehealth Coordinator'],
        topSkills: ['Python', 'SQL', 'HIPAA', 'EHR Systems', 'Data Analysis'],
        emergingSkills: ['Health AI', 'Interoperability', 'FHIR'],
        skillGaps: ['Healthcare AI', 'Cybersecurity', 'Data Engineering'],
        avgSalaryGrowth: 5.2,
        remoteAdoption: 35,
        hybridAdoption: 40,
        marketSize: 4.1,
        marketGrowth: 6.8,
        outlook: 'positive',
        confidenceScore: 0.88,
      },
    ];

    res.json({
      success: true,
      trends,
      total: trends.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch industry trends' });
  }
};

// Get industry comparison
export const getIndustryComparison = async (req: Request, res: Response) => {
  try {
    const { industries } = req.body;

    const comparison = {
      industries: industries || ['Technology', 'Healthcare', 'Finance'],
      metrics: [
        {
          metric: 'Hiring Growth',
          Technology: '12%',
          Healthcare: '8%',
          Finance: '5%',
        },
        {
          metric: 'Avg Salary',
          Technology: '$165,000',
          Healthcare: '$125,000',
          Finance: '$145,000',
        },
        {
          metric: 'Remote Adoption',
          Technology: '55%',
          Healthcare: '35%',
          Finance: '45%',
        },
        {
          metric: 'AI Adoption',
          Technology: 'High',
          Healthcare: 'Medium',
          Finance: 'Medium-High',
        },
        {
          metric: 'Skill Gap Severity',
          Technology: 'High',
          Healthcare: 'Very High',
          Finance: 'Medium',
        },
      ],
      insights: [
        'Technology leads in remote adoption and AI integration',
        'Healthcare has significant skill gaps, especially in AI and data',
        'Finance maintains stable growth with strong compensation',
      ],
    };

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to compare industries' });
  }
};

// Get industry forecast
export const getIndustryForecast = async (req: Request, res: Response) => {
  try {
    const { industryName } = req.params;

    const forecast = {
      industryName: industryName || 'Technology',
      currentMetrics: {
        hiringGrowth: 12,
        avgSalary: 165000,
        remoteAdoption: 55,
      },
      forecast: [
        {
          period: 'Q1 2025',
          hiringGrowth: 10,
          avgSalaryGrowth: 5,
          confidence: 0.92,
        },
        {
          period: 'Q2 2025',
          hiringGrowth: 11,
          avgSalaryGrowth: 5.5,
          confidence: 0.88,
        },
        {
          period: 'Q3 2025',
          hiringGrowth: 12,
          avgSalaryGrowth: 6,
          confidence: 0.82,
        },
        {
          period: 'Q4 2025',
          hiringGrowth: 13,
          avgSalaryGrowth: 6,
          confidence: 0.75,
        },
      ],
      keyDrivers: [
        'AI/ML continued adoption',
        'Cloud infrastructure expansion',
        'Cybersecurity investments',
        'Digital transformation initiatives',
      ],
      risks: [
        'Economic uncertainty',
        'Tech layoff cycles',
        'Talent supply constraints',
      ],
    };

    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch industry forecast' });
  }
};

// ==========================================
// Dashboard & Summary Controllers
// ==========================================

// Get market intelligence dashboard
export const getMarketIntelligenceDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = {
      snapshot: {
        date: new Date().toISOString(),
        marketHealthScore: 78,
        salaryIndexChange: 5.2,
        talentAvailabilityScore: 68,
        competitorActivityScore: 82,
        skillDemandShift: 12,
      },
      topInsights: [
        {
          type: 'alert',
          title: 'AI Skills Surge',
          description: 'Generative AI skills demand up 280% YoY',
          severity: 'high',
        },
        {
          type: 'opportunity',
          title: 'Austin Talent Pool Growing',
          description: 'Tech talent in Austin increased 15% with lower costs',
          severity: 'medium',
        },
        {
          type: 'warning',
          title: 'Competitor Hiring Spike',
          description: 'TechCorp increased hiring 25% in engineering',
          severity: 'medium',
        },
      ],
      quickStats: {
        trackedCompetitors: 12,
        salaryDataPoints: 2500,
        talentPoolAnalyses: 8,
        skillsTracked: 150,
        locationsMonitored: 25,
      },
      recentActivity: [
        { action: 'Talent pool analysis completed', target: 'Senior Frontend Engineers', time: '2 hours ago' },
        { action: 'Salary data updated', target: 'Engineering roles', time: '4 hours ago' },
        { action: 'New competitor added', target: 'TechStartup Inc', time: '1 day ago' },
      ],
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch market intelligence dashboard' });
  }
};

// Get market snapshot
export const getMarketSnapshot = async (req: Request, res: Response) => {
  try {
    const { snapshotType = 'daily' } = req.query;

    const snapshot = {
      id: `ms-${Date.now()}`,
      organizationId: 'org-001',
      snapshotDate: new Date().toISOString(),
      snapshotType,
      salaryIndexChange: 5.2,
      talentAvailabilityScore: 68,
      competitorActivityScore: 82,
      skillDemandShift: 12,
      marketHealthScore: 78,
      topInsights: [
        'AI/ML skills demand continues to surge across all industries',
        'Remote work adoption stabilizing at ~55% for tech roles',
        'Competitor hiring activity increased 15% this quarter',
      ],
      alerts: [
        { type: 'salary', message: 'Engineering salaries trending 5% above your current ranges' },
        { type: 'competition', message: 'Key competitor opened 25 new engineering positions' },
      ],
      recommendations: [
        'Review engineering compensation to remain competitive',
        'Consider Austin for new office location based on talent availability',
        'Start upskilling programs for AI/ML capabilities',
      ],
    };

    res.json({ success: true, snapshot });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch market snapshot' });
  }
};

// Export market intelligence report
export const exportMarketIntelligenceReport = async (req: Request, res: Response) => {
  try {
    const { format = 'pdf', sections } = req.body;

    const report = {
      id: `mir-${Date.now()}`,
      format,
      sections: sections || ['salary', 'talent', 'competitors', 'skills', 'locations', 'industry'],
      status: 'generating',
      estimatedTime: '30 seconds',
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, report, message: 'Report generation started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to export market intelligence report' });
  }
};
