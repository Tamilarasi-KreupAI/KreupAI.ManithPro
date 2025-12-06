import axios from 'axios';
import {
  GeneratedJobDescription,
  GenerateJobDescriptionInput,
  JobTitleSuggestion,
  RequirementsAnalysis,
  InclusiveLanguageCheck,
  SalaryRangeSuggestion,
  GeneratedInterviewQuestions,
  GenerateInterviewQuestionsInput,
  SeniorityLevel,
  EmploymentType,
  WorkMode,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockJobDescription: GeneratedJobDescription = {
  id: 'jd-001',
  companyId: 'company-001',
  createdById: 'user-001',
  jobTitle: 'Senior Software Engineer',
  department: 'Engineering',
  seniorityLevel: 'SENIOR',
  employmentType: 'FULL_TIME',
  workMode: 'HYBRID',
  location: 'San Francisco, CA',
  requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  preferredSkills: ['GraphQL', 'AWS', 'Docker'],
  yearsExperience: 5,
  educationLevel: 'BACHELORS',
  generatedTitle: 'Senior Software Engineer - Full Stack',
  generatedSummary: 'We are seeking a talented Senior Software Engineer to join our dynamic Engineering team. In this hybrid role based in San Francisco, you will architect and implement scalable solutions that power our core platform.',
  generatedResponsibilities: [
    'Design and implement scalable backend services using Node.js and PostgreSQL',
    'Build responsive, performant frontend applications with React and TypeScript',
    'Lead technical discussions and mentor junior engineers',
    'Collaborate with product and design teams to deliver exceptional user experiences',
    'Participate in code reviews and maintain high code quality standards',
  ],
  generatedRequirements: [
    { skill: 'React', level: 'Expert', required: true },
    { skill: 'TypeScript', level: 'Expert', required: true },
    { skill: 'Node.js', level: 'Proficient', required: true },
    { skill: 'PostgreSQL', level: 'Proficient', required: true },
    { skill: 'GraphQL', level: 'Familiar', required: false },
    { skill: 'AWS', level: 'Familiar', required: false },
  ],
  generatedBenefits: [
    'Competitive salary ($150k - $200k) and equity package',
    'Comprehensive health, dental, and vision insurance',
    'Flexible hybrid work arrangement',
    '$3,000 annual learning and development budget',
    'Unlimited PTO policy',
  ],
  generatedQualifications: [
    '5+ years of professional software engineering experience',
    'Bachelor\'s degree in Computer Science or equivalent experience',
    'Strong proficiency in React, TypeScript, and Node.js',
    'Experience with SQL databases and API design',
    'Excellent communication and collaboration skills',
  ],
  fullDescription: '# Senior Software Engineer - Full Stack\n\n## About the Role\nWe are seeking a talented Senior Software Engineer...',
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTitleSuggestion: JobTitleSuggestion = {
  id: 'ts-001',
  originalTitle: 'Sr. Full Stack Dev',
  createdById: 'user-001',
  suggestions: [
    {
      title: 'Senior Full Stack Engineer',
      seoScore: 92,
      inclusivityScore: 95,
      clarityScore: 90,
      industryMatch: 88,
      reasoning: 'Engineer is more widely searched; spelled out seniority is clearer',
    },
    {
      title: 'Senior Software Engineer - Full Stack',
      seoScore: 90,
      inclusivityScore: 93,
      clarityScore: 95,
      industryMatch: 92,
      reasoning: 'Most comprehensive and searchable format',
    },
    {
      title: 'Full Stack Developer (Senior)',
      seoScore: 85,
      inclusivityScore: 92,
      clarityScore: 88,
      industryMatch: 85,
      reasoning: 'Alternative format with seniority indicator',
    },
  ],
  recommendedTitle: 'Senior Full Stack Engineer',
  recommendationReason: 'This title balances SEO optimization, inclusivity, and industry standards. "Engineer" is gender-neutral and widely searched.',
  originalTitleIssues: [
    { issue: 'Abbreviated seniority (Sr.) may reduce search visibility', severity: 'low' },
    { issue: '"Dev" is less formal than "Developer" or "Engineer"', severity: 'low' },
  ],
  keywordAnalysis: {
    topKeywords: ['full stack', 'engineer', 'developer', 'senior', 'software'],
    searchVolume: {
      high: ['software engineer', 'full stack developer'],
      medium: ['full stack engineer', 'senior developer'],
      low: ['full stack dev', 'sr developer'],
    },
  },
  competitorTitles: [
    'Senior Software Engineer',
    'Full Stack Developer',
    'Staff Engineer',
    'Senior Full Stack Developer',
  ],
  industryTrends: {
    rising: ['Staff Engineer', 'Platform Engineer', 'AI/ML Engineer'],
    stable: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer'],
    declining: ['Programmer', 'Coder', 'Web Developer'],
  },
  originalSeoScore: 72,
  originalInclusivityScore: 85,
  improvedSeoScore: 92,
  improvedInclusivityScore: 95,
  modelVersion: 'gpt-4-turbo-preview',
  createdAt: new Date().toISOString(),
};

const mockRequirementsAnalysis: RequirementsAnalysis = {
  id: 'ra-001',
  createdById: 'user-001',
  rawRequirements: '5+ years experience\nReact and TypeScript\nNode.js experience\nComputer Science degree\nExcellent communication',
  jobTitle: 'Senior Software Engineer',
  essentialRequirements: [
    { requirement: '5+ years of software engineering experience', importance: 'CRITICAL', category: 'EXPERIENCE', reasoning: 'Aligns with senior-level expectations' },
    { requirement: 'Strong proficiency in React and TypeScript', importance: 'CRITICAL', category: 'TECHNICAL', reasoning: 'Core technology stack for the role' },
    { requirement: 'Experience with Node.js', importance: 'HIGH', category: 'TECHNICAL', reasoning: 'Backend technology requirement' },
  ],
  niceToHaveRequirements: [
    { requirement: 'Computer Science degree', importance: 'PREFERRED', category: 'EDUCATION', reasoning: 'Valuable but not strictly necessary with equivalent experience' },
    { requirement: 'Excellent communication skills', importance: 'MEDIUM', category: 'SOFT_SKILL', reasoning: 'Important for team collaboration' },
  ],
  technicalSkills: [
    { requirement: 'React', importance: 'CRITICAL', category: 'FRONTEND', reasoning: 'Primary frontend framework' },
    { requirement: 'TypeScript', importance: 'CRITICAL', category: 'LANGUAGE', reasoning: 'Required for type-safe development' },
    { requirement: 'Node.js', importance: 'HIGH', category: 'BACKEND', reasoning: 'Server-side runtime' },
  ],
  softSkills: [
    { skill: 'Communication', importance: 'HIGH' },
    { skill: 'Problem-solving', importance: 'HIGH' },
    { skill: 'Teamwork', importance: 'MEDIUM' },
  ],
  educationRequirements: [
    { level: 'BACHELORS', field: 'Computer Science or related', required: false },
  ],
  experienceRequirements: [
    { years: '5+', type: 'software engineering', required: true },
  ],
  overlyRestrictive: [],
  potentiallyBiased: [],
  marketMismatch: [],
  recommendations: [
    'Consider accepting equivalent experience in lieu of degree',
    'Specify which technologies are truly required vs nice-to-have',
    'Add information about remote work possibilities',
  ],
  essentialCount: 3,
  niceToHaveCount: 2,
  restrictiveScore: 25,
  marketAlignmentScore: 85,
  modelVersion: 'gpt-4-turbo-preview',
  createdAt: new Date().toISOString(),
};

const mockInclusiveLanguageCheck: InclusiveLanguageCheck = {
  id: 'ilc-001',
  createdById: 'user-001',
  contentType: 'JOB_DESCRIPTION',
  originalContent: 'We are looking for a rockstar developer who can hit the ground running...',
  overallScore: 75,
  grade: 'C',
  issues: [
    {
      phrase: 'rockstar',
      issue: 'Aggressive/gendered language',
      severity: 'MODERATE',
      category: 'gender',
      suggestion: 'talented professional',
      startIndex: 22,
      endIndex: 30,
    },
    {
      phrase: 'hit the ground running',
      issue: 'May discourage candidates who need onboarding',
      severity: 'MINOR',
      category: 'ability',
      suggestion: 'contribute quickly',
      startIndex: 50,
      endIndex: 72,
    },
  ],
  genderBiasIssues: [
    {
      phrase: 'rockstar',
      issue: 'Aggressive/gendered language',
      severity: 'MODERATE',
      category: 'gender',
      suggestion: 'talented professional',
    },
  ],
  abilityBiasIssues: [
    {
      phrase: 'hit the ground running',
      issue: 'May discourage candidates who need onboarding',
      severity: 'MINOR',
      category: 'ability',
      suggestion: 'contribute quickly',
    },
  ],
  suggestedContent: 'We are looking for a talented professional who can contribute quickly...',
  alternativePhrases: [
    { original: 'rockstar', suggested: 'talented professional', reason: 'More inclusive and professional' },
    { original: 'hit the ground running', suggested: 'contribute quickly', reason: 'Less exclusionary' },
  ],
  issueCount: 2,
  severeIssueCount: 0,
  moderateIssueCount: 1,
  minorIssueCount: 1,
  toneAnalysis: {
    formal: 0.6,
    friendly: 0.7,
    professional: 0.65,
    inclusive: 0.75,
  },
  readabilityLevel: 'Grade 8',
  wordCount: 15,
  modelVersion: 'gpt-4-turbo-preview',
  processingTimeMs: 320,
  createdAt: new Date().toISOString(),
};

const mockSalaryRangeSuggestion: SalaryRangeSuggestion = {
  id: 'srs-001',
  createdById: 'user-001',
  jobTitle: 'Senior Software Engineer',
  normalizedTitle: 'senior_software_engineer',
  location: 'San Francisco, CA, USA',
  country: 'USA',
  state: 'CA',
  city: 'San Francisco',
  seniorityLevel: 'SENIOR',
  yearsExperience: 5,
  requiredSkills: ['React', 'TypeScript', 'Node.js'],
  industry: 'Technology',
  companySize: 'MEDIUM',
  employmentType: 'FULL_TIME',
  currency: 'USD',
  suggestedMin: 175000,
  suggestedMax: 225000,
  suggestedMidpoint: 195000,
  confidenceLevel: 'HIGH',
  confidenceScore: 88,
  marketPercentile25: 150000,
  marketMedian: 185000,
  marketPercentile75: 215000,
  marketPercentile90: 250000,
  industryComparison: 'AT_MARKET',
  locationComparison: 'ABOVE_MARKET',
  companyComparison: 'AT_MARKET',
  salaryFactors: [
    { factor: 'Location', impact: '+40%', description: 'San Francisco premium' },
    { factor: 'Seniority', impact: 'Base', description: 'Senior level compensation' },
    { factor: 'Company Size', impact: '+5%', description: 'Medium company adjustment' },
  ],
  skillPremiums: [
    { skill: 'React', premium: 8 },
    { skill: 'TypeScript', premium: 10 },
    { skill: 'Node.js', premium: 5 },
  ],
  locationAdjustment: 40,
  recommendations: [
    'Consider offering equity to remain competitive in SF market',
    'Include signing bonus for experienced candidates',
    'Highlight remote work flexibility to attract wider talent pool',
  ],
  competitivenessScore: 82,
  dataSources: ['BLS', 'Glassdoor', 'Levels.fyi', 'LinkedIn Salary'],
  dataFreshness: 'Q4 2024',
  sampleSize: 1850,
  modelVersion: 'salary-model-v2',
  calculatedAt: new Date().toISOString(),
};

const mockInterviewQuestions: GeneratedInterviewQuestions = {
  id: 'giq-001',
  createdById: 'user-001',
  jobTitle: 'Senior Software Engineer',
  seniorityLevel: 'SENIOR',
  department: 'Engineering',
  requiredSkills: ['React', 'TypeScript', 'Node.js'],
  interviewRound: 'TECHNICAL',
  interviewDuration: 60,
  questions: [
    {
      question: 'Can you walk me through a complex React application you built? What architectural decisions did you make?',
      category: 'TECHNICAL',
      skill: 'React',
      difficulty: 'MEDIUM',
      expectedDuration: 8,
      evaluationCriteria: ['Technical depth', 'System design thinking', 'Problem-solving approach'],
      followUps: ['How would you handle state management at scale?', 'What testing strategies did you use?'],
      redFlags: ['Cannot explain own code', 'No mention of trade-offs'],
      greenFlags: ['Clear architectural reasoning', 'Awareness of alternatives'],
    },
    {
      question: 'Describe a challenging bug you encountered. How did you debug and resolve it?',
      category: 'BEHAVIORAL',
      skill: 'Problem Solving',
      difficulty: 'MEDIUM',
      expectedDuration: 6,
      evaluationCriteria: ['Debugging methodology', 'Persistence', 'Learning orientation'],
      followUps: ['What would you do differently next time?'],
      redFlags: ['Blames others', 'No systematic approach'],
      greenFlags: ['Methodical debugging', 'Root cause analysis'],
    },
    {
      question: 'If a junior developer submitted a PR with significant issues, how would you handle the code review?',
      category: 'SITUATIONAL',
      skill: 'Mentorship',
      difficulty: 'MEDIUM',
      expectedDuration: 5,
      evaluationCriteria: ['Communication style', 'Teaching ability', 'Empathy'],
      redFlags: ['Dismissive attitude', 'No constructive feedback'],
      greenFlags: ['Supportive approach', 'Focus on learning'],
    },
  ],
  technicalQuestions: [
    {
      question: 'Explain how TypeScript generics work and when you would use them.',
      category: 'TECHNICAL',
      skill: 'TypeScript',
      difficulty: 'HARD',
      expectedDuration: 6,
      evaluationCriteria: ['Depth of TypeScript knowledge', 'Practical application'],
    },
  ],
  behavioralQuestions: [
    {
      question: 'Tell me about a time you disagreed with a technical decision. How did you handle it?',
      category: 'BEHAVIORAL',
      difficulty: 'MEDIUM',
      expectedDuration: 5,
      evaluationCriteria: ['Conflict resolution', 'Professional communication'],
    },
  ],
  situationalQuestions: [
    {
      question: 'You discover a critical security vulnerability days before a major launch. What do you do?',
      category: 'SITUATIONAL',
      difficulty: 'HARD',
      expectedDuration: 5,
      evaluationCriteria: ['Judgment', 'Communication', 'Prioritization'],
    },
  ],
  cultureFitQuestions: [
    {
      question: 'What does a healthy engineering culture look like to you?',
      category: 'CULTURE_FIT',
      difficulty: 'EASY',
      expectedDuration: 4,
      evaluationCriteria: ['Values alignment', 'Self-awareness'],
    },
  ],
  totalQuestions: 7,
  estimatedDuration: 45,
  difficultyDistribution: { easy: 1, medium: 4, hard: 2 },
  scoringRubric: {
    1: 'Does not meet expectations',
    2: 'Partially meets expectations',
    3: 'Meets expectations',
    4: 'Exceeds expectations',
    5: 'Exceptional performance',
  },
  mustAskQuestions: [
    'Can you walk me through a complex React application you built?',
    'Describe a challenging bug you encountered.',
  ],
  optionalQuestions: [
    'What does a healthy engineering culture look like to you?',
  ],
  legalCompliance: true,
  complianceNotes: [
    'Avoid questions about age, marital status, religion, or protected characteristics',
    'Focus on job-related competencies only',
  ],
  avoidedTopics: ['age', 'family', 'religion', 'political views', 'salary history'],
  timesUsed: 0,
  modelVersion: 'gpt-4-turbo-preview',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// API FUNCTIONS
// ============================================

// 2.2.1 - Job Description Generator
export const jobDescriptionAPI = {
  generate: async (input: GenerateJobDescriptionInput): Promise<GeneratedJobDescription> => {
    if (USE_MOCK) {
      return { ...mockJobDescription, ...input, id: `jd-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/job-description/generate`, input);
    return response.data;
  },

  getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<{
    descriptions: GeneratedJobDescription[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    if (USE_MOCK) {
      return {
        descriptions: [mockJobDescription],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/job-descriptions`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<GeneratedJobDescription> => {
    if (USE_MOCK) {
      return mockJobDescription;
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/job-description/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axios.patch(`${API_BASE}/api/ai-content/job-description/${id}/status`, { status });
    return response.data;
  },
};

// 2.2.2 - Job Title Optimizer
export const jobTitleAPI = {
  optimize: async (originalTitle: string, options?: { industry?: string; targetAudience?: string }): Promise<JobTitleSuggestion> => {
    if (USE_MOCK) {
      return { ...mockTitleSuggestion, originalTitle, id: `ts-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/title/optimize`, { originalTitle, ...options });
    return response.data;
  },

  getHistory: async (): Promise<JobTitleSuggestion[]> => {
    if (USE_MOCK) {
      return [mockTitleSuggestion];
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/title/suggestions`);
    return response.data;
  },
};

// 2.2.3 - Requirements Analyzer
export const requirementsAPI = {
  analyze: async (rawRequirements: string, options?: { jobTitle?: string; industry?: string; jobDescriptionId?: string }): Promise<RequirementsAnalysis> => {
    if (USE_MOCK) {
      return { ...mockRequirementsAnalysis, rawRequirements, id: `ra-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/requirements/analyze`, { rawRequirements, ...options });
    return response.data;
  },

  getById: async (id: string): Promise<RequirementsAnalysis> => {
    if (USE_MOCK) {
      return mockRequirementsAnalysis;
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/requirements/${id}`);
    return response.data;
  },
};

// 2.2.4 - Inclusive Language Checker
export const inclusiveLanguageAPI = {
  check: async (content: string, contentType?: string): Promise<InclusiveLanguageCheck> => {
    if (USE_MOCK) {
      return { ...mockInclusiveLanguageCheck, originalContent: content, contentType: contentType as any || 'JOB_DESCRIPTION', id: `ilc-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/language/check`, { content, contentType });
    return response.data;
  },

  getHistory: async (params?: { contentType?: string; page?: number; limit?: number }): Promise<{
    checks: InclusiveLanguageCheck[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    if (USE_MOCK) {
      return {
        checks: [mockInclusiveLanguageCheck],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/language/checks`, { params });
    return response.data;
  },
};

// 2.2.5 - Salary Range Suggester
export const salaryRangeAPI = {
  suggest: async (params: {
    jobTitle: string;
    location: string;
    country: string;
    seniorityLevel: SeniorityLevel;
    state?: string;
    city?: string;
    yearsExperience?: number;
    requiredSkills?: string[];
    industry?: string;
    companySize?: string;
    employmentType?: EmploymentType;
  }): Promise<SalaryRangeSuggestion> => {
    if (USE_MOCK) {
      return { ...mockSalaryRangeSuggestion, ...params, id: `srs-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/salary/suggest`, params);
    return response.data;
  },

  getHistory: async (): Promise<SalaryRangeSuggestion[]> => {
    if (USE_MOCK) {
      return [mockSalaryRangeSuggestion];
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/salary/suggestions`);
    return response.data;
  },
};

// 2.2.6 - Interview Questions Generator
export const interviewQuestionsAPI = {
  generate: async (input: GenerateInterviewQuestionsInput): Promise<GeneratedInterviewQuestions> => {
    if (USE_MOCK) {
      return { ...mockInterviewQuestions, ...input, id: `giq-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/interview-questions/generate`, input);
    return response.data;
  },

  getAll: async (params?: { jobId?: string; interviewRound?: string }): Promise<GeneratedInterviewQuestions[]> => {
    if (USE_MOCK) {
      return [mockInterviewQuestions];
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/interview-questions`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<GeneratedInterviewQuestions> => {
    if (USE_MOCK) {
      return mockInterviewQuestions;
    }
    const response = await axios.get(`${API_BASE}/api/ai-content/interview-questions/${id}`);
    return response.data;
  },

  rate: async (id: string, rating: number, feedback?: string): Promise<{ success: boolean; averageRating: number }> => {
    if (USE_MOCK) {
      return { success: true, averageRating: rating };
    }
    const response = await axios.post(`${API_BASE}/api/ai-content/interview-questions/${id}/rate`, { rating, feedback });
    return response.data;
  },
};
