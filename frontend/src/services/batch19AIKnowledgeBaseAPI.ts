import axios from 'axios';
import type {
  CompanyKnowledge,
  RoleSpecificKnowledge,
  InterviewPlaybook,
  BestPractice,
  CompetitorIntelligence,
  DynamicFAQ,
  AIFeedbackLearning,
  CustomEvaluationCriteria,
  KnowledgeBaseStats,
  FeedbackAnalytics,
  CreateCompanyKnowledgeInput,
  CreateRoleKnowledgeInput,
  CreatePlaybookInput,
  CreateBestPracticeInput,
  CreateCompetitorIntelInput,
  CreateFAQInput,
  SubmitAIFeedbackInput,
  CreateEvaluationCriteriaInput,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// ============================================
// MOCK DATA
// ============================================

const mockCompanyKnowledge: CompanyKnowledge[] = [
  {
    id: 'ck-1',
    companyName: 'TechCorp Inc.',
    documentType: 'CULTURE',
    title: 'Company Values & Culture Guide',
    description: 'Our core values and cultural principles',
    content: 'At TechCorp, we believe in innovation, collaboration, and continuous learning...',
    contentFormat: 'MARKDOWN',
    extractedTopics: ['innovation', 'teamwork', 'growth'],
    extractedKeywords: ['collaboration', 'excellence', 'transparency'],
    category: 'CULTURE',
    tags: ['values', 'culture', 'core'],
    isProcessed: true,
    processedAt: '2024-01-15T10:00:00Z',
    summaryText: 'TechCorp values innovation, teamwork, and continuous growth.',
    version: 1,
    isPublic: true,
    allowedRoles: [],
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ck-2',
    companyName: 'TechCorp Inc.',
    documentType: 'BENEFITS',
    title: 'Employee Benefits Package',
    description: 'Comprehensive benefits information',
    content: 'Our benefits include health insurance, 401k matching, unlimited PTO...',
    contentFormat: 'TEXT',
    extractedTopics: ['healthcare', 'retirement', 'time-off'],
    extractedKeywords: ['insurance', '401k', 'PTO', 'wellness'],
    category: 'BENEFITS',
    tags: ['benefits', 'compensation', 'perks'],
    isProcessed: true,
    processedAt: '2024-01-16T10:00:00Z',
    summaryText: 'Comprehensive benefits including health, retirement, and flexible time off.',
    version: 2,
    isPublic: true,
    allowedRoles: [],
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

const mockRoleKnowledge: RoleSpecificKnowledge[] = [
  {
    id: 'rk-1',
    jobId: 'job-1',
    roleTitle: 'Senior Software Engineer',
    department: 'Engineering',
    seniorityLevel: 'SENIOR',
    teamName: 'Platform Team',
    teamSize: 8,
    teamDescription: 'Building core platform infrastructure and APIs',
    reportingTo: 'Engineering Manager',
    directReports: 0,
    teamDynamics: 'Agile, collaborative, fast-paced',
    requiredSkills: {
      'TypeScript': { level: 'Expert', weight: 10 },
      'Node.js': { level: 'Expert', weight: 10 },
      'React': { level: 'Advanced', weight: 8 },
      'PostgreSQL': { level: 'Advanced', weight: 7 },
    },
    preferredSkills: {
      'Kubernetes': { level: 'Intermediate', weight: 5 },
      'GraphQL': { level: 'Intermediate', weight: 4 },
    },
    technicalStack: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Redis', 'Docker'],
    toolsUsed: ['VS Code', 'GitHub', 'Jira', 'Slack', 'DataDog'],
    dailyResponsibilities: [
      'Design and implement new features',
      'Code reviews and mentoring',
      'Participate in sprint planning',
      'On-call rotation',
    ],
    projectTypes: ['API development', 'System design', 'Performance optimization'],
    collaboratesWithTeams: ['Product', 'DevOps', 'QA', 'Design'],
    meetingCadence: 'Daily standup, weekly sprint planning, bi-weekly retro',
    currentChallenges: ['Scaling to 10x users', 'Reducing technical debt', 'Improving CI/CD'],
    growthOpportunities: ['Tech lead track', 'Architecture specialization', 'Platform ownership'],
    successMetrics: ['Feature delivery', 'Code quality', 'System reliability', 'Team collaboration'],
    domainKnowledge: ['SaaS', 'Recruitment tech', 'API design'],
    complianceRequirements: ['GDPR', 'SOC2'],
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockPlaybooks: InterviewPlaybook[] = [
  {
    id: 'pb-1',
    name: 'Senior Engineer Technical Interview',
    description: 'Comprehensive technical interview for senior engineering roles',
    roleTitle: 'Senior Software Engineer',
    department: 'Engineering',
    seniorityLevel: 'SENIOR',
    interviewType: 'TECHNICAL',
    duration: 60,
    sections: [
      { name: 'Introduction', duration: 5, type: 'intro', questions: ['Tell me about yourself'] },
      { name: 'System Design', duration: 25, type: 'technical', questions: ['Design a URL shortener'] },
      { name: 'Coding', duration: 20, type: 'coding', questions: ['Implement LRU cache'] },
      { name: 'Q&A', duration: 10, type: 'qa', questions: ['Questions for us?'] },
    ],
    questionSequence: ['intro-1', 'design-1', 'coding-1', 'qa-1'],
    requiredQuestions: ['design-1', 'coding-1'],
    evaluationCriteria: {
      'System Design': { weight: 40, rubric: '1-5 scale based on completeness and scalability' },
      'Coding Skills': { weight: 30, rubric: '1-5 scale based on correctness and efficiency' },
      'Communication': { weight: 20, rubric: '1-5 scale based on clarity and structure' },
      'Culture Fit': { weight: 10, rubric: '1-5 scale based on values alignment' },
    },
    mustPassCriteria: ['System Design >= 3', 'Coding Skills >= 3'],
    redFlagIndicators: [
      'Cannot explain their own code',
      'Dismissive of feedback',
      'No questions about the role',
    ],
    greenFlagIndicators: [
      'Asks clarifying questions',
      'Thinks out loud',
      'Considers edge cases',
    ],
    interviewerTips: [
      'Let them drive the conversation',
      'Give hints if stuck for >5 min',
      'Take notes on problem-solving approach',
    ],
    openingScript: 'Hi, thanks for joining! Today we will do a technical interview...',
    closingScript: 'Thank you for your time. We will get back to you within a week.',
    transitionPhrases: ['Great, let us move on to...', 'Now I would like to explore...'],
    timeBreakdown: { intro: 5, design: 25, coding: 20, qa: 10 },
    timesUsed: 45,
    averageRating: 4.5,
    isTemplate: true,
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockBestPractices: BestPractice[] = [
  {
    id: 'bp-1',
    practiceType: 'QUESTION',
    category: 'Behavioral',
    subcategory: 'Leadership',
    title: 'STAR Method for Behavioral Questions',
    description: 'Use the STAR method to structure behavioral interview questions and evaluate responses',
    detailedExplanation: 'The STAR method (Situation, Task, Action, Result) provides a structured way to ask behavioral questions and evaluate candidate responses...',
    exampleScenario: 'When assessing leadership skills...',
    goodExample: 'Tell me about a time when you had to lead a team through a difficult project. What was the situation, your specific role, actions you took, and the outcome?',
    badExample: 'Are you a good leader?',
    applicableRoles: ['Manager', 'Tech Lead', 'Senior Engineer'],
    applicableSeniorityLevels: ['SENIOR', 'LEAD', 'MANAGER'],
    applicableInterviewTypes: ['BEHAVIORAL', 'CULTURE_FIT'],
    dosList: [
      'Ask for specific examples',
      'Probe for details on their actions',
      'Ask about lessons learned',
    ],
    dontsList: [
      'Accept vague answers',
      'Lead the candidate',
      'Rush through the question',
    ],
    commonMistakes: [
      'Not following up on incomplete answers',
      'Accepting "we" instead of "I"',
    ],
    sourceReference: 'Interview best practices guide v2',
    successRate: 0.85,
    usageCount: 234,
    rating: 4.7,
    ratingsCount: 45,
    tags: ['behavioral', 'leadership', 'STAR'],
    keywords: ['STAR', 'behavioral', 'example', 'situation'],
    isVerified: true,
    verifiedById: 'admin-1',
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
];

const mockCompetitorIntel: CompetitorIntelligence[] = [
  {
    id: 'ci-1',
    competitorName: 'TalentFlow',
    competitorWebsite: 'https://talentflow.io',
    industry: 'HR Tech',
    ourCompany: 'KreupAI',
    competitorSize: '201-500',
    marketPosition: 'CHALLENGER',
    intelligenceType: 'COMPENSATION',
    salaryRanges: {
      'Software Engineer': { min: 120000, max: 180000, median: 150000 },
      'Senior Engineer': { min: 150000, max: 220000, median: 185000 },
    },
    bonusStructure: '10-20% annual bonus',
    equityOfferings: 'RSUs vesting over 4 years',
    benefitsOffered: ['Health', 'Dental', 'Vision', '401k', 'Gym'],
    uniquePerks: ['Unlimited PTO', 'Annual learning stipend'],
    cultureHighlights: ['Fast-paced', 'Remote-first', 'Data-driven'],
    workArrangement: 'REMOTE',
    glassdoorRating: 4.2,
    reviewSummary: 'Good work-life balance, strong engineering culture',
    techStackUsed: ['Python', 'React', 'AWS', 'PostgreSQL'],
    recentTechAdoptions: ['AI/ML features', 'GraphQL'],
    hiringVelocity: 'HIGH',
    openPositionsCount: 45,
    talentFocusAreas: ['ML Engineers', 'Full Stack', 'DevOps'],
    hiringChallenges: ['Senior talent competition'],
    talentPoolOverlap: 0.65,
    poachingRisk: 'MEDIUM',
    retentionStrategies: ['Competitive pay', 'Growth opportunities'],
    strengthsVsUs: ['Larger engineering team', 'More funding'],
    weaknessesVsUs: ['Less AI focus', 'Newer to market'],
    opportunities: ['Win on AI capabilities', 'Target their senior talent'],
    threats: ['They may acquire AI startups', 'Aggressive hiring'],
    dataSource: 'Glassdoor, LinkedIn, Job postings',
    dataConfidence: 'MEDIUM',
    lastVerified: '2024-01-10T10:00:00Z',
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
];

const mockFAQs: DynamicFAQ[] = [
  {
    id: 'faq-1',
    question: 'What is the interview process like?',
    questionVariants: ['How long is the interview process?', 'What are the interview stages?'],
    questionCategory: 'PROCESS',
    answer: 'Our interview process consists of 4 stages: initial screen (30 min), technical interview (60 min), system design (60 min), and final round with leadership (45 min). The entire process typically takes 2-3 weeks.',
    shortAnswer: '4 stages over 2-3 weeks',
    detailedAnswer: 'Our comprehensive interview process is designed to evaluate candidates thoroughly while respecting their time...',
    applicableRoles: [],
    applicableDepartments: [],
    applicableJobIds: [],
    useAIGeneration: false,
    sourceType: 'MANUAL',
    timesAsked: 156,
    helpfulCount: 142,
    notHelpfulCount: 5,
    relatedFAQIds: ['faq-2', 'faq-3'],
    relatedTopics: ['interviews', 'hiring', 'timeline'],
    showToCandidates: true,
    showToInterviewers: true,
    isActive: true,
    isVerified: true,
    verifiedById: 'admin-1',
    createdById: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'faq-2',
    question: 'What benefits do you offer?',
    questionVariants: ['What is included in the compensation package?', 'Do you offer health insurance?'],
    questionCategory: 'BENEFITS',
    answer: 'We offer comprehensive benefits including health/dental/vision insurance, 401k with 4% match, unlimited PTO, $2000 annual learning stipend, home office setup allowance, and flexible work arrangements.',
    shortAnswer: 'Full health benefits, 401k, unlimited PTO, learning stipend',
    applicableRoles: [],
    applicableDepartments: [],
    applicableJobIds: [],
    useAIGeneration: false,
    sourceType: 'MANUAL',
    timesAsked: 203,
    helpfulCount: 195,
    notHelpfulCount: 3,
    relatedFAQIds: ['faq-1'],
    relatedTopics: ['benefits', 'compensation', 'perks'],
    showToCandidates: true,
    showToInterviewers: true,
    isActive: true,
    isVerified: true,
    verifiedById: 'admin-1',
    createdById: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockAIFeedback: AIFeedbackLearning[] = [
  {
    id: 'fb-1',
    feedbackType: 'SCORING_ADJUSTMENT',
    sourceEntityType: 'ANSWER_ANALYSIS',
    sourceEntityId: 'aa-123',
    originalAIOutput: { score: 75, reasoning: 'Good technical depth' },
    aiConfidence: 0.82,
    feedbackById: 'user-1',
    feedbackRating: 3,
    isAccurate: false,
    accuracyPercentage: 60,
    corrections: { score: 85, reasoning: 'Excellent problem-solving approach missed by AI' },
    correctedFields: ['score', 'reasoning'],
    correctionNotes: 'AI missed the creative approach to the system design question',
    errorType: 'UNDERSCORED',
    impactLevel: 'MEDIUM',
    shouldTrainOn: true,
    trainingWeight: 1.0,
    isProcessedForTraining: false,
    relatedPatterns: ['system-design', 'creative-solutions'],
    suggestedImprovement: 'Improve recognition of non-standard but valid approaches',
    wasAddressed: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockEvaluationCriteria: CustomEvaluationCriteria[] = [
  {
    id: 'ec-1',
    companyName: 'TechCorp Inc.',
    department: 'Engineering',
    roleTitle: 'Senior Software Engineer',
    criterionName: 'System Design Thinking',
    criterionCode: 'ENG_SYS_DESIGN',
    description: 'Ability to design scalable, maintainable systems considering trade-offs',
    category: 'TECHNICAL',
    weight: 1.5,
    isMandatory: true,
    isKnockout: false,
    scoringType: 'RUBRIC',
    minScore: 1,
    maxScore: 5,
    passingScore: 3,
    scoringRubric: {
      1: 'Cannot articulate basic system components',
      2: 'Understands basics but misses scalability concerns',
      3: 'Solid design with reasonable trade-offs',
      4: 'Excellent design considering edge cases and growth',
      5: 'Exceptional insight into complex system interactions',
    },
    positiveIndicators: [
      'Asks clarifying questions about requirements',
      'Discusses trade-offs explicitly',
      'Considers failure scenarios',
      'Mentions monitoring and observability',
    ],
    negativeIndicators: [
      'Jumps to solution without understanding requirements',
      'Ignores scalability',
      'Cannot explain technology choices',
    ],
    questionSuggestions: [
      'Design a URL shortening service',
      'Design a rate limiter',
      'How would you scale this to 10x users?',
    ],
    aiKeywords: ['scalability', 'trade-off', 'CAP theorem', 'sharding', 'caching'],
    aiIgnoreKeywords: [],
    industryBenchmark: 3.5,
    internalBenchmark: 3.8,
    topPerformerThreshold: 4.5,
    idealResponse: 'Candidate discusses requirements, proposes architecture, explains trade-offs...',
    acceptableResponse: 'Candidate covers main components with basic scalability discussion...',
    poorResponse: 'Candidate cannot articulate system components or ignores constraints...',
    isActive: true,
    isTemplate: true,
    timesUsed: 67,
    averageScore: 3.6,
    createdById: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockStats: KnowledgeBaseStats = {
  companyKnowledge: 15,
  roleKnowledge: 8,
  playbooks: 12,
  bestPractices: 45,
  competitorIntel: 6,
  faqs: 32,
  aiFeedback: 156,
  evaluationCriteria: 24,
  total: 142,
};

const mockFeedbackAnalytics: FeedbackAnalytics = {
  totalFeedback: 156,
  processedCount: 98,
  addressedCount: 45,
  pendingProcessing: 58,
  byType: [
    { feedbackType: 'SCORING_ADJUSTMENT', _count: { id: 65 }, _avg: { feedbackRating: 3.2 } },
    { feedbackType: 'ASSESSMENT_CORRECTION', _count: { id: 42 }, _avg: { feedbackRating: 2.8 } },
    { feedbackType: 'RED_FLAG_ACCURACY', _count: { id: 28 }, _avg: { feedbackRating: 3.5 } },
  ],
  byEntityType: [
    { sourceEntityType: 'ANSWER_ANALYSIS', _count: { id: 78 } },
    { sourceEntityType: 'SUMMARY', _count: { id: 45 } },
    { sourceEntityType: 'RED_FLAG', _count: { id: 33 } },
  ],
  averageAccuracy: 72.5,
};

// ============================================
// API FUNCTIONS
// ============================================

// Company Knowledge
export const createCompanyKnowledge = async (data: CreateCompanyKnowledgeInput): Promise<CompanyKnowledge> => {
  if (USE_MOCK) {
    const newDoc: CompanyKnowledge = {
      id: `ck-${Date.now()}`,
      ...data,
      contentFormat: data.contentFormat || 'TEXT',
      extractedTopics: [],
      extractedKeywords: [],
      tags: data.tags || [],
      isProcessed: false,
      version: 1,
      isPublic: data.isPublic || false,
      allowedRoles: data.allowedRoles || [],
      isActive: true,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newDoc;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/company-knowledge`, data);
  return response.data.knowledge;
};

export const getCompanyKnowledge = async (filters?: {
  companyName?: string;
  documentType?: string;
  category?: string;
}): Promise<CompanyKnowledge[]> => {
  if (USE_MOCK) return mockCompanyKnowledge;
  const response = await axios.get(`${API_URL}/knowledge-base/company-knowledge`, { params: filters });
  return response.data.documents;
};

export const processCompanyKnowledge = async (id: string): Promise<CompanyKnowledge> => {
  if (USE_MOCK) {
    const doc = mockCompanyKnowledge.find(d => d.id === id);
    if (doc) {
      doc.isProcessed = true;
      doc.processedAt = new Date().toISOString();
    }
    return doc!;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/company-knowledge/${id}/process`);
  return response.data.document;
};

// Role Knowledge
export const createRoleKnowledge = async (data: CreateRoleKnowledgeInput): Promise<RoleSpecificKnowledge> => {
  if (USE_MOCK) {
    const newKnowledge: RoleSpecificKnowledge = {
      id: `rk-${Date.now()}`,
      ...data,
      technicalStack: data.technicalStack || [],
      toolsUsed: data.toolsUsed || [],
      dailyResponsibilities: data.dailyResponsibilities || [],
      projectTypes: data.projectTypes || [],
      collaboratesWithTeams: data.collaboratesWithTeams || [],
      currentChallenges: data.currentChallenges || [],
      growthOpportunities: data.growthOpportunities || [],
      successMetrics: data.successMetrics || [],
      domainKnowledge: data.domainKnowledge || [],
      complianceRequirements: data.complianceRequirements || [],
      isActive: true,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newKnowledge;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/role-knowledge`, data);
  return response.data.knowledge;
};

export const getRoleKnowledge = async (filters?: {
  jobId?: string;
  roleTitle?: string;
  department?: string;
}): Promise<RoleSpecificKnowledge[]> => {
  if (USE_MOCK) return mockRoleKnowledge;
  const response = await axios.get(`${API_URL}/knowledge-base/role-knowledge`, { params: filters });
  return response.data.knowledge;
};

// Playbooks
export const createPlaybook = async (data: CreatePlaybookInput): Promise<InterviewPlaybook> => {
  if (USE_MOCK) {
    const newPlaybook: InterviewPlaybook = {
      id: `pb-${Date.now()}`,
      ...data,
      duration: data.duration || 60,
      sections: data.sections || [],
      questionSequence: data.questionSequence || [],
      evaluationCriteria: data.evaluationCriteria || {},
      mustPassCriteria: data.mustPassCriteria || [],
      redFlagIndicators: data.redFlagIndicators || [],
      greenFlagIndicators: data.greenFlagIndicators || [],
      interviewerTips: data.interviewerTips || [],
      transitionPhrases: data.transitionPhrases || [],
      timesUsed: 0,
      isTemplate: data.isTemplate || false,
      isActive: true,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newPlaybook;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/playbooks`, data);
  return response.data.playbook;
};

export const getPlaybooks = async (filters?: {
  roleTitle?: string;
  interviewType?: string;
  isTemplate?: boolean;
}): Promise<InterviewPlaybook[]> => {
  if (USE_MOCK) return mockPlaybooks;
  const response = await axios.get(`${API_URL}/knowledge-base/playbooks`, { params: filters });
  return response.data.playbooks;
};

export const clonePlaybook = async (id: string, name?: string): Promise<InterviewPlaybook> => {
  if (USE_MOCK) {
    const original = mockPlaybooks.find(p => p.id === id);
    if (original) {
      const clone: InterviewPlaybook = {
        ...original,
        id: `pb-${Date.now()}`,
        name: name || `${original.name} (Copy)`,
        isTemplate: false,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return clone;
    }
    throw new Error('Playbook not found');
  }
  const response = await axios.post(`${API_URL}/knowledge-base/playbooks/${id}/clone`, { name });
  return response.data.playbook;
};

// Best Practices
export const createBestPractice = async (data: CreateBestPracticeInput): Promise<BestPractice> => {
  if (USE_MOCK) {
    const newPractice: BestPractice = {
      id: `bp-${Date.now()}`,
      ...data,
      applicableRoles: data.applicableRoles || [],
      applicableSeniorityLevels: data.applicableSeniorityLevels || [],
      applicableInterviewTypes: data.applicableInterviewTypes || [],
      dosList: data.dosList || [],
      dontsList: data.dontsList || [],
      commonMistakes: data.commonMistakes || [],
      tags: data.tags || [],
      keywords: data.keywords || [],
      usageCount: 0,
      rating: 0,
      ratingsCount: 0,
      isVerified: false,
      isActive: true,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newPractice;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/best-practices`, data);
  return response.data.practice;
};

export const getBestPractices = async (filters?: {
  practiceType?: string;
  category?: string;
  isVerified?: boolean;
}): Promise<BestPractice[]> => {
  if (USE_MOCK) return mockBestPractices;
  const response = await axios.get(`${API_URL}/knowledge-base/best-practices`, { params: filters });
  return response.data.practices;
};

export const rateBestPractice = async (id: string, rating: number): Promise<BestPractice> => {
  if (USE_MOCK) {
    const practice = mockBestPractices.find(p => p.id === id);
    if (practice) {
      practice.ratingsCount += 1;
      practice.rating = ((practice.rating * (practice.ratingsCount - 1)) + rating) / practice.ratingsCount;
    }
    return practice!;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/best-practices/${id}/rate`, { rating });
  return response.data.practice;
};

// Competitor Intelligence
export const createCompetitorIntel = async (data: CreateCompetitorIntelInput): Promise<CompetitorIntelligence> => {
  if (USE_MOCK) {
    const newIntel: CompetitorIntelligence = {
      id: `ci-${Date.now()}`,
      ...data,
      benefitsOffered: data.benefitsOffered || [],
      uniquePerks: data.uniquePerks || [],
      cultureHighlights: data.cultureHighlights || [],
      techStackUsed: data.techStackUsed || [],
      recentTechAdoptions: data.recentTechAdoptions || [],
      talentFocusAreas: data.talentFocusAreas || [],
      hiringChallenges: data.hiringChallenges || [],
      retentionStrategies: data.retentionStrategies || [],
      strengthsVsUs: data.strengthsVsUs || [],
      weaknessesVsUs: data.weaknessesVsUs || [],
      opportunities: data.opportunities || [],
      threats: data.threats || [],
      dataConfidence: data.dataConfidence || 'MEDIUM',
      isActive: true,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newIntel;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/competitor-intel`, data);
  return response.data.intel;
};

export const getCompetitorIntel = async (filters?: {
  competitorName?: string;
  industry?: string;
  intelligenceType?: string;
}): Promise<CompetitorIntelligence[]> => {
  if (USE_MOCK) return mockCompetitorIntel;
  const response = await axios.get(`${API_URL}/knowledge-base/competitor-intel`, { params: filters });
  return response.data.intel;
};

// FAQs
export const createFAQ = async (data: CreateFAQInput): Promise<DynamicFAQ> => {
  if (USE_MOCK) {
    const newFAQ: DynamicFAQ = {
      id: `faq-${Date.now()}`,
      ...data,
      questionVariants: data.questionVariants || [],
      applicableRoles: data.applicableRoles || [],
      applicableDepartments: data.applicableDepartments || [],
      applicableJobIds: data.applicableJobIds || [],
      useAIGeneration: data.useAIGeneration || false,
      sourceType: data.sourceType || 'MANUAL',
      timesAsked: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      relatedFAQIds: data.relatedFAQIds || [],
      relatedTopics: data.relatedTopics || [],
      showToCandidates: data.showToCandidates !== false,
      showToInterviewers: data.showToInterviewers !== false,
      isActive: true,
      isVerified: false,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newFAQ;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/faqs`, data);
  return response.data.faq;
};

export const getFAQs = async (filters?: {
  questionCategory?: string;
  showToCandidates?: boolean;
}): Promise<DynamicFAQ[]> => {
  if (USE_MOCK) return mockFAQs;
  const response = await axios.get(`${API_URL}/knowledge-base/faqs`, { params: filters });
  return response.data.faqs;
};

export const searchFAQs = async (query: string, category?: string): Promise<DynamicFAQ[]> => {
  if (USE_MOCK) {
    return mockFAQs.filter(
      faq => faq.question.toLowerCase().includes(query.toLowerCase()) ||
             faq.answer.toLowerCase().includes(query.toLowerCase())
    );
  }
  const response = await axios.get(`${API_URL}/knowledge-base/faqs/search`, { params: { query, category } });
  return response.data.faqs;
};

export const rateFAQ = async (id: string, helpful: boolean): Promise<DynamicFAQ> => {
  if (USE_MOCK) {
    const faq = mockFAQs.find(f => f.id === id);
    if (faq) {
      if (helpful) faq.helpfulCount += 1;
      else faq.notHelpfulCount += 1;
    }
    return faq!;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/faqs/${id}/rate`, { helpful });
  return response.data.faq;
};

// AI Feedback
export const submitAIFeedback = async (data: SubmitAIFeedbackInput): Promise<AIFeedbackLearning> => {
  if (USE_MOCK) {
    const newFeedback: AIFeedbackLearning = {
      id: `fb-${Date.now()}`,
      ...data,
      feedbackById: 'current-user',
      correctedFields: data.correctedFields || [],
      impactLevel: data.impactLevel || 'MEDIUM',
      shouldTrainOn: data.shouldTrainOn !== false,
      trainingWeight: 1.0,
      isProcessedForTraining: false,
      relatedPatterns: data.relatedPatterns || [],
      wasAddressed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newFeedback;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/ai-feedback`, data);
  return response.data.feedback;
};

export const getAIFeedback = async (filters?: {
  feedbackType?: string;
  sourceEntityType?: string;
  isProcessedForTraining?: boolean;
}): Promise<AIFeedbackLearning[]> => {
  if (USE_MOCK) return mockAIFeedback;
  const response = await axios.get(`${API_URL}/knowledge-base/ai-feedback`, { params: filters });
  return response.data.feedback;
};

export const getFeedbackAnalytics = async (): Promise<FeedbackAnalytics> => {
  if (USE_MOCK) return mockFeedbackAnalytics;
  const response = await axios.get(`${API_URL}/knowledge-base/ai-feedback/analytics`);
  return response.data.analytics;
};

export const markFeedbackProcessed = async (id: string): Promise<AIFeedbackLearning> => {
  if (USE_MOCK) {
    const feedback = mockAIFeedback.find(f => f.id === id);
    if (feedback) {
      feedback.isProcessedForTraining = true;
      feedback.processedAt = new Date().toISOString();
    }
    return feedback!;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/ai-feedback/${id}/process`);
  return response.data.feedback;
};

// Evaluation Criteria
export const createEvaluationCriteria = async (data: CreateEvaluationCriteriaInput): Promise<CustomEvaluationCriteria> => {
  if (USE_MOCK) {
    const newCriteria: CustomEvaluationCriteria = {
      id: `ec-${Date.now()}`,
      ...data,
      weight: data.weight || 1.0,
      isMandatory: data.isMandatory || false,
      isKnockout: data.isKnockout || false,
      scoringType: data.scoringType || 'NUMERIC',
      minScore: data.minScore || 0,
      maxScore: data.maxScore || 5,
      positiveIndicators: data.positiveIndicators || [],
      negativeIndicators: data.negativeIndicators || [],
      questionSuggestions: data.questionSuggestions || [],
      aiKeywords: data.aiKeywords || [],
      aiIgnoreKeywords: data.aiIgnoreKeywords || [],
      isActive: true,
      isTemplate: data.isTemplate || false,
      timesUsed: 0,
      createdById: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newCriteria;
  }
  const response = await axios.post(`${API_URL}/knowledge-base/evaluation-criteria`, data);
  return response.data.criterion;
};

export const getEvaluationCriteria = async (filters?: {
  companyName?: string;
  category?: string;
  roleTitle?: string;
  isTemplate?: boolean;
}): Promise<CustomEvaluationCriteria[]> => {
  if (USE_MOCK) return mockEvaluationCriteria;
  const response = await axios.get(`${API_URL}/knowledge-base/evaluation-criteria`, { params: filters });
  return response.data.criteria;
};

export const cloneEvaluationCriteria = async (id: string, name?: string, code?: string): Promise<CustomEvaluationCriteria> => {
  if (USE_MOCK) {
    const original = mockEvaluationCriteria.find(c => c.id === id);
    if (original) {
      const clone: CustomEvaluationCriteria = {
        ...original,
        id: `ec-${Date.now()}`,
        criterionName: name || `${original.criterionName} (Copy)`,
        criterionCode: code || `${original.criterionCode}_COPY`,
        isTemplate: false,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return clone;
    }
    throw new Error('Criteria not found');
  }
  const response = await axios.post(`${API_URL}/knowledge-base/evaluation-criteria/${id}/clone`, { criterionName: name, criterionCode: code });
  return response.data.criterion;
};

// Stats
export const getKnowledgeBaseStats = async (): Promise<KnowledgeBaseStats> => {
  if (USE_MOCK) return mockStats;
  const response = await axios.get(`${API_URL}/knowledge-base/stats`);
  return response.data.stats;
};
