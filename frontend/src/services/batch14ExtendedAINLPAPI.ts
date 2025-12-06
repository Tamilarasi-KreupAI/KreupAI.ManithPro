import axios from 'axios';
import {
  CareerPathAdvice,
  CareerPathAdviceRequest,
  LearningRecommendation,
  LearningRecommendationRequest,
  ApplicationInsight,
  PortfolioFeedback,
  PortfolioFeedbackRequest,
  ParsedDocument,
  ParseDocumentRequest,
  SkillExtraction,
  ExtractSkillsRequest,
  IndexForSearchRequest,
  SemanticSearchRequest,
  SemanticSearchResponse,
  EntityRecognition,
  RecognizeEntitiesRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockCareerPathAdvice: CareerPathAdvice = {
  id: 'cpa-001',
  userId: 'user-001',
  currentRole: 'Software Engineer',
  currentLevel: 'MID',
  currentIndustry: 'Technology',
  yearsExperience: 5,
  currentSkills: [
    { skill: 'JavaScript', proficiency: 8 },
    { skill: 'React', proficiency: 7 },
    { skill: 'Node.js', proficiency: 6 },
  ],
  currentSalary: 100000,
  targetRoles: ['Engineering Manager', 'Tech Lead'],
  targetLevel: 'MANAGER',
  targetIndustry: 'Technology',
  targetTimeframe: '2_YEARS',
  targetSalary: 150000,
  priorities: { growth: 9, compensation: 8, workLifeBalance: 7 },
  careerPaths: [
    {
      pathId: 1,
      name: 'Direct Promotion Track',
      steps: [
        { step: 1, role: 'Senior Software Engineer', timeline: '6-12 months' },
        { step: 2, role: 'Tech Lead', timeline: '12-24 months' },
        { step: 3, role: 'Engineering Manager', timeline: '24-36 months' },
      ],
      probability: 0.75,
    },
    {
      pathId: 2,
      name: 'Specialist Track',
      steps: [
        { step: 1, role: 'Senior Software Engineer', timeline: '6-12 months' },
        { step: 2, role: 'Staff Engineer', timeline: '18-30 months' },
        { step: 3, role: 'Principal Engineer', timeline: '36-48 months' },
      ],
      probability: 0.65,
    },
  ],
  recommendedPath: {
    pathId: 1,
    name: 'Direct Promotion Track',
    steps: [
      { step: 1, role: 'Senior Software Engineer', timeline: '6-12 months' },
      { step: 2, role: 'Tech Lead', timeline: '12-24 months' },
      { step: 3, role: 'Engineering Manager', timeline: '24-36 months' },
    ],
    probability: 0.75,
    reason: 'Best alignment with stated goals and current trajectory',
    confidence: 0.82,
  },
  milestones: [
    { milestone: 'Complete leadership training', priority: 'HIGH', deadline: '3 months' },
    { milestone: 'Lead cross-functional project', priority: 'HIGH', deadline: '6 months' },
    { milestone: 'Mentor 2 junior developers', priority: 'MEDIUM', deadline: '6 months' },
  ],
  skillGaps: [
    { skill: 'People Management', currentLevel: 0, requiredLevel: 7, priority: 'HIGH' },
    { skill: 'System Design', currentLevel: 5, requiredLevel: 8, priority: 'MEDIUM' },
  ],
  experienceGaps: [
    { experience: 'Team leadership', gap: 'No direct reports', suggestion: 'Lead sprint team' },
    { experience: 'Budget management', gap: 'No budget experience', suggestion: 'Request project ownership' },
  ],
  transitionDifficulty: 'MODERATE',
  timeToTransition: '18-24 months',
  marketDemand: 'HIGH',
  salaryProjection: { current: 100000, year1: 115000, year2: 135000, year3: 160000 },
  riskAssessment: {
    risks: [
      { risk: 'Market downturn', probability: 0.3, impact: 'MEDIUM' },
      { risk: 'Skills outdating', probability: 0.2, impact: 'HIGH' },
    ],
    mitigations: ['Maintain strong network', 'Continuously upskill'],
  },
  immediateActions: ['Schedule 1:1 with manager', 'Enroll in leadership course'],
  shortTermActions: ['Complete 2 cross-functional projects', 'Build presentation skills'],
  mediumTermActions: ['Seek formal leadership training', 'Take on larger scope'],
  longTermActions: ['Build executive presence', 'Develop business acumen'],
  networkingAdvice: { internalConnections: ['Engineering Director', 'Senior PM'] },
  successFactors: ['Consistent high performance', 'Strong relationships'],
  industryTrends: [{ trend: 'Remote management skills valued', impact: 'POSITIVE' }],
  alternativePaths: [{ path: 'IC Track', viability: 'HIGH', reason: 'Strong technical skills' }],
  modelVersion: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockLearningRecommendation: LearningRecommendation = {
  id: 'lr-001',
  userId: 'user-001',
  learningGoal: 'SKILL_GAP',
  targetSkills: ['System Design', 'Cloud Architecture', 'Leadership'],
  currentLevel: 'INTERMEDIATE',
  preferredFormat: ['VIDEO', 'HANDS_ON'],
  timeAvailable: '10 hours/week',
  budget: 500,
  courses: [
    { id: 1, title: 'System Design Masterclass', provider: 'Udemy', duration: '24 hours', rating: 4.8, price: 89.99, skills: ['System Design'], relevance: 0.95 },
    { id: 2, title: 'AWS Solutions Architect', provider: 'A Cloud Guru', duration: '40 hours', rating: 4.7, price: 35, skills: ['AWS', 'Cloud'], relevance: 0.88 },
  ],
  certifications: [
    { name: 'AWS Solutions Architect Professional', provider: 'Amazon', difficulty: 'Advanced', prepTime: '3-6 months', cost: 300, salaryImpact: '+15%' },
  ],
  books: [
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', relevance: 0.95 },
  ],
  tutorials: [
    { title: 'System Design Interview Prep', platform: 'YouTube', duration: '10 hours', free: true },
  ],
  projects: [
    { title: 'Build a URL Shortener', skills: ['System Design', 'Databases'], complexity: 'Medium', estimatedTime: '2 weeks' },
  ],
  communities: [
    { name: 'r/ExperiencedDevs', platform: 'Reddit', members: 150000 },
  ],
  mentorship: { recommendation: 'Seek Staff+ mentor', platforms: ['MentorCruise'] },
  learningPath: [
    { phase: 1, focus: 'System Design Fundamentals', duration: '4 weeks' },
    { phase: 2, focus: 'Cloud Architecture', duration: '6 weeks' },
  ],
  milestones: [
    { week: 4, milestone: 'Complete System Design course' },
    { week: 10, milestone: 'Build 2 portfolio projects' },
  ],
  estimatedDuration: '4-6 months',
  priorityOrder: ['System Design', 'Cloud', 'Leadership'],
  courseraLinks: [{ url: 'https://coursera.org/learn/cloud', title: 'Cloud Computing' }],
  udemyLinks: [{ url: 'https://udemy.com/system-design', title: 'System Design' }],
  linkedinLearning: [{ url: 'https://linkedin.com/learning/leadership', title: 'Leadership' }],
  pluralsightLinks: [{ url: 'https://pluralsight.com/aws', title: 'AWS Path' }],
  youtubeLinks: [{ url: 'https://youtube.com/systemdesign', title: 'System Design Tutorials', free: true }],
  freeResources: [{ title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'GitHub' }],
  skillValueIncrease: { 'System Design': { before: 5, after: 8, marketValue: '+$25k' } },
  salaryImpact: 25000,
  marketabilityIncrease: 'SIGNIFICANT',
  completedItems: [],
  currentProgress: 0,
  modelVersion: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockApplicationInsight: ApplicationInsight = {
  id: 'ai-001',
  userId: 'user-001',
  applicationId: 'app-001',
  currentStage: 'UNDER_REVIEW',
  stageDetails: { stage: 'UNDER_REVIEW', description: 'Application under review', typicalDuration: '5-7 days' },
  timeInStage: 3,
  averageTimeAtStage: 5,
  competitorCount: 127,
  rankEstimate: 'TOP_25',
  strengthsVsField: [
    { area: 'Technical Skills', strength: 'Top 15%', details: 'Strong match on technologies' },
  ],
  weaknessesVsField: [
    { area: 'Industry Experience', weakness: 'Average', details: 'Limited fintech background' },
  ],
  advanceProbability: 0.72,
  hireProbability: 0.35,
  predictionFactors: [
    { factor: 'Skills Match', impact: 'POSITIVE', weight: 0.35 },
    { factor: 'Experience', impact: 'POSITIVE', weight: 0.25 },
  ],
  confidenceLevel: 'MEDIUM',
  immediateActions: ['Connect with recruiter on LinkedIn', 'Research company news'],
  profileImprovements: ['Add fintech projects to portfolio'],
  followUpAdvice: { timing: 'Wait 5 more days', method: 'LinkedIn message' },
  interviewTips: ['Review system design for payments'],
  expectedNextStep: 'Technical phone screen',
  expectedTimeline: '7-10 business days',
  typicalProcessLength: 21,
  urgencyLevel: 'MEDIUM',
  companyHiringPattern: { averageTimeToHire: '3-4 weeks', interviewRounds: 4 },
  roleCompetitiveness: 'HIGH',
  redFlags: [],
  positiveSignals: [{ signal: 'Application viewed multiple times', meaning: 'Interest from hiring team' }],
  dealBreakers: ['Salary above budget', 'Unable to start in timeframe'],
  modelVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  application: { job: { title: 'Senior Software Engineer', companyName: 'Tech Corp' } },
};

const mockPortfolioFeedback: PortfolioFeedback = {
  id: 'pf-001',
  userId: 'user-001',
  portfolioUrl: 'https://github.com/johnsmith',
  portfolioType: 'GITHUB',
  projectCount: 8,
  analyzedProjects: [],
  overallScore: 78,
  overallGrade: 'B+',
  strengthAreas: [
    { area: 'Technical Diversity', score: 85, feedback: 'Good variety of technologies' },
    { area: 'Code Quality', score: 82, feedback: 'Clean code with good practices' },
  ],
  improvementAreas: [
    { area: 'Visual Design', score: 65, feedback: 'Consider more polished UI/UX' },
    { area: 'Business Impact', score: 60, feedback: 'Add metrics and outcomes' },
  ],
  standoutProjects: [
    { projectName: 'E-commerce Platform', reason: 'Full-stack with complex features' },
  ],
  visualAppeal: 72,
  navigation: 80,
  mobileResponsive: true,
  loadSpeed: 'MEDIUM',
  accessibilityScore: 68,
  presentationFeedback: ['Add hero section', 'Include professional headshot'],
  projectDescriptions: { quality: 'GOOD', averageLength: 150 },
  technicalDepth: 78,
  problemSolving: 72,
  realWorldImpact: 65,
  contentFeedback: ['Add case studies for top projects'],
  techStackDiversity: 85,
  codeQuality: 80,
  documentationQuality: 75,
  testCoverage: 60,
  technicalFeedback: ['Add test coverage badges', 'Include CI/CD config'],
  industryRelevance: 75,
  trendAlignment: 82,
  uniqueness: 68,
  marketFeedback: ['Add more cloud-native projects'],
  projectFeedback: [
    { project: 'E-commerce Platform', score: 85, strengths: ['Full-stack', 'Payment integration'], improvements: ['Add performance metrics'] },
  ],
  quickWins: [
    { action: 'Add README badges', effort: '30 minutes', impact: 'MEDIUM' },
  ],
  mediumEffort: [
    { action: 'Write case study for top project', effort: '4 hours', impact: 'HIGH' },
  ],
  majorOverhauls: [
    { action: 'Redesign portfolio site', effort: '1-2 weeks', impact: 'HIGH' },
  ],
  prioritizedActions: [
    { rank: 1, action: 'Update project screenshots', reason: 'Quick win with high impact' },
  ],
  modelVersion: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockParsedDocument: ParsedDocument = {
  id: 'pd-001',
  userId: 'user-001',
  documentType: 'RESUME',
  fileName: 'john_smith_resume.pdf',
  contactInfo: { name: 'John Smith', email: 'john@email.com', phone: '+1-555-123-4567', location: 'San Francisco, CA' },
  summary: 'Experienced software engineer with 8+ years building scalable web applications',
  workExperience: [
    { company: 'Tech Corp', title: 'Senior Software Engineer', startDate: '2020-03', endDate: 'Present', current: true, location: 'San Francisco', achievements: ['Reduced API latency by 40%'] },
    { company: 'StartupCo', title: 'Software Engineer', startDate: '2017-06', endDate: '2020-02', current: false, location: 'New York' },
  ],
  education: [
    { institution: 'Stanford University', degree: 'M.S.', field: 'Computer Science', graduationDate: '2017' },
  ],
  skills: { programming: ['JavaScript', 'TypeScript', 'Python'], frameworks: ['React', 'Node.js'], databases: ['PostgreSQL'] },
  certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2022' }],
  projects: [{ name: 'CLI Tool', description: 'Developer productivity tool', technologies: ['Go'], url: 'github.com/johnsmith/cli' }],
  parseConfidence: 0.92,
  completenessScore: 0.88,
  formatQuality: 'GOOD',
  issues: [{ section: 'Projects', issue: 'Limited descriptions' }],
  companies: ['Tech Corp', 'StartupCo'],
  technologies: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js'],
  locations: ['San Francisco', 'New York'],
  dates: ['2020-03', '2017-06', '2017'],
  urls: ['github.com/johnsmith'],
  seniorityLevel: 'SENIOR',
  industryFocus: ['Technology', 'E-commerce'],
  status: 'PARSED',
  modelVersion: '1.0.0',
  processingTime: 1250,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSkillExtraction: SkillExtraction = {
  id: 'se-001',
  userId: 'user-001',
  sourceType: 'RESUME',
  sourceText: 'Sample resume text...',
  skills: [
    { skill: 'JavaScript', confidence: 0.95, mentions: 12 },
    { skill: 'React', confidence: 0.92, mentions: 8 },
    { skill: 'Node.js', confidence: 0.90, mentions: 6 },
  ],
  skillCategories: { frontend: ['JavaScript', 'React'], backend: ['Node.js'], database: ['PostgreSQL'] },
  skillLevels: { JavaScript: 'EXPERT', React: 'ADVANCED', 'Node.js': 'ADVANCED' },
  skillRelationships: {
    clusters: [{ name: 'Frontend Stack', skills: ['JavaScript', 'React'] }],
    dependencies: [{ skill: 'React', dependsOn: ['JavaScript'] }],
  },
  programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
  frameworks: ['React', 'Node.js', 'Express'],
  databases: ['PostgreSQL', 'MongoDB'],
  cloudPlatforms: ['AWS', 'GCP'],
  tools: ['Git', 'Docker', 'Kubernetes'],
  methodologies: ['Agile', 'Scrum', 'TDD'],
  softSkills: ['Leadership', 'Communication'],
  leadershipSkills: ['Team Management', 'Mentoring'],
  communicationSkills: ['Technical Writing', 'Presentations'],
  domainExpertise: ['E-commerce', 'FinTech'],
  certificationSkills: ['AWS Solutions Architect'],
  coreCompetencies: ['Full-Stack Development', 'System Design'],
  emergingSkills: ['Kubernetes', 'Go'],
  legacySkills: [],
  rarityScores: { JavaScript: 0.2, Kubernetes: 0.7 },
  marketDemand: { JavaScript: { demand: 'HIGH', openRoles: 15000 }, Kubernetes: { demand: 'VERY_HIGH', openRoles: 8000 } },
  salaryImpact: { Kubernetes: { baseImpact: 15000, seniorImpact: 25000 } },
  trendingSkills: ['Kubernetes', 'Go', 'Rust'],
  overallConfidence: 0.89,
  perSkillConfidence: { JavaScript: 0.95, React: 0.92 },
  modelVersion: '1.0.0',
  processingTime: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSemanticSearchResponse: SemanticSearchResponse = {
  query: 'senior react developer with AWS experience',
  results: [
    {
      id: 'idx-001',
      entityType: 'CANDIDATE',
      entityId: 'user-001',
      userId: 'user-001',
      title: 'John Smith - Senior Software Engineer',
      content: 'Experienced software engineer with React and AWS expertise',
      summary: '8+ years experience in full-stack development',
      keywords: ['React', 'AWS', 'TypeScript', 'Node.js'],
      embeddingModel: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      category: 'Engineering',
      skills: ['React', 'AWS', 'TypeScript'],
      industries: ['Technology'],
      locations: ['San Francisco'],
      seniorityLevel: 'SENIOR',
      experienceYears: 8,
      contentQuality: 0.92,
      freshness: new Date().toISOString(),
      popularity: 45,
      status: 'ACTIVE',
      lastIndexed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relevanceScore: 0.94,
    },
  ],
  totalResults: 1,
};

const mockEntityRecognition: EntityRecognition = {
  id: 'er-001',
  userId: 'user-001',
  sourceType: 'RESUME',
  sourceText: 'Sample text...',
  people: [{ name: 'John Smith', role: 'Candidate', confidence: 0.95 }],
  organizations: [{ name: 'Tech Corp', type: 'Employer', confidence: 0.95 }],
  locations: [{ location: 'San Francisco, CA', type: 'City', confidence: 0.95 }],
  dates: [{ date: '2020-03', type: 'START_DATE', context: 'Employment start' }],
  money: [{ amount: 150000, currency: 'USD', type: 'SALARY', confidence: 0.85 }],
  percentages: [{ value: 40, context: 'Performance improvement', confidence: 0.90 }],
  quantities: [{ value: 5, unit: 'people', context: 'Team size', confidence: 0.92 }],
  technologies: [{ name: 'JavaScript', category: 'Language', confidence: 0.95 }],
  products: [{ name: 'EC2', vendor: 'AWS', confidence: 0.88 }],
  platforms: [{ name: 'AWS', type: 'Cloud', confidence: 0.95 }],
  languages: [{ name: 'JavaScript', type: 'Programming', confidence: 0.95 }],
  jobTitles: [{ title: 'Senior Software Engineer', standardized: 'Software Engineer III', confidence: 0.92 }],
  degrees: [{ degree: 'M.S. Computer Science', level: 'Masters', confidence: 0.95 }],
  certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', confidence: 0.92 }],
  universities: [{ name: 'Stanford University', type: 'University', confidence: 0.95 }],
  industries: [{ name: 'Technology', confidence: 0.95 }],
  entityRelationships: [{ entity1: 'John Smith', entity2: 'Tech Corp', relationship: 'EMPLOYED_BY' }],
  timeline: [{ date: '2020-03', event: 'Joined Tech Corp' }],
  perEntityConfidence: { people: 0.91, organizations: 0.92 },
  overallConfidence: 0.91,
  normalizedEntities: {},
  modelVersion: '1.0.0',
  processingTime: 720,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// API FUNCTIONS
// ============================================

// 2.3.7 - Career Path Advisor API
export const careerPathAPI = {
  getAdvice: async (request: CareerPathAdviceRequest): Promise<CareerPathAdvice> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { ...mockCareerPathAdvice, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/career-path/advice`, request);
    return response.data.data;
  },

  getHistory: async (): Promise<CareerPathAdvice[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockCareerPathAdvice];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/career-path/history`);
    return response.data.data;
  },
};

// 2.3.8 - Learning Recommendations API
export const learningAPI = {
  getRecommendations: async (request: LearningRecommendationRequest): Promise<LearningRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { ...mockLearningRecommendation, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/learning/recommendations`, request);
    return response.data.data;
  },

  updateProgress: async (id: string, completedItems: string[], currentProgress: number): Promise<LearningRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockLearningRecommendation, completedItems, currentProgress };
    }
    const response = await axios.patch(`${API_URL}/api/ai-nlp/learning/${id}/progress`, { completedItems, currentProgress });
    return response.data.data;
  },

  getHistory: async (): Promise<LearningRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockLearningRecommendation];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/learning/history`);
    return response.data.data;
  },
};

// 2.3.9 - Application Insights API
export const applicationInsightsAPI = {
  getInsights: async (applicationId: string): Promise<ApplicationInsight> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...mockApplicationInsight, applicationId };
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/applications/${applicationId}/insights`);
    return response.data.data;
  },

  getAllInsights: async (): Promise<ApplicationInsight[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockApplicationInsight];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/applications/insights`);
    return response.data.data;
  },
};

// 2.3.10 - Portfolio Feedback API
export const portfolioFeedbackAPI = {
  getFeedback: async (request: PortfolioFeedbackRequest): Promise<PortfolioFeedback> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { ...mockPortfolioFeedback, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/portfolio/feedback`, request);
    return response.data.data;
  },

  getHistory: async (): Promise<PortfolioFeedback[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockPortfolioFeedback];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/portfolio/feedback/history`);
    return response.data.data;
  },
};

// 2.4.1 - Resume Parser API
export const documentParserAPI = {
  parseDocument: async (request: ParseDocumentRequest): Promise<ParsedDocument> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      return { ...mockParsedDocument, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/parse/document`, request);
    return response.data.data;
  },

  getDocuments: async (): Promise<ParsedDocument[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockParsedDocument];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/parse/documents`);
    return response.data.data;
  },
};

// 2.4.2 - Skill Extraction API
export const skillExtractionAPI = {
  extractSkills: async (request: ExtractSkillsRequest): Promise<SkillExtraction> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { ...mockSkillExtraction, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/skills/extract`, request);
    return response.data.data;
  },

  getExtractions: async (): Promise<SkillExtraction[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockSkillExtraction];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/skills/extractions`);
    return response.data.data;
  },
};

// 2.4.3 - Semantic Search API
export const semanticSearchAPI = {
  indexForSearch: async (request: IndexForSearchRequest): Promise<{ id: string; indexed: boolean }> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: 'idx-001', indexed: true };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/search/index`, request);
    return response.data.data;
  },

  search: async (request: SemanticSearchRequest): Promise<SemanticSearchResponse> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { ...mockSemanticSearchResponse, query: request.query };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/search/semantic`, request);
    return response.data.data;
  },
};

// 2.4.4 - Entity Recognition API
export const entityRecognitionAPI = {
  recognizeEntities: async (request: RecognizeEntitiesRequest): Promise<EntityRecognition> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { ...mockEntityRecognition, ...request };
    }
    const response = await axios.post(`${API_URL}/api/ai-nlp/entities/recognize`, request);
    return response.data.data;
  },

  getRecognitions: async (): Promise<EntityRecognition[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [mockEntityRecognition];
    }
    const response = await axios.get(`${API_URL}/api/ai-nlp/entities/recognitions`);
    return response.data.data;
  },
};
