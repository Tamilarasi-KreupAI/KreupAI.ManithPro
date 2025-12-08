import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 2.3.1 - AI Profile Enhancer
// ============================================

export const enhanceProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { profileSection, currentContent } = req.body;

    // Simulate AI analysis of the profile section
    const analysisResults = {
      wordCount: currentContent.split(' ').length,
      sentenceCount: currentContent.split(/[.!?]+/).length - 1,
      hasMetrics: /\d+%|\$[\d,]+|\d+ years?/i.test(currentContent),
      hasActionVerbs: /led|managed|developed|created|implemented|improved|increased|reduced/i.test(currentContent),
      readabilityScore: 72,
      toneAnalysis: 'Professional',
    };

    const suggestions = [
      {
        type: 'ADD_METRICS',
        suggestion: 'Add quantifiable achievements (percentages, dollar amounts, team sizes)',
        priority: 'HIGH',
        example: 'e.g., "Increased revenue by 25%" instead of "Improved revenue"',
      },
      {
        type: 'STRONGER_VERBS',
        suggestion: 'Use stronger action verbs at the beginning of bullets',
        priority: 'MEDIUM',
        example: 'e.g., "Spearheaded" instead of "Worked on"',
      },
      {
        type: 'KEYWORDS',
        suggestion: 'Include industry-specific keywords for ATS optimization',
        priority: 'HIGH',
        keywords: ['agile', 'cross-functional', 'stakeholder management'],
      },
      {
        type: 'CLARITY',
        suggestion: 'Break longer sentences into shorter, impactful statements',
        priority: 'MEDIUM',
      },
    ];

    const enhancedContent = `${currentContent}\n\n[AI Enhanced Version]\n• Led cross-functional team initiatives resulting in measurable business outcomes\n• Implemented data-driven strategies that improved key performance metrics\n• Collaborated with stakeholders to deliver projects on time and within budget`;

    const keyImprovements = [
      'Added quantifiable metrics',
      'Strengthened action verbs',
      'Included ATS-friendly keywords',
      'Improved sentence structure',
    ];

    const enhancement = await prisma.profileEnhancement.create({
      data: {
        userId,
        profileSection,
        currentContent,
        analysisResults,
        suggestions,
        enhancedContent,
        keyImprovements,
        originalScore: 65,
        potentialScore: 88,
        improvementPercentage: 35.4,
        clarityImprovements: ['Shortened complex sentences', 'Added clear structure'],
        impactImprovements: ['Added metrics', 'Quantified achievements'],
        keywordImprovements: ['Added ATS keywords', 'Industry terms included'],
        formattingImprovements: ['Bullet point structure', 'Consistent formatting'],
        modelVersion: 'profile-enhancer-v1.0',
        status: 'GENERATED',
      },
    });

    res.status(201).json(enhancement);
  } catch (error) {
    console.error('Error enhancing profile:', error);
    res.status(500).json({ error: 'Failed to enhance profile section' });
  }
};

export const getProfileEnhancements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { section, status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (section) where.profileSection = section;
    if (status) where.status = status;

    const [enhancements, total] = await Promise.all([
      prisma.profileEnhancement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.profileEnhancement.count({ where }),
    ]);

    res.json({ enhancements, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching profile enhancements:', error);
    res.status(500).json({ error: 'Failed to fetch profile enhancements' });
  }
};

export const applyEnhancement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const enhancement = await prisma.profileEnhancement.update({
      where: { id, userId },
      data: {
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });

    res.json(enhancement);
  } catch (error) {
    console.error('Error applying enhancement:', error);
    res.status(500).json({ error: 'Failed to apply enhancement' });
  }
};

// ============================================
// 2.3.2 - Experience Description Generator
// ============================================

export const generateExperienceDescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      jobTitle,
      companyName,
      industry,
      duration,
      responsibilities,
      technologies,
      achievements,
    } = req.body;

    // Simulate AI-generated content
    const generatedSummary = `As a ${jobTitle} at ${companyName}, led strategic initiatives and delivered high-impact results in a ${industry || 'dynamic'} environment over ${duration || 'the tenure'}. Demonstrated expertise in ${technologies?.slice(0, 3).join(', ') || 'key technologies'} while driving measurable business outcomes.`;

    const generatedBullets = [
      `Led development of scalable solutions using ${technologies?.[0] || 'modern technologies'}, improving system performance by 40%`,
      `Collaborated with cross-functional teams to deliver projects 20% ahead of schedule`,
      `Mentored junior team members, resulting in 30% improvement in team velocity`,
      `Implemented best practices that reduced technical debt by 25%`,
      `Drove adoption of agile methodologies, increasing sprint completion rate to 95%`,
    ];

    const impactStatements = [
      { metric: '40% performance improvement', category: 'TECHNICAL' },
      { metric: '20% faster delivery', category: 'EFFICIENCY' },
      { metric: '30% team velocity increase', category: 'LEADERSHIP' },
      { metric: '25% technical debt reduction', category: 'QUALITY' },
    ];

    const skillsHighlighted = technologies || ['Leadership', 'Problem Solving', 'Technical Excellence'];

    const description = await prisma.experienceDescription.create({
      data: {
        userId,
        jobTitle,
        companyName,
        industry,
        duration,
        responsibilities: responsibilities || [],
        technologies: technologies || [],
        achievements: achievements || [],
        generatedSummary,
        generatedBullets,
        impactStatements,
        skillsHighlighted,
        variations: {
          concise: generatedBullets.slice(0, 3),
          detailed: generatedBullets,
          technical: generatedBullets.map(b => b + ' [Technical focus]'),
        },
        toneOptions: {
          professional: generatedSummary,
          casual: generatedSummary.replace('strategic initiatives', 'cool projects'),
          technical: generatedSummary + ' Specialized in system architecture and optimization.',
        },
        atsKeywords: ['leadership', 'agile', 'cross-functional', 'scalable', 'performance'],
        industryTerms: industry ? [`${industry} expertise`, `${industry} best practices`] : [],
        actionVerbs: ['Led', 'Collaborated', 'Mentored', 'Implemented', 'Drove'],
        impactScore: 85,
        clarityScore: 88,
        atsScore: 92,
        modelVersion: 'exp-generator-v1.0',
        status: 'GENERATED',
      },
    });

    res.status(201).json(description);
  } catch (error) {
    console.error('Error generating experience description:', error);
    res.status(500).json({ error: 'Failed to generate experience description' });
  }
};

export const getExperienceDescriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const [descriptions, total] = await Promise.all([
      prisma.experienceDescription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.experienceDescription.count({ where: { userId } }),
    ]);

    res.json({ descriptions, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching experience descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch experience descriptions' });
  }
};

// ============================================
// 2.3.3 - Skills Gap Identifier
// ============================================

export const analyzeSkillsGap = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { targetJobId, targetJobTitle, targetIndustry, targetSeniority, currentSkills } = req.body;

    // Simulate skills gap analysis
    const requiredSkills = [
      { skill: 'TypeScript', level: 'Advanced', category: 'TECHNICAL' },
      { skill: 'React', level: 'Advanced', category: 'TECHNICAL' },
      { skill: 'Node.js', level: 'Intermediate', category: 'TECHNICAL' },
      { skill: 'System Design', level: 'Intermediate', category: 'TECHNICAL' },
      { skill: 'Leadership', level: 'Intermediate', category: 'SOFT_SKILL' },
      { skill: 'Communication', level: 'Advanced', category: 'SOFT_SKILL' },
    ];

    const currentSkillsList = currentSkills || ['JavaScript', 'React', 'HTML', 'CSS'];
    const missingSkills = requiredSkills.filter(
      rs => !currentSkillsList.some((cs: string) => cs.toLowerCase().includes(rs.skill.toLowerCase()))
    );

    const skillLevels = currentSkillsList.reduce((acc: any, skill: string) => {
      acc[skill] = Math.floor(Math.random() * 4) + 6; // Random level 6-10
      return acc;
    }, {});

    const analysis = await prisma.skillsGapAnalysis.create({
      data: {
        userId,
        targetJobId,
        targetJobTitle,
        targetIndustry,
        targetSeniority,
        currentSkills: currentSkillsList,
        skillLevels,
        requiredSkills,
        missingSkills,
        underDevelopedSkills: [
          { skill: 'System Design', currentLevel: 4, requiredLevel: 7 },
          { skill: 'TypeScript', currentLevel: 5, requiredLevel: 8 },
        ],
        transferableSkills: [
          { skill: 'JavaScript', transfersTo: 'TypeScript', transferability: 80 },
          { skill: 'Problem Solving', transfersTo: 'System Design', transferability: 60 },
        ],
        criticalGaps: missingSkills.filter((s: any) => s.level === 'Advanced'),
        importantGaps: missingSkills.filter((s: any) => s.level === 'Intermediate'),
        niceToHaveGaps: [],
        learningPath: [
          { step: 1, skill: 'TypeScript', duration: '4 weeks', priority: 'HIGH' },
          { step: 2, skill: 'Node.js', duration: '6 weeks', priority: 'HIGH' },
          { step: 3, skill: 'System Design', duration: '8 weeks', priority: 'MEDIUM' },
        ],
        resourceRecommendations: [
          { skill: 'TypeScript', resource: 'TypeScript Deep Dive', type: 'BOOK', url: 'https://basarat.gitbook.io/typescript/' },
          { skill: 'System Design', resource: 'System Design Primer', type: 'COURSE', url: 'https://github.com/donnemartin/system-design-primer' },
        ],
        timeEstimates: { total: '18 weeks', TypeScript: '4 weeks', 'Node.js': '6 weeks', 'System Design': '8 weeks' },
        priorityRanking: ['TypeScript', 'Node.js', 'System Design', 'Leadership'],
        marketDemand: {
          TypeScript: { demand: 'HIGH', growth: '+25%' },
          'System Design': { demand: 'HIGH', growth: '+30%' },
        },
        salaryImpact: {
          TypeScript: '+$10,000',
          'System Design': '+$15,000',
        },
        overallReadiness: 65,
        technicalReadiness: 60,
        softSkillReadiness: 75,
        experienceAlignment: 70,
        modelVersion: 'skills-gap-v1.0',
        status: 'ACTIVE',
      },
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error analyzing skills gap:', error);
    res.status(500).json({ error: 'Failed to analyze skills gap' });
  }
};

export const getSkillsGapAnalyses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const [analyses, total] = await Promise.all([
      prisma.skillsGapAnalysis.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.skillsGapAnalysis.count({ where }),
    ]);

    res.json({ analyses, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching skills gap analyses:', error);
    res.status(500).json({ error: 'Failed to fetch skills gap analyses' });
  }
};

// ============================================
// 2.3.4 - Cover Letter Generator
// ============================================

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      jobId,
      jobTitle,
      companyName,
      companyDescription,
      jobDescription,
      whyInterested,
      relevantExperience,
      keyAchievements,
      connectionToCompany,
    } = req.body;

    // Generate cover letter sections
    const opening = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${companyName}. ${whyInterested || `With my background in software development and passion for innovative solutions, I am excited about the opportunity to contribute to your team.`}`;

    const body = `Throughout my career, I have developed expertise that directly aligns with your requirements. ${relevantExperience?.length ? `Key highlights include: ${relevantExperience.join(', ')}.` : 'I have consistently delivered results that exceed expectations.'}\n\n${keyAchievements?.length ? `My notable achievements include: ${keyAchievements.join('; ')}.` : 'I have a proven track record of driving measurable business outcomes.'}\n\nI am particularly drawn to ${companyName}'s ${companyDescription ? 'commitment to ' + companyDescription.slice(0, 50) : 'innovative approach and culture of excellence'}. ${connectionToCompany || ''}`;

    const closing = `I would welcome the opportunity to discuss how my skills and experience can benefit ${companyName}. Thank you for considering my application. I look forward to the possibility of contributing to your team.\n\nSincerely,\n[Your Name]`;

    const fullLetter = `${opening}\n\n${body}\n\n${closing}`;

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        jobId,
        jobTitle,
        companyName,
        companyDescription,
        jobDescription,
        whyInterested,
        relevantExperience: relevantExperience || [],
        keyAchievements: keyAchievements || [],
        connectionToCompany,
        opening,
        body,
        closing,
        fullLetter,
        toneVariations: {
          formal: fullLetter,
          friendly: fullLetter.replace('Dear Hiring Manager', 'Hello'),
          enthusiastic: fullLetter.replace('strong interest', 'tremendous excitement'),
        },
        lengthVariations: {
          brief: `${opening}\n\n${closing}`,
          standard: fullLetter,
          detailed: fullLetter + '\n\n[Additional details about specific projects and contributions]',
        },
        keywordsUsed: ['expertise', 'results', 'innovative', 'track record', 'contribute'],
        skillsHighlighted: ['Problem Solving', 'Communication', 'Leadership'],
        achievementsMentioned: keyAchievements || ['Delivered high-impact projects', 'Exceeded performance targets'],
        relevanceScore: 85,
        persuasivenessScore: 82,
        professionalismScore: 90,
        atsScore: 88,
        modelVersion: 'cover-letter-v1.0',
        status: 'DRAFT',
      },
    });

    res.status(201).json(coverLetter);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};

export const getCoverLetters = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId, status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const [coverLetters, total] = await Promise.all([
      prisma.coverLetter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.coverLetter.count({ where }),
    ]);

    res.json({ coverLetters, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    res.status(500).json({ error: 'Failed to fetch cover letters' });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;

    const coverLetter = await prisma.coverLetter.update({
      where: { id, userId },
      data: updates,
    });

    res.json(coverLetter);
  } catch (error) {
    console.error('Error updating cover letter:', error);
    res.status(500).json({ error: 'Failed to update cover letter' });
  }
};

// ============================================
// 2.3.5 - Interview Prep Coach
// ============================================

export const generateInterviewPrep = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId, jobTitle, companyName, interviewType } = req.body;

    const commonQuestions = [
      { question: 'Tell me about yourself.', category: 'INTRODUCTION', difficulty: 'EASY' },
      { question: 'Why are you interested in this role?', category: 'MOTIVATION', difficulty: 'EASY' },
      { question: 'What are your greatest strengths?', category: 'SELF_ASSESSMENT', difficulty: 'MEDIUM' },
      { question: 'Describe a challenging project you worked on.', category: 'EXPERIENCE', difficulty: 'MEDIUM' },
      { question: 'Where do you see yourself in 5 years?', category: 'CAREER_GOALS', difficulty: 'MEDIUM' },
    ];

    const technicalQuestions = interviewType === 'TECHNICAL' ? [
      { question: 'Explain the difference between REST and GraphQL.', category: 'TECHNICAL', difficulty: 'MEDIUM' },
      { question: 'How would you design a scalable notification system?', category: 'SYSTEM_DESIGN', difficulty: 'HARD' },
      { question: 'What is your approach to debugging production issues?', category: 'TECHNICAL', difficulty: 'MEDIUM' },
    ] : [];

    const behavioralQuestions = [
      { question: 'Tell me about a time you had to deal with a difficult team member.', framework: 'STAR', category: 'TEAMWORK' },
      { question: 'Describe a situation where you had to meet a tight deadline.', framework: 'STAR', category: 'TIME_MANAGEMENT' },
      { question: 'Give an example of when you showed leadership.', framework: 'STAR', category: 'LEADERSHIP' },
    ];

    const prep = await prisma.interviewPrep.create({
      data: {
        userId,
        jobId,
        jobTitle,
        companyName,
        interviewType,
        companyInfo: {
          description: `${companyName} is a leading company in the industry`,
          culture: 'Innovation-driven, collaborative environment',
          values: ['Excellence', 'Integrity', 'Innovation'],
        },
        recentNews: [
          { headline: `${companyName} announces expansion plans`, date: '2024-01-15' },
        ],
        commonQuestions,
        technicalQuestions,
        behavioralQuestions,
        situationalQuestions: [
          { scenario: 'Your project deadline is moved up by two weeks. What do you do?', category: 'PROBLEM_SOLVING' },
        ],
        companySpecificQuestions: [
          { question: `What interests you most about working at ${companyName}?`, category: 'COMPANY_FIT' },
        ],
        sampleAnswers: {
          'Tell me about yourself': 'I am a [role] with [X] years of experience in [industry]. I specialize in [skills] and have a track record of [achievements]. I am excited about this opportunity because [connection to role].',
        },
        answerFrameworks: {
          STAR: { situation: 'Set the context', task: 'Describe your responsibility', action: 'Explain what you did', result: 'Share the outcome' },
          CAR: { challenge: 'Describe the challenge', action: 'What you did', result: 'The outcome' },
        },
        keyPointsToMention: ['Relevant experience', 'Quantifiable achievements', 'Alignment with company values'],
        thingsToAvoid: ['Negative comments about previous employers', 'Salary discussion too early', 'Lack of preparation'],
        questionsForInterviewer: [
          'What does success look like in this role?',
          'Can you describe the team I would be working with?',
          'What are the biggest challenges facing the team?',
          'How does the company support professional development?',
        ],
        questionsToAvoid: [
          'What does your company do?',
          'How soon can I take vacation?',
          'Will I have to work overtime?',
        ],
        preparationChecklist: [
          'Research the company thoroughly',
          'Review the job description',
          'Prepare STAR stories',
          'Practice common questions',
          'Prepare questions to ask',
          'Test your technology (for video interviews)',
        ],
        dayOfTips: [
          'Arrive 10-15 minutes early',
          'Bring copies of your resume',
          'Dress appropriately',
          'Maintain good eye contact',
          'Take a moment to think before answering',
        ],
        commonMistakes: [
          'Not researching the company',
          'Being too negative about past experiences',
          'Giving vague answers without examples',
          'Not asking questions',
        ],
        bodyLanguageTips: [
          'Maintain eye contact',
          'Sit up straight',
          'Use hand gestures naturally',
          'Smile genuinely',
        ],
        preparednessScore: 0,
        practiceSessionsCompleted: 0,
        modelVersion: 'interview-prep-v1.0',
        status: 'PREPARING',
      },
    });

    res.status(201).json(prep);
  } catch (error) {
    console.error('Error generating interview prep:', error);
    res.status(500).json({ error: 'Failed to generate interview prep' });
  }
};

export const getInterviewPreps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { jobId, status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const [preps, total] = await Promise.all([
      prisma.interviewPrep.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.interviewPrep.count({ where }),
    ]);

    res.json({ preps, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching interview preps:', error);
    res.status(500).json({ error: 'Failed to fetch interview preps' });
  }
};

export const recordPracticeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { answers, feedback } = req.body;

    const prep = await prisma.interviewPrep.findUnique({ where: { id, userId } });
    if (!prep) {
      return res.status(404).json({ error: 'Interview prep not found' });
    }

    const practiceHistory = (prep.practiceHistory as any[]) || [];
    practiceHistory.push({
      date: new Date(),
      answers,
      feedback,
    });

    const feedbackHistory = (prep.feedbackHistory as any[]) || [];
    feedbackHistory.push(feedback);

    const updatedPrep = await prisma.interviewPrep.update({
      where: { id },
      data: {
        practiceHistory,
        feedbackHistory,
        practiceSessionsCompleted: prep.practiceSessionsCompleted + 1,
        preparednessScore: Math.min(100, (prep.preparednessScore || 0) + 10),
        estimatedConfidence: Math.min(100, (prep.estimatedConfidence || 0) + 8),
      },
    });

    res.json(updatedPrep);
  } catch (error) {
    console.error('Error recording practice session:', error);
    res.status(500).json({ error: 'Failed to record practice session' });
  }
};

// ============================================
// 2.3.6 - Salary Negotiation Advisor
// ============================================

export const getSalaryAdvice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      jobId,
      jobTitle,
      companyName,
      location,
      industry,
      currentSalary,
      yearsExperience,
      offeredSalary,
      offeredBonus,
      offeredEquity,
      offeredBenefits,
    } = req.body;

    // Simulate market data analysis
    const marketMin = offeredSalary ? offeredSalary * 0.85 : 80000;
    const marketMax = offeredSalary ? offeredSalary * 1.25 : 150000;
    const marketMedian = (marketMin + marketMax) / 2;

    const percentilePosition = offeredSalary
      ? ((offeredSalary - marketMin) / (marketMax - marketMin)) * 100
      : 50;

    const targetSalary = offeredSalary ? offeredSalary * 1.15 : marketMedian * 1.1;
    const minimumAcceptable = offeredSalary ? offeredSalary * 1.05 : marketMedian * 0.95;
    const anchorNumber = offeredSalary ? offeredSalary * 1.2 : marketMedian * 1.15;

    const advice = await prisma.salaryNegotiationAdvice.create({
      data: {
        userId,
        jobId,
        jobTitle,
        companyName,
        location,
        industry,
        currentSalary,
        yearsExperience,
        offeredSalary,
        offeredBonus,
        offeredEquity: offeredEquity || {},
        offeredBenefits: offeredBenefits || [],
        marketData: {
          minimum: marketMin,
          maximum: marketMax,
          median: marketMedian,
          percentile25: marketMin + (marketMax - marketMin) * 0.25,
          percentile75: marketMin + (marketMax - marketMin) * 0.75,
          percentile90: marketMin + (marketMax - marketMin) * 0.9,
        },
        percentilePosition,
        marketTrend: 'RISING',
        demandLevel: 'HIGH',
        targetSalary,
        minimumAcceptable,
        anchorNumber,
        negotiationRange: { min: minimumAcceptable, max: anchorNumber, target: targetSalary },
        negotiationScript: {
          opener: `Thank you for the offer. I'm very excited about this opportunity at ${companyName}. Based on my research and experience, I was hoping we could discuss the compensation package.`,
          valueProposition: `With my ${yearsExperience} years of experience and track record of [achievements], I believe I can bring significant value to the team.`,
          ask: `Based on market data for ${jobTitle} roles in ${location}, I was hoping for a base salary closer to $${Math.round(targetSalary).toLocaleString()}.`,
          closing: `I'm committed to making this work and am confident we can find a mutually beneficial arrangement.`,
        },
        counterArguments: {
          'budget constraints': 'I understand budget considerations. Could we explore a signing bonus or accelerated review timeline?',
          'standard offer': 'I appreciate the standard package, but my unique experience in [area] warrants additional consideration.',
          'need to check': 'I understand. I am available to discuss further once you have consulted with the team.',
        },
        timingAdvice: {
          when: 'After receiving written offer, before accepting',
          deadline: 'Aim to negotiate within 2-3 days of receiving offer',
          bestTime: 'Tuesday-Thursday, mid-morning',
        },
        leveragePoints: [
          'Multiple years of relevant experience',
          'Specialized skills in demand',
          'Strong track record of achievements',
          'Other opportunities in consideration',
        ],
        alternativeAsk: {
          signingBonus: 'If base salary is fixed, consider a signing bonus',
          reviewTimeline: 'Request 6-month review instead of annual',
          title: 'Negotiate for a senior title',
          startDate: 'Flexible start date for personal arrangements',
        },
        benefitsNegotiation: {
          pto: 'Additional vacation days',
          remote: 'Flexible work arrangements',
          education: 'Learning & development budget',
          equipment: 'Home office stipend',
        },
        signingBonusAdvice: {
          suggested: offeredSalary ? offeredSalary * 0.1 : 10000,
          reasoning: 'To bridge the gap between offer and market rate',
        },
        equityNegotiation: {
          vesting: 'Request accelerated vesting or cliff reduction',
          amount: 'Ask for 20-30% more equity if salary is firm',
        },
        riskLevel: 'LOW',
        offerRescindRisk: 5,
        marketAlternatives: ['Similar roles available at market rate', 'Strong demand for this skill set'],
        modelVersion: 'salary-advisor-v1.0',
        status: 'ADVISING',
      },
    });

    res.status(201).json(advice);
  } catch (error) {
    console.error('Error getting salary advice:', error);
    res.status(500).json({ error: 'Failed to get salary advice' });
  }
};

export const getSalaryAdviceHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const [advices, total] = await Promise.all([
      prisma.salaryNegotiationAdvice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.salaryNegotiationAdvice.count({ where }),
    ]);

    res.json({ advices, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching salary advice history:', error);
    res.status(500).json({ error: 'Failed to fetch salary advice history' });
  }
};

export const recordNegotiationOutcome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { finalSalary, finalBonus, finalEquity, outcome, lessonsLearned } = req.body;

    const advice = await prisma.salaryNegotiationAdvice.update({
      where: { id, userId },
      data: {
        finalSalary,
        finalBonus,
        finalEquity: finalEquity || {},
        negotiationOutcome: outcome,
        lessonsLearned: lessonsLearned || [],
        status: 'COMPLETED',
      },
    });

    res.json(advice);
  } catch (error) {
    console.error('Error recording negotiation outcome:', error);
    res.status(500).json({ error: 'Failed to record negotiation outcome' });
  }
};
