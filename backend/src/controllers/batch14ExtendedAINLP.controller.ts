import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 2.3.7 - CAREER PATH ADVISOR
// ============================================

export const getCareerPathAdvice = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const {
      currentRole,
      currentLevel,
      currentIndustry,
      yearsExperience,
      currentSkills,
      targetRoles,
      targetLevel,
      targetIndustry,
      targetTimeframe,
      priorities
    } = req.body;

    // In production, this would call an AI service
    const careerAdvice = await prisma.careerPathAdvice.create({
      data: {
        userId: userId!,
        currentRole,
        currentLevel,
        currentIndustry,
        yearsExperience,
        currentSkills,
        currentSalary: req.body.currentSalary,
        targetRoles,
        targetLevel,
        targetIndustry,
        targetTimeframe,
        targetSalary: req.body.targetSalary,
        priorities,
        careerPaths: [
          {
            pathId: 1,
            name: 'Direct Promotion Track',
            steps: [
              { step: 1, role: 'Senior Developer', timeline: '6-12 months' },
              { step: 2, role: 'Tech Lead', timeline: '12-24 months' },
              { step: 3, role: 'Engineering Manager', timeline: '24-36 months' }
            ],
            probability: 0.75
          },
          {
            pathId: 2,
            name: 'Specialist Track',
            steps: [
              { step: 1, role: 'Senior Developer', timeline: '6-12 months' },
              { step: 2, role: 'Staff Engineer', timeline: '18-30 months' },
              { step: 3, role: 'Principal Engineer', timeline: '36-48 months' }
            ],
            probability: 0.65
          }
        ],
        recommendedPath: {
          pathId: 1,
          reason: 'Best alignment with stated goals and current trajectory',
          confidence: 0.82
        },
        milestones: [
          { milestone: 'Complete leadership training', priority: 'HIGH', deadline: '3 months' },
          { milestone: 'Lead cross-functional project', priority: 'HIGH', deadline: '6 months' },
          { milestone: 'Mentor 2 junior developers', priority: 'MEDIUM', deadline: '6 months' },
          { milestone: 'Present at team tech talks', priority: 'MEDIUM', deadline: '3 months' }
        ],
        skillGaps: [
          { skill: 'People Management', currentLevel: 0, requiredLevel: 7, priority: 'HIGH' },
          { skill: 'System Design', currentLevel: 5, requiredLevel: 8, priority: 'MEDIUM' },
          { skill: 'Stakeholder Communication', currentLevel: 4, requiredLevel: 8, priority: 'HIGH' }
        ],
        experienceGaps: [
          { experience: 'Team leadership', gap: 'No direct reports experience', suggestion: 'Volunteer to lead sprint team' },
          { experience: 'Budget management', gap: 'No budget responsibility', suggestion: 'Request project budget ownership' }
        ],
        transitionDifficulty: 'MODERATE',
        timeToTransition: '18-24 months',
        marketDemand: 'HIGH',
        salaryProjection: {
          current: req.body.currentSalary || 100000,
          year1: 115000,
          year2: 135000,
          year3: 160000
        },
        riskAssessment: {
          risks: [
            { risk: 'Market downturn affecting hiring', probability: 0.3, impact: 'MEDIUM' },
            { risk: 'Skills becoming outdated', probability: 0.2, impact: 'HIGH' }
          ],
          mitigations: [
            'Maintain strong network',
            'Continuously upskill',
            'Build personal brand'
          ]
        },
        immediateActions: [
          'Schedule 1:1 with manager to discuss career goals',
          'Enroll in leadership fundamentals course',
          'Identify potential mentors in target role'
        ],
        shortTermActions: [
          'Complete 2 cross-functional projects',
          'Build presentation skills through tech talks',
          'Document major achievements for performance reviews'
        ],
        mediumTermActions: [
          'Seek formal leadership training program',
          'Take on increasing project scope',
          'Develop strategic thinking capabilities'
        ],
        longTermActions: [
          'Build executive presence',
          'Develop business acumen',
          'Create leadership portfolio'
        ],
        networkingAdvice: {
          internalConnections: ['Engineering Director', 'Senior Product Manager', 'HR Business Partner'],
          externalNetworking: ['Join local tech leadership meetups', 'Attend management conferences'],
          mentorship: 'Seek mentor with 5+ years management experience'
        },
        successFactors: [
          'Consistent high performance ratings',
          'Demonstrated leadership in current role',
          'Strong stakeholder relationships'
        ],
        industryTrends: [
          { trend: 'Remote team management skills increasingly valued', impact: 'POSITIVE' },
          { trend: 'Technical depth still important for managers', impact: 'POSITIVE' }
        ],
        alternativePaths: [
          { path: 'Individual Contributor Track', viability: 'HIGH', reason: 'Strong technical skills' },
          { path: 'Product Management', viability: 'MEDIUM', reason: 'Would require more business exposure' }
        ],
        modelVersion: '1.0.0'
      }
    });

    res.status(201).json({
      success: true,
      data: careerAdvice
    });
  } catch (error) {
    console.error('Error generating career path advice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate career path advice'
    });
  }
};

export const getCareerPathHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const history = await prisma.careerPathAdvice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching career path history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career path history'
    });
  }
};

// ============================================
// 2.3.8 - LEARNING RECOMMENDATIONS
// ============================================

export const getLearningRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { learningGoal, targetSkills, currentLevel, preferredFormat, timeAvailable, budget, jobId } = req.body;

    const recommendation = await prisma.learningRecommendation.create({
      data: {
        userId: userId!,
        jobId,
        learningGoal,
        targetSkills,
        currentLevel,
        preferredFormat,
        timeAvailable,
        budget,
        courses: [
          {
            id: 1,
            title: 'Complete System Design Masterclass',
            provider: 'Udemy',
            duration: '24 hours',
            rating: 4.8,
            price: 89.99,
            skills: ['System Design', 'Architecture', 'Scalability'],
            relevance: 0.95
          },
          {
            id: 2,
            title: 'AWS Solutions Architect Professional',
            provider: 'A Cloud Guru',
            duration: '40 hours',
            rating: 4.7,
            price: 35,
            skills: ['AWS', 'Cloud Architecture', 'DevOps'],
            relevance: 0.88
          },
          {
            id: 3,
            title: 'Leadership for Technical Professionals',
            provider: 'LinkedIn Learning',
            duration: '8 hours',
            rating: 4.5,
            price: 29.99,
            skills: ['Leadership', 'Communication', 'Team Management'],
            relevance: 0.82
          }
        ],
        certifications: [
          {
            name: 'AWS Solutions Architect Professional',
            provider: 'Amazon',
            difficulty: 'Advanced',
            prepTime: '3-6 months',
            cost: 300,
            salaryImpact: '+15%'
          },
          {
            name: 'Certified Kubernetes Administrator',
            provider: 'CNCF',
            difficulty: 'Intermediate',
            prepTime: '2-3 months',
            cost: 395,
            salaryImpact: '+12%'
          }
        ],
        books: [
          { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', relevance: 0.95 },
          { title: 'The Manager\'s Path', author: 'Camille Fournier', relevance: 0.88 },
          { title: 'Staff Engineer', author: 'Will Larson', relevance: 0.85 }
        ],
        tutorials: [
          { title: 'System Design Interview Prep', platform: 'YouTube', duration: '10 hours', free: true },
          { title: 'Microservices Deep Dive', platform: 'FreeCodeCamp', duration: '6 hours', free: true }
        ],
        projects: [
          {
            title: 'Build a URL Shortener',
            skills: ['System Design', 'Databases', 'Caching'],
            complexity: 'Medium',
            estimatedTime: '2 weeks'
          },
          {
            title: 'Design a Rate Limiter',
            skills: ['Algorithms', 'Distributed Systems'],
            complexity: 'Medium',
            estimatedTime: '1 week'
          }
        ],
        communities: [
          { name: 'r/ExperiencedDevs', platform: 'Reddit', members: 150000 },
          { name: 'Tech Lead Discord', platform: 'Discord', members: 25000 }
        ],
        mentorship: {
          recommendation: 'Seek mentor with Staff+ experience',
          platforms: ['MentorCruise', 'ADPList'],
          estimatedCost: '$100-300/month'
        },
        learningPath: [
          { phase: 1, focus: 'System Design Fundamentals', duration: '4 weeks' },
          { phase: 2, focus: 'Cloud Architecture Deep Dive', duration: '6 weeks' },
          { phase: 3, focus: 'Leadership & Soft Skills', duration: '4 weeks' },
          { phase: 4, focus: 'Certification Preparation', duration: '8 weeks' }
        ],
        milestones: [
          { week: 4, milestone: 'Complete System Design course' },
          { week: 10, milestone: 'Build 2 portfolio projects' },
          { week: 14, milestone: 'Pass AWS certification' }
        ],
        estimatedDuration: '4-6 months',
        priorityOrder: ['System Design', 'Cloud Architecture', 'Leadership'],
        courseraLinks: [
          { url: 'https://coursera.org/learn/cloud-computing', title: 'Cloud Computing Concepts' }
        ],
        udemyLinks: [
          { url: 'https://udemy.com/course/system-design', title: 'System Design Masterclass' }
        ],
        linkedinLearning: [
          { url: 'https://linkedin.com/learning/leadership', title: 'Leadership Fundamentals' }
        ],
        pluralsightLinks: [
          { url: 'https://pluralsight.com/paths/aws-architect', title: 'AWS Architect Path' }
        ],
        youtubeLinks: [
          { url: 'https://youtube.com/systemdesign', title: 'System Design Tutorials', free: true }
        ],
        freeResources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'GitHub' },
          { title: 'Tech Interview Handbook', url: 'https://techinterviewhandbook.org', type: 'Website' }
        ],
        skillValueIncrease: {
          'System Design': { before: 5, after: 8, marketValue: '+$25k' },
          'Cloud Architecture': { before: 4, after: 7, marketValue: '+$20k' }
        },
        salaryImpact: 25000,
        marketabilityIncrease: 'SIGNIFICANT',
        modelVersion: '1.0.0'
      }
    });

    res.status(201).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error generating learning recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning recommendations'
    });
  }
};

export const updateLearningProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completedItems, currentProgress } = req.body;

    const updated = await prisma.learningRecommendation.update({
      where: { id },
      data: {
        completedItems,
        currentProgress,
        startedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning progress'
    });
  }
};

export const getLearningHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const history = await prisma.learningRecommendation.findMany({
      where: { userId },
      include: { job: { select: { title: true, companyName: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching learning history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning history'
    });
  }
};

// ============================================
// 2.3.9 - APPLICATION STATUS INSIGHTS
// ============================================

export const getApplicationInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    // Check if insights already exist
    let insight = await prisma.applicationInsight.findUnique({
      where: { applicationId },
      include: {
        application: {
          include: {
            job: true
          }
        }
      }
    });

    if (!insight) {
      // Generate new insights
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      insight = await prisma.applicationInsight.create({
        data: {
          userId: userId!,
          applicationId,
          currentStage: application.status,
          stageDetails: {
            stage: application.status,
            description: 'Application is currently under review',
            typicalDuration: '5-7 business days'
          },
          timeInStage: Math.floor((Date.now() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24)),
          averageTimeAtStage: 5,
          competitorCount: 127,
          rankEstimate: 'TOP_25',
          strengthsVsField: [
            { area: 'Technical Skills', strength: 'Top 15%', details: 'Strong match on required technologies' },
            { area: 'Experience Level', strength: 'Top 20%', details: 'Experience aligns well with role' }
          ],
          weaknessesVsField: [
            { area: 'Industry Experience', weakness: 'Average', details: 'Limited fintech background' }
          ],
          advanceProbability: 0.72,
          hireProbability: 0.35,
          predictionFactors: [
            { factor: 'Skills Match', impact: 'POSITIVE', weight: 0.35 },
            { factor: 'Experience', impact: 'POSITIVE', weight: 0.25 },
            { factor: 'Competition Level', impact: 'NEGATIVE', weight: 0.2 },
            { factor: 'Application Timing', impact: 'NEUTRAL', weight: 0.1 }
          ],
          confidenceLevel: 'MEDIUM',
          immediateActions: [
            'Connect with recruiter on LinkedIn',
            'Research recent company news for interview prep',
            'Prepare STAR stories for behavioral questions'
          ],
          profileImprovements: [
            'Add fintech-related projects to portfolio',
            'Highlight any payment system experience'
          ],
          followUpAdvice: {
            timing: 'Wait 5 more days before following up',
            method: 'LinkedIn message to recruiter',
            template: 'Brief, professional check-in on application status'
          },
          interviewTips: [
            'Review system design for payment processing',
            'Prepare questions about team structure'
          ],
          expectedNextStep: 'Technical phone screen',
          expectedTimeline: '7-10 business days',
          typicalProcessLength: 21,
          urgencyLevel: 'MEDIUM',
          companyHiringPattern: {
            averageTimeToHire: '3-4 weeks',
            interviewRounds: 4,
            typicalProcess: ['Resume Screen', 'Phone Screen', 'Technical Interview', 'Onsite', 'Offer']
          },
          roleCompetitiveness: 'HIGH',
          seasonalFactors: [
            { factor: 'Q4 hiring slowdown', impact: 'SLIGHT_NEGATIVE' }
          ],
          redFlags: [],
          positiveSignals: [
            { signal: 'Application viewed multiple times', meaning: 'Hiring team is interested' },
            { signal: 'Role still open after 2 weeks', meaning: 'They haven\'t found the right candidate yet' }
          ],
          dealBreakers: [
            'Salary expectations significantly above budget',
            'Unable to start within required timeframe'
          ],
          modelVersion: '1.0.0',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        include: {
          application: {
            include: { job: true }
          }
        }
      });
    }

    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error getting application insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application insights'
    });
  }
};

export const getAllApplicationInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const insights = await prisma.applicationInsight.findMany({
      where: { userId },
      include: {
        application: {
          include: {
            job: { select: { title: true, companyName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching all application insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application insights'
    });
  }
};

// ============================================
// 2.3.10 - PORTFOLIO FEEDBACK
// ============================================

export const getPortfolioFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { portfolioUrl, portfolioType, projects } = req.body;

    const feedback = await prisma.portfolioFeedback.create({
      data: {
        userId: userId!,
        portfolioUrl,
        portfolioType,
        projectCount: projects?.length || 0,
        analyzedProjects: projects || [],
        overallScore: 78,
        overallGrade: 'B+',
        strengthAreas: [
          { area: 'Technical Diversity', score: 85, feedback: 'Good variety of technologies demonstrated' },
          { area: 'Code Quality', score: 82, feedback: 'Clean code with good practices' },
          { area: 'Documentation', score: 75, feedback: 'Solid README files with room for improvement' }
        ],
        improvementAreas: [
          { area: 'Visual Design', score: 65, feedback: 'Consider more polished UI/UX' },
          { area: 'Business Impact', score: 60, feedback: 'Add metrics and outcomes' },
          { area: 'Live Demos', score: 55, feedback: 'More projects should have live demos' }
        ],
        standoutProjects: [
          { projectName: 'E-commerce Platform', reason: 'Full-stack implementation with complex features' },
          { projectName: 'ML Pipeline', reason: 'Shows advanced technical skills' }
        ],
        visualAppeal: 72,
        navigation: 80,
        mobileResponsive: true,
        loadSpeed: 'MEDIUM',
        accessibilityScore: 68,
        presentationFeedback: [
          'Add a hero section with your value proposition',
          'Include professional headshot',
          'Improve project thumbnail images'
        ],
        projectDescriptions: {
          quality: 'GOOD',
          averageLength: 150,
          suggestions: [
            'Add problem statements to each project',
            'Include challenges overcome',
            'Quantify results where possible'
          ]
        },
        technicalDepth: 78,
        problemSolving: 72,
        realWorldImpact: 65,
        contentFeedback: [
          'Add case studies for top 2-3 projects',
          'Include architecture diagrams',
          'Show before/after metrics'
        ],
        techStackDiversity: 85,
        codeQuality: 80,
        documentationQuality: 75,
        testCoverage: 60,
        technicalFeedback: [
          'Add test coverage badges to repos',
          'Include CI/CD configuration',
          'Add contribution guidelines'
        ],
        industryRelevance: 75,
        trendAlignment: 82,
        uniqueness: 68,
        marketFeedback: [
          'Add more cloud-native projects',
          'Include a machine learning project',
          'Show microservices architecture experience'
        ],
        projectFeedback: [
          {
            project: 'E-commerce Platform',
            score: 85,
            strengths: ['Full-stack', 'Payment integration', 'Clean code'],
            improvements: ['Add performance metrics', 'Include load testing results']
          },
          {
            project: 'Personal Blog',
            score: 70,
            strengths: ['Clean design', 'Good SEO'],
            improvements: ['Too simple for senior role', 'Add advanced features']
          }
        ],
        quickWins: [
          { action: 'Add README badges', effort: '30 minutes', impact: 'MEDIUM' },
          { action: 'Update project screenshots', effort: '1 hour', impact: 'HIGH' },
          { action: 'Add alt text to images', effort: '30 minutes', impact: 'MEDIUM' }
        ],
        mediumEffort: [
          { action: 'Write case study for top project', effort: '4 hours', impact: 'HIGH' },
          { action: 'Add architecture diagrams', effort: '2 hours', impact: 'HIGH' },
          { action: 'Improve mobile responsiveness', effort: '3 hours', impact: 'MEDIUM' }
        ],
        majorOverhauls: [
          { action: 'Redesign portfolio site', effort: '1-2 weeks', impact: 'HIGH' },
          { action: 'Add 2 new substantial projects', effort: '2-4 weeks', impact: 'VERY_HIGH' }
        ],
        prioritizedActions: [
          { rank: 1, action: 'Update project screenshots', reason: 'Quick win with high impact' },
          { rank: 2, action: 'Write case study for E-commerce project', reason: 'Demonstrates depth' },
          { rank: 3, action: 'Add architecture diagrams', reason: 'Shows system thinking' },
          { rank: 4, action: 'Add cloud-native project', reason: 'Addresses market demand' }
        ],
        modelVersion: '1.0.0'
      }
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error generating portfolio feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate portfolio feedback'
    });
  }
};

export const getPortfolioFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const history = await prisma.portfolioFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching portfolio feedback history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio feedback history'
    });
  }
};

// ============================================
// 2.4.1 - RESUME/PROFILE PARSER
// ============================================

export const parseDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { documentType, fileName, fileUrl, rawText } = req.body;

    // In production, this would use NLP models to parse the document
    const parsed = await prisma.parsedDocument.create({
      data: {
        userId,
        documentType,
        fileName,
        fileUrl,
        rawText,
        fileHash: Buffer.from(rawText || '').toString('base64').substring(0, 32),
        contactInfo: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/johnsmith',
          github: 'github.com/johnsmith'
        },
        summary: 'Experienced software engineer with 8+ years building scalable web applications...',
        workExperience: [
          {
            company: 'Tech Corp',
            title: 'Senior Software Engineer',
            startDate: '2020-03',
            endDate: 'Present',
            current: true,
            location: 'San Francisco, CA',
            description: 'Led development of microservices architecture...',
            achievements: [
              'Reduced API latency by 40%',
              'Managed team of 5 engineers'
            ],
            technologies: ['Node.js', 'React', 'AWS', 'PostgreSQL']
          },
          {
            company: 'StartupCo',
            title: 'Software Engineer',
            startDate: '2017-06',
            endDate: '2020-02',
            current: false,
            location: 'New York, NY',
            description: 'Full-stack development for e-commerce platform...',
            achievements: [
              'Built payment processing system handling $10M/month',
              'Improved test coverage from 40% to 85%'
            ],
            technologies: ['Python', 'Django', 'React', 'PostgreSQL']
          }
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'M.S.',
            field: 'Computer Science',
            graduationDate: '2017',
            gpa: '3.8'
          },
          {
            institution: 'UC Berkeley',
            degree: 'B.S.',
            field: 'Computer Science',
            graduationDate: '2015',
            gpa: '3.6'
          }
        ],
        skills: {
          programming: ['JavaScript', 'TypeScript', 'Python', 'Go'],
          frameworks: ['React', 'Node.js', 'Django', 'Express'],
          databases: ['PostgreSQL', 'MongoDB', 'Redis'],
          cloud: ['AWS', 'GCP', 'Docker', 'Kubernetes'],
          tools: ['Git', 'Jenkins', 'Terraform']
        },
        certifications: [
          { name: 'AWS Solutions Architect Professional', issuer: 'Amazon', date: '2022' },
          { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', date: '2021' }
        ],
        projects: [
          {
            name: 'Open Source CLI Tool',
            description: 'Developer productivity tool with 5k+ GitHub stars',
            technologies: ['Go', 'CLI'],
            url: 'github.com/johnsmith/cli-tool'
          }
        ],
        publications: [],
        awards: [
          { name: 'Employee of the Year', issuer: 'Tech Corp', date: '2022' }
        ],
        languages: [
          { language: 'English', proficiency: 'Native' },
          { language: 'Spanish', proficiency: 'Conversational' }
        ],
        volunteerWork: [],
        additionalSections: {},
        parseConfidence: 0.92,
        completenessScore: 0.88,
        formatQuality: 'GOOD',
        issues: [
          { section: 'Projects', issue: 'Limited project descriptions' }
        ],
        companies: ['Tech Corp', 'StartupCo'],
        technologies: ['JavaScript', 'TypeScript', 'Python', 'Go', 'React', 'Node.js', 'AWS'],
        locations: ['San Francisco, CA', 'New York, NY'],
        dates: ['2020-03', 'Present', '2017-06', '2020-02', '2017', '2015'],
        urls: ['linkedin.com/in/johnsmith', 'github.com/johnsmith'],
        seniorityLevel: 'SENIOR',
        industryFocus: ['Technology', 'E-commerce', 'FinTech'],
        careerProgression: {
          trajectory: 'UPWARD',
          avgTenure: '2.5 years',
          promotions: 1
        },
        keyAchievements: [
          'Reduced API latency by 40%',
          'Built payment system handling $10M/month',
          '5k+ GitHub stars on open source project'
        ],
        status: 'PARSED',
        modelVersion: '1.0.0',
        processingTime: 1250
      }
    });

    res.status(201).json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse document'
    });
  }
};

export const getParsedDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const documents = await prisma.parsedDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching parsed documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parsed documents'
    });
  }
};

// ============================================
// 2.4.2 - SKILL EXTRACTION
// ============================================

export const extractSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sourceType, sourceId, sourceText } = req.body;

    const extraction = await prisma.skillExtraction.create({
      data: {
        userId,
        sourceType,
        sourceId,
        sourceText,
        skills: [
          { skill: 'JavaScript', confidence: 0.95, mentions: 12 },
          { skill: 'React', confidence: 0.92, mentions: 8 },
          { skill: 'Node.js', confidence: 0.90, mentions: 6 },
          { skill: 'TypeScript', confidence: 0.88, mentions: 5 },
          { skill: 'AWS', confidence: 0.85, mentions: 4 },
          { skill: 'PostgreSQL', confidence: 0.82, mentions: 3 }
        ],
        skillCategories: {
          frontend: ['JavaScript', 'React', 'TypeScript', 'HTML', 'CSS'],
          backend: ['Node.js', 'Express', 'Python'],
          database: ['PostgreSQL', 'MongoDB', 'Redis'],
          cloud: ['AWS', 'Docker', 'Kubernetes'],
          tools: ['Git', 'Jenkins', 'Jira']
        },
        skillLevels: {
          'JavaScript': 'EXPERT',
          'React': 'ADVANCED',
          'Node.js': 'ADVANCED',
          'TypeScript': 'INTERMEDIATE',
          'AWS': 'INTERMEDIATE',
          'PostgreSQL': 'INTERMEDIATE'
        },
        skillRelationships: {
          clusters: [
            { name: 'Frontend Stack', skills: ['JavaScript', 'React', 'TypeScript'] },
            { name: 'Backend Stack', skills: ['Node.js', 'Express', 'PostgreSQL'] }
          ],
          dependencies: [
            { skill: 'React', dependsOn: ['JavaScript'] },
            { skill: 'Express', dependsOn: ['Node.js'] }
          ]
        },
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go'],
        frameworks: ['React', 'Node.js', 'Express', 'Django'],
        databases: ['PostgreSQL', 'MongoDB', 'Redis'],
        cloudPlatforms: ['AWS', 'GCP'],
        tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins'],
        methodologies: ['Agile', 'Scrum', 'CI/CD', 'TDD'],
        softSkills: ['Leadership', 'Communication', 'Problem Solving'],
        leadershipSkills: ['Team Management', 'Mentoring', 'Project Leadership'],
        communicationSkills: ['Technical Writing', 'Presentations', 'Stakeholder Management'],
        domainExpertise: ['E-commerce', 'FinTech', 'SaaS'],
        certificationSkills: ['AWS Solutions Architect', 'CKA'],
        coreCompetencies: ['Full-Stack Development', 'System Design', 'API Development'],
        emergingSkills: ['Kubernetes', 'Go'],
        legacySkills: [],
        rarityScores: {
          'JavaScript': 0.2,
          'React': 0.3,
          'Kubernetes': 0.7,
          'Go': 0.6,
          'System Design': 0.65
        },
        marketDemand: {
          'JavaScript': { demand: 'HIGH', openRoles: 15000 },
          'React': { demand: 'HIGH', openRoles: 12000 },
          'Kubernetes': { demand: 'VERY_HIGH', openRoles: 8000 },
          'Go': { demand: 'HIGH', openRoles: 5000 }
        },
        salaryImpact: {
          'JavaScript': { baseImpact: 0, seniorImpact: 5000 },
          'Kubernetes': { baseImpact: 15000, seniorImpact: 25000 },
          'Go': { baseImpact: 10000, seniorImpact: 20000 }
        },
        trendingSkills: ['Kubernetes', 'Go', 'Rust', 'AI/ML'],
        overallConfidence: 0.89,
        perSkillConfidence: {
          'JavaScript': 0.95,
          'React': 0.92,
          'Node.js': 0.90,
          'AWS': 0.85
        },
        modelVersion: '1.0.0',
        processingTime: 850
      }
    });

    res.status(201).json({
      success: true,
      data: extraction
    });
  } catch (error) {
    console.error('Error extracting skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract skills'
    });
  }
};

export const getSkillExtractions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const extractions = await prisma.skillExtraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: extractions
    });
  } catch (error) {
    console.error('Error fetching skill extractions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill extractions'
    });
  }
};

// ============================================
// 2.4.3 - SEMANTIC SEARCH
// ============================================

export const indexForSearch = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { entityType, entityId, title, content, summary, category, skills, industries, locations } = req.body;

    // In production, this would generate actual embeddings using an ML model
    const mockEmbedding = Array(384).fill(0).map(() => Math.random() * 2 - 1);

    const indexed = await prisma.semanticSearchIndex.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId
        }
      },
      create: {
        userId,
        entityType,
        entityId,
        title,
        content,
        summary,
        keywords: content.split(' ').filter((w: string) => w.length > 5).slice(0, 20),
        embedding: mockEmbedding,
        embeddingModel: 'all-MiniLM-L6-v2',
        embeddingDimension: 384,
        category,
        skills,
        industries,
        locations,
        contentQuality: 0.85,
        freshness: new Date()
      },
      update: {
        title,
        content,
        summary,
        keywords: content.split(' ').filter((w: string) => w.length > 5).slice(0, 20),
        embedding: mockEmbedding,
        category,
        skills,
        industries,
        locations,
        contentQuality: 0.85,
        freshness: new Date(),
        lastIndexed: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: { id: indexed.id, entityType, entityId, indexed: true }
    });
  } catch (error) {
    console.error('Error indexing for search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to index for search'
    });
  }
};

export const semanticSearch = async (req: Request, res: Response) => {
  try {
    const { query, entityType, filters, limit = 20 } = req.body;

    // In production, this would:
    // 1. Generate embedding for the query
    // 2. Perform vector similarity search
    // 3. Apply filters and rank results

    // For now, return mock results
    const results = await prisma.semanticSearchIndex.findMany({
      where: {
        status: 'ACTIVE',
        ...(entityType && { entityType }),
        ...(filters?.skills && { skills: { array_contains: filters.skills } }),
        ...(filters?.locations && { locations: { array_contains: filters.locations } })
      },
      take: limit,
      orderBy: { contentQuality: 'desc' }
    });

    res.json({
      success: true,
      data: {
        query,
        results: results.map(r => ({
          ...r,
          embedding: undefined, // Don't return embeddings
          relevanceScore: Math.random() * 0.3 + 0.7 // Mock relevance
        })),
        totalResults: results.length
      }
    });
  } catch (error) {
    console.error('Error performing semantic search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform semantic search'
    });
  }
};

// ============================================
// 2.4.4 - ENTITY RECOGNITION
// ============================================

export const recognizeEntities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sourceType, sourceId, sourceText } = req.body;

    // In production, this would use NER models
    const recognition = await prisma.entityRecognition.create({
      data: {
        userId,
        sourceType,
        sourceId,
        sourceText,
        people: [
          { name: 'John Smith', role: 'Candidate', confidence: 0.95 },
          { name: 'Jane Doe', role: 'Manager', confidence: 0.88 }
        ],
        organizations: [
          { name: 'Tech Corp', type: 'Employer', confidence: 0.95 },
          { name: 'Stanford University', type: 'Education', confidence: 0.92 },
          { name: 'AWS', type: 'Technology Provider', confidence: 0.90 }
        ],
        locations: [
          { location: 'San Francisco, CA', type: 'City', confidence: 0.95 },
          { location: 'New York', type: 'City', confidence: 0.92 },
          { location: 'Remote', type: 'WorkType', confidence: 0.88 }
        ],
        dates: [
          { date: '2020-03', type: 'START_DATE', context: 'Employment start' },
          { date: '2017', type: 'GRADUATION', context: 'Education completion' },
          { date: 'Present', type: 'ONGOING', context: 'Current role' }
        ],
        money: [
          { amount: 150000, currency: 'USD', type: 'SALARY', confidence: 0.85 },
          { amount: 10000000, currency: 'USD', type: 'REVENUE', confidence: 0.80 }
        ],
        percentages: [
          { value: 40, context: 'Performance improvement', confidence: 0.90 },
          { value: 85, context: 'Test coverage', confidence: 0.88 }
        ],
        quantities: [
          { value: 5, unit: 'people', context: 'Team size', confidence: 0.92 },
          { value: 8, unit: 'years', context: 'Experience', confidence: 0.95 }
        ],
        technologies: [
          { name: 'JavaScript', category: 'Language', confidence: 0.95 },
          { name: 'React', category: 'Framework', confidence: 0.93 },
          { name: 'AWS', category: 'Cloud', confidence: 0.92 },
          { name: 'PostgreSQL', category: 'Database', confidence: 0.90 }
        ],
        products: [
          { name: 'EC2', vendor: 'AWS', confidence: 0.88 },
          { name: 'S3', vendor: 'AWS', confidence: 0.87 }
        ],
        platforms: [
          { name: 'AWS', type: 'Cloud', confidence: 0.95 },
          { name: 'GitHub', type: 'VCS', confidence: 0.90 },
          { name: 'Docker', type: 'Container', confidence: 0.88 }
        ],
        languages: [
          { name: 'JavaScript', type: 'Programming', confidence: 0.95 },
          { name: 'Python', type: 'Programming', confidence: 0.92 },
          { name: 'English', type: 'Natural', confidence: 0.90 }
        ],
        jobTitles: [
          { title: 'Senior Software Engineer', standardized: 'Software Engineer III', confidence: 0.92 },
          { title: 'Software Engineer', standardized: 'Software Engineer II', confidence: 0.90 }
        ],
        degrees: [
          { degree: 'M.S. Computer Science', level: 'Masters', confidence: 0.95 },
          { degree: 'B.S. Computer Science', level: 'Bachelors', confidence: 0.93 }
        ],
        certifications: [
          { name: 'AWS Solutions Architect Professional', issuer: 'Amazon', confidence: 0.92 },
          { name: 'CKA', issuer: 'CNCF', confidence: 0.88 }
        ],
        universities: [
          { name: 'Stanford University', type: 'University', confidence: 0.95 },
          { name: 'UC Berkeley', type: 'University', confidence: 0.93 }
        ],
        industries: [
          { name: 'Technology', confidence: 0.95 },
          { name: 'E-commerce', confidence: 0.88 },
          { name: 'FinTech', confidence: 0.82 }
        ],
        entityRelationships: [
          { entity1: 'John Smith', entity2: 'Tech Corp', relationship: 'EMPLOYED_BY' },
          { entity1: 'John Smith', entity2: 'Stanford University', relationship: 'GRADUATED_FROM' },
          { entity1: 'Tech Corp', entity2: 'San Francisco', relationship: 'LOCATED_IN' }
        ],
        timeline: [
          { date: '2015', event: 'Graduated from UC Berkeley' },
          { date: '2017', event: 'Graduated from Stanford' },
          { date: '2017-06', event: 'Started at StartupCo' },
          { date: '2020-03', event: 'Joined Tech Corp' }
        ],
        perEntityConfidence: {
          people: 0.91,
          organizations: 0.92,
          locations: 0.93,
          technologies: 0.94,
          dates: 0.90
        },
        overallConfidence: 0.91,
        normalizedEntities: {
          companies: {
            'Tech Corp': { normalized: 'Tech Corp Inc.', industry: 'Technology' },
            'StartupCo': { normalized: 'Startup Company LLC', industry: 'E-commerce' }
          },
          technologies: {
            'JS': 'JavaScript',
            'TS': 'TypeScript',
            'React.js': 'React'
          }
        },
        modelVersion: '1.0.0',
        processingTime: 720
      }
    });

    res.status(201).json({
      success: true,
      data: recognition
    });
  } catch (error) {
    console.error('Error recognizing entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recognize entities'
    });
  }
};

export const getEntityRecognitions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const recognitions = await prisma.entityRecognition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: recognitions
    });
  } catch (error) {
    console.error('Error fetching entity recognitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity recognitions'
    });
  }
};
