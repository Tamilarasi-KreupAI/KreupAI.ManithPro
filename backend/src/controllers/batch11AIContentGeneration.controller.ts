import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 2.2.1 - AI JOB DESCRIPTION GENERATOR
// ============================================

// Generate a job description from parameters
export const generateJobDescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const {
      jobTitle,
      department,
      seniorityLevel,
      employmentType,
      workMode,
      location,
      requiredSkills,
      preferredSkills,
      yearsExperience,
      educationLevel,
      companyDescription,
      teamSize,
      reportingTo,
    } = req.body;

    // Simulate AI generation (in production, this would call OpenAI/Claude API)
    const generatedContent = {
      generatedTitle: `${seniorityLevel === 'SENIOR' ? 'Senior ' : ''}${jobTitle}`,
      generatedSummary: `We are seeking a talented ${jobTitle} to join our ${department || 'team'}. This ${workMode.toLowerCase()} position offers an exciting opportunity to work on challenging projects and make a meaningful impact.`,
      generatedResponsibilities: [
        `Lead and execute ${jobTitle.toLowerCase()}-related initiatives`,
        'Collaborate with cross-functional teams to deliver high-quality solutions',
        'Mentor junior team members and contribute to team growth',
        'Participate in code reviews and maintain high standards of quality',
        'Stay current with industry trends and best practices',
      ],
      generatedRequirements: [
        { skill: requiredSkills[0], level: 'Expert', required: true },
        ...(requiredSkills.slice(1).map((skill: string) => ({ skill, level: 'Proficient', required: true }))),
        ...(preferredSkills?.map((skill: string) => ({ skill, level: 'Familiar', required: false })) || []),
      ],
      generatedBenefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Flexible work arrangements',
        'Professional development budget',
        'Generous PTO policy',
      ],
      generatedQualifications: [
        `${yearsExperience || '3+'}+ years of experience in ${jobTitle.toLowerCase()} or related role`,
        educationLevel ? `${educationLevel} degree in a relevant field` : 'Relevant educational background',
        `Strong proficiency in ${requiredSkills.slice(0, 3).join(', ')}`,
        'Excellent communication and collaboration skills',
      ],
    };

    const fullDescription = `
# ${generatedContent.generatedTitle}

## About the Role
${generatedContent.generatedSummary}

## Responsibilities
${generatedContent.generatedResponsibilities.map(r => `- ${r}`).join('\n')}

## Requirements
${generatedContent.generatedQualifications.map(q => `- ${q}`).join('\n')}

## Nice to Have
${preferredSkills?.map((s: string) => `- Experience with ${s}`).join('\n') || ''}

## Benefits
${generatedContent.generatedBenefits.map(b => `- ${b}`).join('\n')}
    `.trim();

    const generated = await prisma.generatedJobDescription.create({
      data: {
        companyId,
        createdById: userId,
        jobTitle,
        department,
        seniorityLevel,
        employmentType,
        workMode,
        location,
        requiredSkills,
        preferredSkills,
        yearsExperience,
        educationLevel,
        companyDescription,
        teamSize,
        reportingTo,
        generatedTitle: generatedContent.generatedTitle,
        generatedSummary: generatedContent.generatedSummary,
        generatedResponsibilities: generatedContent.generatedResponsibilities,
        generatedRequirements: generatedContent.generatedRequirements,
        generatedBenefits: generatedContent.generatedBenefits,
        generatedQualifications: generatedContent.generatedQualifications,
        fullDescription,
        modelVersion: 'gpt-4-turbo-preview',
        promptTokens: 850,
        completionTokens: 1200,
        generationTimeMs: 2500,
        confidenceScore: 0.92,
        readabilityScore: 85,
        inclusivityScore: 88,
        seoScore: 82,
        completenessScore: 90,
        status: 'DRAFT',
      },
    });

    res.json(generated);
  } catch (error) {
    console.error('Generate job description error:', error);
    res.status(500).json({ error: 'Failed to generate job description' });
  }
};

// Get generated job descriptions
export const getGeneratedJobDescriptions = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const { status, page = 1, limit = 20 } = req.query;

    const where: any = { companyId };
    if (status) where.status = status;

    const [descriptions, total] = await Promise.all([
      prisma.generatedJobDescription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.generatedJobDescription.count({ where }),
    ]);

    res.json({
      descriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get generated job descriptions error:', error);
    res.status(500).json({ error: 'Failed to get job descriptions' });
  }
};

// Get a specific generated job description
export const getJobDescriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user?.companyId;

    const description = await prisma.generatedJobDescription.findFirst({
      where: { id, companyId },
    });

    if (!description) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    res.json(description);
  } catch (error) {
    console.error('Get job description error:', error);
    res.status(500).json({ error: 'Failed to get job description' });
  }
};

// Update job description status
export const updateJobDescriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = (req as any).user?.companyId;

    const updated = await prisma.generatedJobDescription.updateMany({
      where: { id, companyId },
      data: { status },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    res.json({ success: true, status });
  } catch (error) {
    console.error('Update job description status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// ============================================
// 2.2.2 - JOB TITLE OPTIMIZER
// ============================================

// Optimize a job title
export const optimizeJobTitle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;
    const { originalTitle, industry, targetAudience } = req.body;

    // Simulate AI title optimization
    const suggestions = [
      {
        title: originalTitle.replace(/Developer/gi, 'Engineer'),
        seoScore: 92,
        inclusivityScore: 95,
        clarityScore: 88,
        industryMatch: 90,
        reasoning: 'Engineer is more widely searched and gender-neutral',
      },
      {
        title: `${originalTitle} (Remote)`,
        seoScore: 95,
        inclusivityScore: 90,
        clarityScore: 92,
        industryMatch: 85,
        reasoning: 'Adding remote indicator increases search visibility',
      },
      {
        title: originalTitle.replace(/Sr\.|Sr /gi, 'Senior '),
        seoScore: 88,
        inclusivityScore: 92,
        clarityScore: 95,
        industryMatch: 88,
        reasoning: 'Spelled out seniority level is clearer and more professional',
      },
    ];

    const recommendation = suggestions.reduce((best, current) =>
      (current.seoScore + current.inclusivityScore) > (best.seoScore + best.inclusivityScore) ? current : best
    );

    const titleSuggestion = await prisma.jobTitleSuggestion.create({
      data: {
        originalTitle,
        companyId,
        createdById: userId,
        suggestions,
        recommendedTitle: recommendation.title,
        recommendationReason: recommendation.reasoning,
        originalTitleIssues: [
          { issue: 'Could be more SEO-friendly', severity: 'low' },
        ],
        keywordAnalysis: {
          topKeywords: ['software', 'engineer', 'developer', 'full-stack'],
          searchVolume: { high: ['engineer'], medium: ['developer'], low: ['programmer'] },
        },
        competitorTitles: [
          'Software Engineer',
          'Full Stack Developer',
          'Senior Software Engineer',
        ],
        industryTrends: {
          rising: ['Platform Engineer', 'AI/ML Engineer'],
          stable: ['Software Engineer', 'Full Stack Developer'],
          declining: ['Programmer', 'Coder'],
        },
        originalSeoScore: 78,
        originalInclusivityScore: 82,
        improvedSeoScore: recommendation.seoScore,
        improvedInclusivityScore: recommendation.inclusivityScore,
        modelVersion: 'gpt-4-turbo-preview',
      },
    });

    res.json(titleSuggestion);
  } catch (error) {
    console.error('Optimize job title error:', error);
    res.status(500).json({ error: 'Failed to optimize job title' });
  }
};

// Get title suggestions history
export const getTitleSuggestions = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;

    const suggestions = await prisma.jobTitleSuggestion.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Get title suggestions error:', error);
    res.status(500).json({ error: 'Failed to get title suggestions' });
  }
};

// ============================================
// 2.2.3 - REQUIREMENTS ANALYZER
// ============================================

// Analyze job requirements
export const analyzeRequirements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;
    const { rawRequirements, jobTitle, industry, jobDescriptionId } = req.body;

    // Simulate AI requirements analysis
    const requirements = rawRequirements.split('\n').filter((r: string) => r.trim());

    const essentialRequirements = requirements.slice(0, Math.ceil(requirements.length * 0.6)).map((r: string, i: number) => ({
      requirement: r.trim(),
      importance: 'CRITICAL',
      category: i < 2 ? 'TECHNICAL' : 'EXPERIENCE',
      reasoning: 'Core skill required for day-to-day responsibilities',
    }));

    const niceToHaveRequirements = requirements.slice(Math.ceil(requirements.length * 0.6)).map((r: string) => ({
      requirement: r.trim(),
      importance: 'PREFERRED',
      category: 'NICE_TO_HAVE',
      reasoning: 'Would be beneficial but not essential for the role',
    }));

    const analysis = await prisma.requirementsAnalysis.create({
      data: {
        jobDescriptionId,
        companyId,
        createdById: userId,
        rawRequirements,
        jobTitle,
        industry,
        essentialRequirements,
        niceToHaveRequirements,
        technicalSkills: essentialRequirements.filter((r: any) => r.category === 'TECHNICAL'),
        softSkills: [
          { skill: 'Communication', importance: 'HIGH' },
          { skill: 'Problem-solving', importance: 'HIGH' },
          { skill: 'Teamwork', importance: 'MEDIUM' },
        ],
        educationRequirements: [
          { level: 'BACHELORS', field: 'Computer Science or related', required: false },
        ],
        experienceRequirements: [
          { years: '3-5', type: 'relevant experience', required: true },
        ],
        overlyRestrictive: [
          { requirement: 'Must have 10+ years experience', issue: 'May exclude qualified candidates with less traditional backgrounds' },
        ],
        potentiallyBiased: [],
        marketMismatch: [
          { requirement: 'Expert in all listed technologies', issue: 'Combination rarely found in single candidate' },
        ],
        recommendations: [
          'Consider reducing years of experience requirement',
          'Separate "nice to have" skills more clearly',
          'Add information about learning opportunities',
        ],
        essentialCount: essentialRequirements.length,
        niceToHaveCount: niceToHaveRequirements.length,
        restrictiveScore: 35,
        marketAlignmentScore: 72,
        modelVersion: 'gpt-4-turbo-preview',
      },
    });

    res.json(analysis);
  } catch (error) {
    console.error('Analyze requirements error:', error);
    res.status(500).json({ error: 'Failed to analyze requirements' });
  }
};

// Get requirements analysis by ID
export const getRequirementsAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user?.companyId;

    const analysis = await prisma.requirementsAnalysis.findFirst({
      where: { id, companyId },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get requirements analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
};

// ============================================
// 2.2.4 - INCLUSIVE LANGUAGE CHECKER
// ============================================

// Check content for inclusive language
export const checkInclusiveLanguage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;
    const { content, contentType = 'JOB_DESCRIPTION' } = req.body;

    // Simulate inclusive language analysis
    const biasedPhrases = [
      { phrase: 'rockstar', issue: 'Gendered/aggressive language', severity: 'MODERATE', category: 'gender', suggestion: 'talented professional' },
      { phrase: 'ninja', issue: 'Culturally appropriative', severity: 'MODERATE', category: 'cultural', suggestion: 'expert' },
      { phrase: 'young and energetic', issue: 'Age discrimination', severity: 'SEVERE', category: 'age', suggestion: 'motivated and enthusiastic' },
      { phrase: 'manpower', issue: 'Gender-coded language', severity: 'MODERATE', category: 'gender', suggestion: 'workforce' },
      { phrase: 'chairman', issue: 'Gender-coded language', severity: 'MODERATE', category: 'gender', suggestion: 'chairperson' },
    ];

    const foundIssues = biasedPhrases.filter(bp =>
      content.toLowerCase().includes(bp.phrase.toLowerCase())
    ).map(bp => ({
      ...bp,
      startIndex: content.toLowerCase().indexOf(bp.phrase.toLowerCase()),
      endIndex: content.toLowerCase().indexOf(bp.phrase.toLowerCase()) + bp.phrase.length,
    }));

    const severeCount = foundIssues.filter(i => i.severity === 'SEVERE').length;
    const moderateCount = foundIssues.filter(i => i.severity === 'MODERATE').length;
    const minorCount = foundIssues.filter(i => i.severity === 'MINOR').length;

    const overallScore = Math.max(0, 100 - (severeCount * 20) - (moderateCount * 10) - (minorCount * 5));
    const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F';

    // Generate suggested content
    let suggestedContent = content;
    foundIssues.forEach(issue => {
      suggestedContent = suggestedContent.replace(new RegExp(issue.phrase, 'gi'), issue.suggestion);
    });

    const check = await prisma.inclusiveLanguageCheck.create({
      data: {
        companyId,
        createdById: userId,
        contentType,
        originalContent: content,
        overallScore,
        grade,
        issues: foundIssues,
        genderBiasIssues: foundIssues.filter(i => i.category === 'gender'),
        ageBiasIssues: foundIssues.filter(i => i.category === 'age'),
        abilityBiasIssues: foundIssues.filter(i => i.category === 'ability'),
        culturalBiasIssues: foundIssues.filter(i => i.category === 'cultural'),
        educationBiasIssues: foundIssues.filter(i => i.category === 'education'),
        socioeconomicBiasIssues: foundIssues.filter(i => i.category === 'socioeconomic'),
        suggestedContent: foundIssues.length > 0 ? suggestedContent : null,
        alternativePhrases: foundIssues.map(i => ({
          original: i.phrase,
          suggested: i.suggestion,
          reason: i.issue,
        })),
        issueCount: foundIssues.length,
        severeIssueCount: severeCount,
        moderateIssueCount: moderateCount,
        minorIssueCount: minorCount,
        toneAnalysis: {
          formal: 0.7,
          friendly: 0.6,
          professional: 0.8,
          inclusive: overallScore / 100,
        },
        readabilityLevel: 'Grade 10',
        wordCount: content.split(/\s+/).length,
        modelVersion: 'gpt-4-turbo-preview',
        processingTimeMs: 450,
      },
    });

    res.json(check);
  } catch (error) {
    console.error('Check inclusive language error:', error);
    res.status(500).json({ error: 'Failed to check language' });
  }
};

// Get inclusive language check history
export const getInclusiveLanguageChecks = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const { contentType, page = 1, limit = 20 } = req.query;

    const where: any = { companyId };
    if (contentType) where.contentType = contentType;

    const [checks, total] = await Promise.all([
      prisma.inclusiveLanguageCheck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.inclusiveLanguageCheck.count({ where }),
    ]);

    res.json({
      checks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get inclusive language checks error:', error);
    res.status(500).json({ error: 'Failed to get checks' });
  }
};

// ============================================
// 2.2.5 - SALARY RANGE SUGGESTER
// ============================================

// Get salary range suggestion
export const getSalaryRangeSuggestion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;

    const {
      jobTitle,
      location,
      country,
      state,
      city,
      seniorityLevel,
      yearsExperience,
      requiredSkills,
      industry,
      companySize,
      employmentType = 'FULL_TIME',
    } = req.body;

    // Simulate salary calculation based on market data
    const baseSalaries: Record<string, Record<string, number>> = {
      'ENTRY': { min: 50000, mid: 65000, max: 80000 },
      'MID': { min: 75000, mid: 95000, max: 120000 },
      'SENIOR': { min: 110000, mid: 140000, max: 180000 },
      'LEAD': { min: 140000, mid: 175000, max: 220000 },
      'EXECUTIVE': { min: 180000, mid: 250000, max: 350000 },
    };

    const base = baseSalaries[seniorityLevel] || baseSalaries['MID'];

    // Location adjustment
    const locationMultipliers: Record<string, number> = {
      'San Francisco': 1.4,
      'New York': 1.35,
      'Seattle': 1.25,
      'Austin': 1.1,
      'Denver': 1.05,
      'Remote': 1.0,
    };
    const locationMult = locationMultipliers[city || 'Remote'] || 1.0;

    // Company size adjustment
    const sizeMultipliers: Record<string, number> = {
      'STARTUP': 0.9,
      'SMALL': 0.95,
      'MEDIUM': 1.0,
      'LARGE': 1.1,
      'ENTERPRISE': 1.15,
    };
    const sizeMult = sizeMultipliers[companySize || 'MEDIUM'] || 1.0;

    const suggestedMin = Math.round(base.min * locationMult * sizeMult);
    const suggestedMax = Math.round(base.max * locationMult * sizeMult);
    const suggestedMidpoint = Math.round(base.mid * locationMult * sizeMult);

    const suggestion = await prisma.salaryRangeSuggestion.create({
      data: {
        companyId,
        createdById: userId,
        jobTitle,
        normalizedTitle: jobTitle.toLowerCase().replace(/\s+/g, '_'),
        location: location || `${city}, ${state}, ${country}`,
        country,
        state,
        city,
        seniorityLevel,
        yearsExperience,
        requiredSkills,
        industry,
        companySize,
        employmentType,
        currency: 'USD',
        suggestedMin,
        suggestedMax,
        suggestedMidpoint,
        confidenceLevel: 'HIGH',
        confidenceScore: 85,
        marketPercentile25: suggestedMin * 0.85,
        marketMedian: suggestedMidpoint,
        marketPercentile75: suggestedMax * 0.95,
        marketPercentile90: suggestedMax * 1.15,
        industryComparison: 'AT_MARKET',
        locationComparison: locationMult > 1.1 ? 'ABOVE_MARKET' : 'AT_MARKET',
        companyComparison: 'AT_MARKET',
        salaryFactors: [
          { factor: 'Location', impact: `${((locationMult - 1) * 100).toFixed(0)}%`, description: `${city || location} market adjustment` },
          { factor: 'Company Size', impact: `${((sizeMult - 1) * 100).toFixed(0)}%`, description: `${companySize} company adjustment` },
          { factor: 'Seniority', impact: 'Base', description: `${seniorityLevel} level compensation` },
        ],
        skillPremiums: requiredSkills?.slice(0, 3).map((skill: string) => ({
          skill,
          premium: Math.round(Math.random() * 10) + 5,
        })),
        locationAdjustment: (locationMult - 1) * 100,
        recommendations: [
          suggestedMidpoint > 100000 ? 'Consider offering equity to remain competitive' : null,
          'Include signing bonus for senior hires',
          'Highlight non-monetary benefits in job posting',
        ].filter(Boolean),
        competitivenessScore: 78,
        dataSources: ['BLS', 'Glassdoor', 'Levels.fyi', 'LinkedIn Salary Insights'],
        dataFreshness: 'Q4 2024',
        sampleSize: 1250,
        modelVersion: 'salary-model-v2',
      },
    });

    res.json(suggestion);
  } catch (error) {
    console.error('Get salary range suggestion error:', error);
    res.status(500).json({ error: 'Failed to get salary suggestion' });
  }
};

// Get salary suggestions history
export const getSalaryRangeSuggestions = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;

    const suggestions = await prisma.salaryRangeSuggestion.findMany({
      where: { companyId },
      orderBy: { calculatedAt: 'desc' },
      take: 50,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Get salary suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

// ============================================
// 2.2.6 - INTERVIEW QUESTIONS GENERATOR
// ============================================

// Generate interview questions
export const generateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const companyId = (req as any).user?.companyId;

    const {
      jobTitle,
      seniorityLevel,
      department,
      requiredSkills,
      competencies,
      interviewRound = 'TECHNICAL',
      interviewDuration = 60,
      jobId,
    } = req.body;

    // Generate questions based on parameters
    const technicalQuestions = requiredSkills?.slice(0, 3).map((skill: string) => ({
      question: `Can you describe a complex project where you used ${skill}? What challenges did you face?`,
      category: 'TECHNICAL',
      skill,
      difficulty: 'MEDIUM',
      expectedDuration: 5,
      evaluationCriteria: ['Depth of knowledge', 'Problem-solving approach', 'Communication clarity'],
      followUps: [
        'What would you do differently now?',
        'How did you measure success?',
      ],
      redFlags: ['Cannot provide specific examples', 'Blames others for failures'],
      greenFlags: ['Provides detailed technical explanation', 'Shows learning mindset'],
    })) || [];

    const behavioralQuestions = [
      {
        question: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
        category: 'BEHAVIORAL',
        skill: 'Collaboration',
        difficulty: 'MEDIUM',
        expectedDuration: 5,
        evaluationCriteria: ['Empathy', 'Conflict resolution', 'Outcome focus'],
        followUps: ['What did you learn from this experience?'],
        redFlags: ['Speaks negatively about colleagues', 'No resolution achieved'],
        greenFlags: ['Shows emotional intelligence', 'Focuses on solutions'],
      },
      {
        question: 'Describe a situation where you had to meet a tight deadline. How did you prioritize your work?',
        category: 'BEHAVIORAL',
        skill: 'Time Management',
        difficulty: 'MEDIUM',
        expectedDuration: 5,
        evaluationCriteria: ['Prioritization skills', 'Stress management', 'Delivery focus'],
        followUps: ['Would you approach it differently today?'],
        redFlags: ['Missed the deadline without explanation', 'Poor planning evident'],
        greenFlags: ['Clear prioritization framework', 'Proactive communication'],
      },
    ];

    const situationalQuestions = [
      {
        question: `If you joined our team and discovered a significant bug in production, what would be your first steps?`,
        category: 'SITUATIONAL',
        skill: 'Problem Solving',
        difficulty: 'HARD',
        expectedDuration: 5,
        evaluationCriteria: ['Systematic approach', 'Communication', 'Technical judgment'],
        followUps: ['How would you prevent similar issues in the future?'],
        redFlags: ['No mention of communication', 'Panic response'],
        greenFlags: ['Structured approach', 'Stakeholder awareness'],
      },
    ];

    const cultureFitQuestions = [
      {
        question: 'What type of work environment helps you do your best work?',
        category: 'CULTURE_FIT',
        skill: 'Self-awareness',
        difficulty: 'EASY',
        expectedDuration: 3,
        evaluationCriteria: ['Self-awareness', 'Alignment with company culture'],
        redFlags: ['Conflicting preferences', 'Unrealistic expectations'],
        greenFlags: ['Alignment with company values', 'Flexibility'],
      },
    ];

    const leadershipQuestions = seniorityLevel === 'LEAD' || seniorityLevel === 'EXECUTIVE' ? [
      {
        question: 'How do you approach mentoring junior team members?',
        category: 'LEADERSHIP',
        skill: 'Mentorship',
        difficulty: 'MEDIUM',
        expectedDuration: 5,
        evaluationCriteria: ['Mentoring approach', 'Investment in team growth'],
        redFlags: ['No interest in developing others'],
        greenFlags: ['Specific examples of successful mentoring'],
      },
    ] : [];

    const allQuestions = [
      ...technicalQuestions,
      ...behavioralQuestions,
      ...situationalQuestions,
      ...cultureFitQuestions,
      ...leadershipQuestions,
    ];

    const generated = await prisma.generatedInterviewQuestions.create({
      data: {
        companyId,
        createdById: userId,
        jobId,
        jobTitle,
        seniorityLevel,
        department,
        requiredSkills,
        competencies,
        interviewRound,
        interviewDuration,
        questions: allQuestions,
        technicalQuestions,
        behavioralQuestions,
        situationalQuestions,
        cultureFitQuestions,
        leadershipQuestions: leadershipQuestions.length > 0 ? leadershipQuestions : null,
        totalQuestions: allQuestions.length,
        estimatedDuration: allQuestions.reduce((sum, q) => sum + (q.expectedDuration || 5), 0),
        difficultyDistribution: {
          easy: allQuestions.filter(q => q.difficulty === 'EASY').length,
          medium: allQuestions.filter(q => q.difficulty === 'MEDIUM').length,
          hard: allQuestions.filter(q => q.difficulty === 'HARD').length,
        },
        scoringRubric: {
          1: 'Does not meet expectations',
          2: 'Partially meets expectations',
          3: 'Meets expectations',
          4: 'Exceeds expectations',
          5: 'Exceptional',
        },
        mustAskQuestions: allQuestions.slice(0, 3).map(q => q.question),
        optionalQuestions: allQuestions.slice(3).map(q => q.question),
        legalCompliance: true,
        complianceNotes: [
          'Avoid questions about age, marital status, religion, or protected characteristics',
          'Focus on job-related competencies only',
        ],
        avoidedTopics: ['salary history', 'family planning', 'age', 'religion', 'political affiliation'],
        modelVersion: 'gpt-4-turbo-preview',
      },
    });

    res.json(generated);
  } catch (error) {
    console.error('Generate interview questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

// Get generated interview questions
export const getInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const { jobId, interviewRound } = req.query;

    const where: any = { companyId };
    if (jobId) where.jobId = jobId;
    if (interviewRound) where.interviewRound = interviewRound;

    const questions = await prisma.generatedInterviewQuestions.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(questions);
  } catch (error) {
    console.error('Get interview questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

// Get interview questions by ID
export const getInterviewQuestionsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user?.companyId;

    const questions = await prisma.generatedInterviewQuestions.findFirst({
      where: { id, companyId },
    });

    if (!questions) {
      return res.status(404).json({ error: 'Questions not found' });
    }

    res.json(questions);
  } catch (error) {
    console.error('Get interview questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

// Rate interview questions
export const rateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const companyId = (req as any).user?.companyId;

    const existing = await prisma.generatedInterviewQuestions.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Questions not found' });
    }

    const currentFeedback = (existing.feedback as any[]) || [];
    const newFeedback = [...currentFeedback, { rating, feedback, date: new Date() }];
    const averageRating = newFeedback.reduce((sum, f) => sum + f.rating, 0) / newFeedback.length;

    await prisma.generatedInterviewQuestions.update({
      where: { id },
      data: {
        timesUsed: { increment: 1 },
        averageRating,
        feedback: newFeedback,
      },
    });

    res.json({ success: true, averageRating });
  } catch (error) {
    console.error('Rate interview questions error:', error);
    res.status(500).json({ error: 'Failed to rate questions' });
  }
};
