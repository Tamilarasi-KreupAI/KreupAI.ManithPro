import axios from 'axios';
import {
  ProfileEnhancement,
  ExperienceDescription,
  SkillsGapAnalysis,
  CoverLetter,
  InterviewPrep,
  SalaryNegotiationAdvice,
  EnhanceProfileRequest,
  GenerateExperienceRequest,
  AnalyzeSkillsGapRequest,
  GenerateCoverLetterRequest,
  GenerateInterviewPrepRequest,
  GetSalaryAdviceRequest,
  RecordNegotiationOutcomeRequest,
  ProfileSection,
  InterviewType,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockProfileEnhancement: ProfileEnhancement = {
  id: 'pe-001',
  userId: 'user-001',
  profileSection: 'SUMMARY',
  currentContent: 'I am a software developer with experience in web applications.',
  analysisResults: {
    wordCount: 10,
    sentenceCount: 1,
    hasMetrics: false,
    hasActionVerbs: false,
    readabilityScore: 72,
    toneAnalysis: 'Neutral',
  },
  suggestions: [
    { type: 'ADD_METRICS', suggestion: 'Add quantifiable achievements', priority: 'HIGH', example: 'e.g., "built systems serving 1M+ users"' },
    { type: 'STRONGER_VERBS', suggestion: 'Use stronger action verbs', priority: 'MEDIUM', example: 'e.g., "architected", "spearheaded"' },
    { type: 'KEYWORDS', suggestion: 'Add industry keywords', priority: 'HIGH', keywords: ['full-stack', 'scalable', 'agile'] },
  ],
  enhancedContent: 'Results-driven Full-Stack Software Engineer with 5+ years of experience building scalable web applications serving millions of users. Expertise in React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-impact projects.',
  keyImprovements: ['Added years of experience', 'Included specific technologies', 'Added quantifiable impact', 'Strengthened opening'],
  originalScore: 45,
  potentialScore: 88,
  improvementPercentage: 95.6,
  clarityImprovements: ['Clearer structure', 'Concise sentences'],
  impactImprovements: ['Added metrics', 'Quantified achievements'],
  keywordImprovements: ['Added ATS keywords', 'Industry terms'],
  formattingImprovements: ['Professional tone', 'Proper formatting'],
  status: 'GENERATED',
  modelVersion: 'profile-enhancer-v1.0',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const mockExperienceDescription: ExperienceDescription = {
  id: 'ed-001',
  userId: 'user-001',
  jobTitle: 'Senior Software Engineer',
  companyName: 'TechCorp Inc.',
  industry: 'Technology',
  duration: '3 years 2 months',
  responsibilities: ['Build web apps', 'Lead team'],
  technologies: ['React', 'Node.js', 'AWS'],
  achievements: ['Improved performance'],
  generatedSummary: 'As Senior Software Engineer at TechCorp Inc., led strategic technical initiatives and delivered high-impact results over 3+ years. Demonstrated expertise in React, Node.js, and AWS while driving measurable business outcomes.',
  generatedBullets: [
    'Led development of scalable microservices architecture serving 2M+ daily active users',
    'Mentored team of 5 junior developers, improving team velocity by 40%',
    'Implemented CI/CD pipeline reducing deployment time by 65%',
    'Architected real-time notification system handling 10K+ messages per second',
    'Drove adoption of TypeScript, reducing production bugs by 30%',
  ],
  impactStatements: [
    { metric: '2M+ daily active users', category: 'SCALE' },
    { metric: '40% team velocity increase', category: 'LEADERSHIP' },
    { metric: '65% faster deployments', category: 'EFFICIENCY' },
    { metric: '30% bug reduction', category: 'QUALITY' },
  ],
  skillsHighlighted: ['React', 'Node.js', 'AWS', 'Leadership', 'System Design'],
  variations: {
    concise: ['Led microservices development for 2M+ users', 'Mentored 5 developers, +40% velocity', 'Built CI/CD, -65% deploy time'],
    detailed: ['Full descriptions with context...'],
    technical: ['Technical deep-dive with architecture details...'],
  },
  toneOptions: {
    professional: 'Standard professional tone',
    casual: 'More approachable tone',
    technical: 'Detailed technical focus',
  },
  atsKeywords: ['microservices', 'scalable', 'leadership', 'CI/CD', 'TypeScript'],
  industryTerms: ['SaaS', 'B2B', 'cloud-native'],
  actionVerbs: ['Led', 'Mentored', 'Implemented', 'Architected', 'Drove'],
  impactScore: 92,
  clarityScore: 88,
  atsScore: 95,
  status: 'GENERATED',
  modelVersion: 'exp-generator-v1.0',
  createdAt: new Date('2024-01-16'),
  updatedAt: new Date('2024-01-16'),
};

const mockSkillsGapAnalysis: SkillsGapAnalysis = {
  id: 'sga-001',
  userId: 'user-001',
  targetJobTitle: 'Staff Software Engineer',
  targetIndustry: 'Technology',
  targetSeniority: 'STAFF',
  currentSkills: ['JavaScript', 'React', 'Node.js', 'CSS', 'Git'],
  skillLevels: { JavaScript: 8, React: 7, 'Node.js': 6, CSS: 7, Git: 8 },
  requiredSkills: [
    { skill: 'TypeScript', level: 'Advanced', category: 'TECHNICAL' },
    { skill: 'System Design', level: 'Advanced', category: 'TECHNICAL' },
    { skill: 'Kubernetes', level: 'Intermediate', category: 'TECHNICAL' },
    { skill: 'Technical Leadership', level: 'Advanced', category: 'SOFT_SKILL' },
  ],
  missingSkills: [
    { skill: 'Kubernetes', level: 'Intermediate', category: 'TECHNICAL' },
    { skill: 'System Design', level: 'Advanced', category: 'TECHNICAL' },
  ],
  underDevelopedSkills: [
    { skill: 'TypeScript', currentLevel: 5, requiredLevel: 8 },
    { skill: 'Node.js', currentLevel: 6, requiredLevel: 8 },
  ],
  transferableSkills: [
    { skill: 'JavaScript', transfersTo: 'TypeScript', transferability: 85 },
    { skill: 'Problem Solving', transfersTo: 'System Design', transferability: 60 },
  ],
  criticalGaps: [{ skill: 'System Design', level: 'Advanced', category: 'TECHNICAL' }],
  importantGaps: [{ skill: 'Kubernetes', level: 'Intermediate', category: 'TECHNICAL' }],
  niceToHaveGaps: [],
  learningPath: [
    { step: 1, skill: 'TypeScript', duration: '4 weeks', priority: 'HIGH' },
    { step: 2, skill: 'System Design', duration: '8 weeks', priority: 'HIGH' },
    { step: 3, skill: 'Kubernetes', duration: '6 weeks', priority: 'MEDIUM' },
  ],
  resourceRecommendations: [
    { skill: 'TypeScript', resource: 'TypeScript Deep Dive', type: 'BOOK', url: 'https://basarat.gitbook.io/typescript/' },
    { skill: 'System Design', resource: 'System Design Primer', type: 'COURSE', url: 'https://github.com/donnemartin/system-design-primer' },
    { skill: 'Kubernetes', resource: 'CKAD Certification', type: 'CERTIFICATION' },
  ],
  timeEstimates: { total: '18 weeks', TypeScript: '4 weeks', 'System Design': '8 weeks', Kubernetes: '6 weeks' },
  priorityRanking: ['TypeScript', 'System Design', 'Kubernetes', 'Technical Leadership'],
  marketDemand: {
    TypeScript: { demand: 'HIGH', growth: '+35%' },
    'System Design': { demand: 'HIGH', growth: '+40%' },
    Kubernetes: { demand: 'HIGH', growth: '+45%' },
  },
  salaryImpact: { TypeScript: '+$12,000', 'System Design': '+$20,000', Kubernetes: '+$15,000' },
  overallReadiness: 65,
  technicalReadiness: 60,
  softSkillReadiness: 72,
  experienceAlignment: 68,
  status: 'ACTIVE',
  modelVersion: 'skills-gap-v1.0',
  analyzedAt: new Date('2024-01-17'),
  createdAt: new Date('2024-01-17'),
  updatedAt: new Date('2024-01-17'),
};

const mockCoverLetter: CoverLetter = {
  id: 'cl-001',
  userId: 'user-001',
  jobTitle: 'Senior Software Engineer',
  companyName: 'Innovate Labs',
  companyDescription: 'A leading AI startup revolutionizing healthcare',
  jobDescription: 'We are looking for a Senior Software Engineer to join our core platform team...',
  whyInterested: 'Passionate about using technology to improve healthcare outcomes',
  relevantExperience: ['5 years full-stack development', 'Healthcare tech experience', 'Team leadership'],
  keyAchievements: ['Scaled systems to 1M+ users', 'Led team of 8 engineers', 'Reduced latency by 60%'],
  opening: 'Dear Hiring Manager,\n\nI am writing to express my enthusiasm for the Senior Software Engineer position at Innovate Labs. With my passion for using technology to improve healthcare outcomes and 5+ years of full-stack development experience, I am excited about the opportunity to contribute to your mission of revolutionizing healthcare.',
  body: 'Throughout my career, I have developed expertise directly aligned with your requirements. Key highlights include leading teams of up to 8 engineers, scaling systems to serve over 1 million users, and reducing application latency by 60%.\n\nI am particularly drawn to Innovate Labs\' commitment to AI-driven healthcare solutions. My experience in healthcare technology and passion for making a meaningful impact aligns perfectly with your company\'s mission.',
  closing: 'I would welcome the opportunity to discuss how my skills and experience can benefit Innovate Labs. Thank you for considering my application.\n\nSincerely,\n[Your Name]',
  fullLetter: 'Dear Hiring Manager,\n\nI am writing to express my enthusiasm...[full letter content]',
  toneVariations: {
    formal: 'Formal version of the letter',
    friendly: 'More conversational version',
    enthusiastic: 'High-energy version',
  },
  lengthVariations: {
    brief: 'Short 2-paragraph version',
    standard: 'Standard 4-paragraph version',
    detailed: 'Comprehensive 6-paragraph version',
  },
  keywordsUsed: ['full-stack', 'scalable', 'healthcare', 'AI', 'leadership'],
  skillsHighlighted: ['Full-Stack Development', 'Team Leadership', 'System Scaling', 'Healthcare Tech'],
  achievementsMentioned: ['1M+ users', '8 engineers led', '60% latency reduction'],
  relevanceScore: 92,
  persuasivenessScore: 88,
  professionalismScore: 95,
  atsScore: 90,
  status: 'DRAFT',
  modelVersion: 'cover-letter-v1.0',
  createdAt: new Date('2024-01-18'),
  updatedAt: new Date('2024-01-18'),
};

const mockInterviewPrep: InterviewPrep = {
  id: 'ip-001',
  userId: 'user-001',
  jobTitle: 'Senior Software Engineer',
  companyName: 'TechGiant Inc.',
  interviewType: 'TECHNICAL',
  companyInfo: {
    description: 'A Fortune 500 technology company specializing in cloud services',
    culture: 'Fast-paced, innovation-driven, collaborative',
    values: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Earn Trust'],
  },
  recentNews: [
    { headline: 'TechGiant launches new AI platform', date: '2024-01-10' },
    { headline: 'Company reports record quarterly earnings', date: '2024-01-05' },
  ],
  commonQuestions: [
    { question: 'Tell me about yourself.', category: 'INTRODUCTION', difficulty: 'EASY' },
    { question: 'Why TechGiant?', category: 'MOTIVATION', difficulty: 'EASY' },
    { question: 'Describe your biggest technical challenge.', category: 'EXPERIENCE', difficulty: 'MEDIUM' },
  ],
  technicalQuestions: [
    { question: 'Design a URL shortener service.', category: 'SYSTEM_DESIGN', difficulty: 'MEDIUM' },
    { question: 'How would you optimize a slow database query?', category: 'TECHNICAL', difficulty: 'MEDIUM' },
    { question: 'Explain the CAP theorem.', category: 'TECHNICAL', difficulty: 'HARD' },
  ],
  behavioralQuestions: [
    { question: 'Tell me about a time you disagreed with your manager.', framework: 'STAR', category: 'CONFLICT' },
    { question: 'Describe a project you led from start to finish.', framework: 'STAR', category: 'LEADERSHIP' },
  ],
  situationalQuestions: [
    { question: 'What would you do if a critical bug was found right before release?', category: 'PROBLEM_SOLVING' },
  ],
  companySpecificQuestions: [
    { question: 'How do you embody Customer Obsession?', category: 'VALUES' },
  ],
  sampleAnswers: {
    'Tell me about yourself': 'I am a Senior Software Engineer with 6 years of experience building scalable distributed systems...',
    'Why TechGiant?': 'I\'m drawn to TechGiant\'s leadership in cloud innovation and your culture of ownership...',
  },
  answerFrameworks: {
    STAR: { situation: 'Set the context', task: 'Your responsibility', action: 'What you did', result: 'The outcome' },
    CAR: { challenge: 'The problem', action: 'Your approach', result: 'The impact' },
  },
  keyPointsToMention: ['Quantifiable achievements', 'Leadership examples', 'Technical depth', 'Alignment with values'],
  thingsToAvoid: ['Negative talk about past employers', 'Vague answers', 'Lack of specifics'],
  questionsForInterviewer: [
    'What does success look like in the first 90 days?',
    'How does the team approach technical debt?',
    'What are the biggest challenges facing the team?',
  ],
  questionsToAvoid: ['What does your company do?', 'How soon can I get promoted?'],
  preparationChecklist: [
    'Review company leadership principles',
    'Prepare 5 STAR stories',
    'Review system design fundamentals',
    'Research recent company news',
    'Prepare questions to ask',
  ],
  dayOfTips: [
    'Join video call 5 minutes early',
    'Have water nearby',
    'Test camera and microphone',
    'Have notes ready but don\'t read from them',
  ],
  commonMistakes: [
    'Not asking clarifying questions',
    'Jumping to solutions too quickly',
    'Not explaining thought process',
  ],
  bodyLanguageTips: ['Maintain eye contact', 'Nod to show engagement', 'Sit up straight'],
  preparednessScore: 45,
  practiceSessionsCompleted: 2,
  estimatedConfidence: 60,
  status: 'PREPARING',
  modelVersion: 'interview-prep-v1.0',
  createdAt: new Date('2024-01-19'),
  updatedAt: new Date('2024-01-19'),
};

const mockSalaryAdvice: SalaryNegotiationAdvice = {
  id: 'sna-001',
  userId: 'user-001',
  jobTitle: 'Senior Software Engineer',
  companyName: 'TechStartup Co.',
  location: 'San Francisco, CA',
  industry: 'Technology',
  currentSalary: 150000,
  yearsExperience: 6,
  offeredSalary: 175000,
  offeredBonus: 15000,
  offeredEquity: { type: 'RSU', value: 50000, vesting: '4 years' },
  marketData: {
    minimum: 160000,
    maximum: 220000,
    median: 185000,
    percentile25: 168000,
    percentile75: 200000,
    percentile90: 215000,
  },
  percentilePosition: 35,
  marketTrend: 'RISING',
  demandLevel: 'HIGH',
  targetSalary: 195000,
  minimumAcceptable: 182000,
  anchorNumber: 205000,
  negotiationRange: { min: 182000, max: 205000, target: 195000 },
  negotiationScript: {
    opener: 'Thank you for the offer. I\'m very excited about this opportunity at TechStartup Co.',
    valueProposition: 'With my 6 years of experience and track record of delivering high-impact projects, I believe I can bring significant value.',
    ask: 'Based on my research for Senior Software Engineer roles in San Francisco, I was hoping for a base salary closer to $195,000.',
    closing: 'I\'m committed to making this work and confident we can find a mutually beneficial arrangement.',
  },
  counterArguments: {
    'budget constraints': 'I understand. Could we explore a signing bonus or accelerated review?',
    'standard offer': 'I appreciate that, but my specialized experience warrants additional consideration.',
  },
  timingAdvice: {
    when: 'After receiving written offer',
    deadline: 'Within 2-3 days',
    bestTime: 'Tuesday-Thursday mid-morning',
  },
  leveragePoints: [
    '6 years of relevant experience',
    'Specialized skills in distributed systems',
    'Strong track record of delivery',
    'Current market demand is high',
  ],
  alternativeAsk: {
    signingBonus: 'Request $20,000 signing bonus',
    reviewTimeline: 'Request 6-month review instead of annual',
    title: 'Negotiate for Staff Engineer title',
    startDate: 'Negotiate later start for relocation',
  },
  benefitsNegotiation: {
    pto: 'Request additional 5 days PTO',
    remote: 'Negotiate 3 days remote',
    education: 'Request $5,000 learning budget',
    equipment: 'Request $2,000 home office stipend',
  },
  signingBonusAdvice: { suggested: 20000, reasoning: 'To bridge the gap between offer and market target' },
  equityNegotiation: { vesting: 'Request 3-year vesting with 6-month cliff', amount: 'Ask for 25% more equity' },
  riskLevel: 'LOW',
  offerRescindRisk: 5,
  marketAlternatives: ['Strong market demand', 'Multiple companies hiring for similar roles'],
  status: 'ADVISING',
  modelVersion: 'salary-advisor-v1.0',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
};

// ============================================
// API FUNCTIONS
// ============================================

// 2.3.1 - Profile Enhancement API
export const profileEnhancementAPI = {
  enhance: async (data: EnhanceProfileRequest): Promise<ProfileEnhancement> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        ...mockProfileEnhancement,
        id: `pe-${Date.now()}`,
        profileSection: data.profileSection,
        currentContent: data.currentContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/profile/enhance`, data);
    return response.data;
  },

  getAll: async (params?: {
    section?: ProfileSection;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ enhancements: ProfileEnhancement[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { enhancements: [mockProfileEnhancement], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/profile/enhancements`, { params });
    return response.data;
  },

  apply: async (id: string): Promise<ProfileEnhancement> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockProfileEnhancement, id, status: 'APPLIED', appliedAt: new Date() };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/profile/enhancement/${id}/apply`);
    return response.data;
  },
};

// 2.3.2 - Experience Description API
export const experienceDescriptionAPI = {
  generate: async (data: GenerateExperienceRequest): Promise<ExperienceDescription> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockExperienceDescription,
        id: `ed-${Date.now()}`,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        industry: data.industry,
        duration: data.duration,
        technologies: data.technologies,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/experience/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ descriptions: ExperienceDescription[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { descriptions: [mockExperienceDescription], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/experience/descriptions`, { params });
    return response.data;
  },
};

// 2.3.3 - Skills Gap API
export const skillsGapAPI = {
  analyze: async (data: AnalyzeSkillsGapRequest): Promise<SkillsGapAnalysis> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      return {
        ...mockSkillsGapAnalysis,
        id: `sga-${Date.now()}`,
        targetJobTitle: data.targetJobTitle,
        targetIndustry: data.targetIndustry,
        targetSeniority: data.targetSeniority,
        currentSkills: data.currentSkills || mockSkillsGapAnalysis.currentSkills,
        analyzedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/skills-gap/analyze`, data);
    return response.data;
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ analyses: SkillsGapAnalysis[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { analyses: [mockSkillsGapAnalysis], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/skills-gap/analyses`, { params });
    return response.data;
  },
};

// 2.3.4 - Cover Letter API
export const coverLetterAPI = {
  generate: async (data: GenerateCoverLetterRequest): Promise<CoverLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockCoverLetter,
        id: `cl-${Date.now()}`,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        jobDescription: data.jobDescription,
        whyInterested: data.whyInterested,
        relevantExperience: data.relevantExperience,
        keyAchievements: data.keyAchievements,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/cover-letter/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ coverLetters: CoverLetter[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { coverLetters: [mockCoverLetter], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/cover-letters`, { params });
    return response.data;
  },

  update: async (id: string, data: Partial<CoverLetter>): Promise<CoverLetter> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockCoverLetter, id, ...data, updatedAt: new Date() };
    }
    const response = await axios.put(`${API_BASE_URL}/candidate-ai/cover-letter/${id}`, data);
    return response.data;
  },
};

// 2.3.5 - Interview Prep API
export const interviewPrepAPI = {
  generate: async (data: GenerateInterviewPrepRequest): Promise<InterviewPrep> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockInterviewPrep,
        id: `ip-${Date.now()}`,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        interviewType: data.interviewType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/interview-prep/generate`, data);
    return response.data;
  },

  getAll: async (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ preps: InterviewPrep[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { preps: [mockInterviewPrep], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/interview-preps`, { params });
    return response.data;
  },

  recordPractice: async (
    id: string,
    data: { answers: Record<string, string>; feedback: Record<string, unknown> }
  ): Promise<InterviewPrep> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...mockInterviewPrep,
        id,
        practiceSessionsCompleted: mockInterviewPrep.practiceSessionsCompleted + 1,
        preparednessScore: Math.min(100, (mockInterviewPrep.preparednessScore || 0) + 10),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/interview-prep/${id}/practice`, data);
    return response.data;
  },
};

// 2.3.6 - Salary Negotiation API
export const salaryNegotiationAPI = {
  getAdvice: async (data: GetSalaryAdviceRequest): Promise<SalaryNegotiationAdvice> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        ...mockSalaryAdvice,
        id: `sna-${Date.now()}`,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        location: data.location,
        industry: data.industry,
        currentSalary: data.currentSalary,
        yearsExperience: data.yearsExperience,
        offeredSalary: data.offeredSalary,
        offeredBonus: data.offeredBonus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/salary/advice`, data);
    return response.data;
  },

  getHistory: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ advices: SalaryNegotiationAdvice[]; total: number }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { advices: [mockSalaryAdvice], total: 1 };
    }
    const response = await axios.get(`${API_BASE_URL}/candidate-ai/salary/history`, { params });
    return response.data;
  },

  recordOutcome: async (id: string, data: RecordNegotiationOutcomeRequest): Promise<SalaryNegotiationAdvice> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...mockSalaryAdvice,
        id,
        finalSalary: data.finalSalary,
        finalBonus: data.finalBonus,
        finalEquity: data.finalEquity,
        negotiationOutcome: data.outcome,
        lessonsLearned: data.lessonsLearned,
        status: 'COMPLETED',
        updatedAt: new Date(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/candidate-ai/salary/${id}/outcome`, data);
    return response.data;
  },
};

// Export all APIs
export default {
  profileEnhancement: profileEnhancementAPI,
  experienceDescription: experienceDescriptionAPI,
  skillsGap: skillsGapAPI,
  coverLetter: coverLetterAPI,
  interviewPrep: interviewPrepAPI,
  salaryNegotiation: salaryNegotiationAPI,
};
