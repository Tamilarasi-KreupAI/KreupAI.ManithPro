import axios from 'axios';
import {
  LiveCodingSession,
  TakeHomeProject,
  ProjectSubmission,
  ExternalAssessment,
  ExternalAssessmentProvider,
  SoftSkillsAssessment,
  SoftSkillAttempt,
  LanguageProficiencyTest,
  LanguageTestAttempt,
  Batch7AssessmentStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: `${API_BASE_URL}/batch7-assessments`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// MOCK DATA
// ============================================

const mockLiveCodingSessions: LiveCodingSession[] = [
  {
    id: 'lcs-1',
    candidateId: 'user-1',
    interviewerId: 'recruiter-1',
    applicationId: 'app-1',
    title: 'Full Stack JavaScript Challenge',
    description: 'Build a real-time chat feature using WebSocket',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    status: 'SCHEDULED',
    programmingLanguage: 'JavaScript',
    problemStatement: 'Implement a real-time chat feature with user presence, message history, and typing indicators.',
    starterCode: '// WebSocket chat implementation\n\nconst socket = new WebSocket("ws://localhost:8080");\n\n// Your code here',
    testCases: [
      { input: 'send("Hello")', expectedOutput: 'message received by all clients' },
      { input: 'typing(true)', expectedOutput: 'typing indicator shown' },
    ],
    hints: ['Consider using a message queue for offline messages', 'Use heartbeat for connection health'],
    difficultyLevel: 'INTERMEDIATE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lcs-2',
    candidateId: 'user-1',
    interviewerId: 'recruiter-2',
    title: 'Algorithm Challenge: Graph Traversal',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    status: 'COMPLETED',
    programmingLanguage: 'Python',
    problemStatement: 'Implement BFS and DFS algorithms to find the shortest path in a weighted graph.',
    difficultyLevel: 'ADVANCED',
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000).toISOString(),
    score: 85,
    feedback: 'Excellent understanding of graph algorithms. Good problem-solving approach.',
    codeQualityScore: 82,
    problemSolvingScore: 90,
    communicationScore: 85,
    technicalKnowledgeScore: 88,
    recommendation: 'STRONGLY_RECOMMEND',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockTakeHomeProjects: TakeHomeProject[] = [
  {
    id: 'thp-1',
    title: 'E-Commerce Dashboard',
    slug: 'ecommerce-dashboard',
    description: 'Build a responsive admin dashboard for an e-commerce platform with product management, order tracking, and analytics.',
    category: 'FRONTEND',
    difficultyLevel: 'INTERMEDIATE',
    estimatedHours: 8,
    deadlineHours: 72,
    requirements: '- Implement product CRUD operations\n- Order management with status updates\n- Analytics dashboard with charts\n- Responsive design for mobile and desktop\n- Authentication and authorization',
    evaluationCriteria: 'Code quality, UI/UX design, functionality completeness, performance optimization',
    starterRepoUrl: 'https://github.com/kreupai/ecommerce-dashboard-starter',
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'Chart.js'],
    skills: ['React', 'TypeScript', 'Frontend Development', 'UI/UX'],
    allowedExtensions: ['.zip', '.tar.gz'],
    maxSubmissionSize: 52428800,
    rubric: {
      functionality: { criteria: 'All features working correctly', maxScore: 30, description: 'Core functionality implementation' },
      codeQuality: { criteria: 'Clean, maintainable code', maxScore: 25, description: 'Code organization and best practices' },
      uiDesign: { criteria: 'Intuitive and visually appealing', maxScore: 25, description: 'User interface and experience' },
      performance: { criteria: 'Fast load times and smooth interactions', maxScore: 20, description: 'Performance optimization' },
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'thp-2',
    title: 'REST API with Authentication',
    slug: 'rest-api-auth',
    description: 'Build a RESTful API with JWT authentication, role-based access control, and comprehensive documentation.',
    category: 'BACKEND',
    difficultyLevel: 'INTERMEDIATE',
    estimatedHours: 6,
    deadlineHours: 48,
    requirements: '- JWT authentication with refresh tokens\n- Role-based access control (Admin, User)\n- User CRUD operations\n- API documentation with Swagger/OpenAPI\n- Unit and integration tests',
    techStack: ['Node.js', 'Express', 'PostgreSQL', 'Prisma'],
    skills: ['Node.js', 'REST API', 'Authentication', 'Database Design'],
    allowedExtensions: ['.zip', '.tar.gz'],
    maxSubmissionSize: 52428800,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockProjectSubmissions: ProjectSubmission[] = [
  {
    id: 'ps-1',
    projectId: 'thp-1',
    candidateId: 'user-1',
    applicationId: 'app-1',
    status: 'SUBMITTED',
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    repositoryUrl: 'https://github.com/candidate/ecommerce-dashboard',
    liveUrl: 'https://ecommerce-dashboard-demo.vercel.app',
    submissionNotes: 'Implemented all required features plus added dark mode and export functionality.',
    submittedFiles: ['submission.zip'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    project: mockTakeHomeProjects[0],
  },
  {
    id: 'ps-2',
    projectId: 'thp-2',
    candidateId: 'user-1',
    applicationId: 'app-2',
    status: 'REVIEWED',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    repositoryUrl: 'https://github.com/candidate/rest-api-auth',
    submittedFiles: ['api-project.zip'],
    reviewerId: 'recruiter-1',
    reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 88,
    criteriaScores: { functionality: 28, codeQuality: 22, documentation: 20, testing: 18 },
    feedback: 'Excellent API design with comprehensive documentation. Consider adding rate limiting for production.',
    strengths: ['Clean code architecture', 'Thorough documentation', 'Good test coverage'],
    improvements: ['Add rate limiting', 'Consider caching strategies'],
    recommendation: 'ADVANCE',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    project: mockTakeHomeProjects[1],
  },
];

const mockExternalAssessments: ExternalAssessment[] = [
  {
    id: 'ea-1',
    profileId: 'profile-1',
    provider: 'HACKERRANK',
    externalAssessmentId: 'hr_12345',
    assessmentName: 'Problem Solving (Intermediate)',
    assessmentUrl: 'https://www.hackerrank.com/certificates/12345',
    score: 92,
    maxScore: 100,
    percentile: 87,
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
    certificateUrl: 'https://www.hackerrank.com/certificates/12345',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'API',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ea-2',
    profileId: 'profile-1',
    provider: 'CODESIGNAL',
    externalAssessmentId: 'cs_67890',
    assessmentName: 'General Coding Assessment',
    assessmentUrl: 'https://app.codesignal.com/profile/user123',
    score: 810,
    maxScore: 850,
    percentile: 94,
    completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ['Python', 'JavaScript', 'SQL', 'Problem Solving'],
    isVerified: true,
    verifiedAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'OAUTH_IMPORT',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ea-3',
    profileId: 'profile-1',
    provider: 'LEETCODE',
    externalAssessmentId: 'lc_54321',
    assessmentName: 'Weekly Contest 350',
    score: 3,
    maxScore: 4,
    percentile: 72,
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ['Algorithms', 'Dynamic Programming', 'Graphs'],
    isVerified: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockSoftSkillsAssessments: SoftSkillsAssessment[] = [
  {
    id: 'ssa-1',
    title: 'Leadership Assessment',
    slug: 'leadership-assessment',
    description: 'Evaluate your leadership style, decision-making abilities, and team management skills.',
    category: 'LEADERSHIP',
    estimatedMinutes: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 15 },
  },
  {
    id: 'ssa-2',
    title: 'Situational Judgment Test',
    slug: 'situational-judgment',
    description: 'Assess how you handle workplace scenarios and make decisions under pressure.',
    category: 'SITUATIONAL_JUDGMENT',
    estimatedMinutes: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 20 },
  },
  {
    id: 'ssa-3',
    title: 'Emotional Intelligence Assessment',
    slug: 'emotional-intelligence',
    description: 'Measure your ability to recognize, understand, and manage emotions.',
    category: 'EMOTIONAL_INTELLIGENCE',
    estimatedMinutes: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 12 },
  },
];

const mockSoftSkillAttempts: SoftSkillAttempt[] = [
  {
    id: 'sat-1',
    assessmentId: 'ssa-1',
    candidateId: 'user-1',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString(),
    answers: [],
    overallScore: 78,
    traitScores: {
      'Decision Making': 82,
      'Team Management': 75,
      'Strategic Thinking': 80,
      'Communication': 74,
    },
    insights: [
      'Your strongest trait is Decision Making',
      'You demonstrate excellent soft skills across multiple areas',
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assessment: mockSoftSkillsAssessments[0],
  },
];

const mockLanguageTests: LanguageProficiencyTest[] = [
  {
    id: 'lpt-1',
    title: 'English Proficiency - Business',
    slug: 'english-business',
    description: 'Comprehensive English language assessment for professional and business communication.',
    language: 'English',
    testType: 'COMPREHENSIVE',
    difficultyLevel: 'INTERMEDIATE',
    estimatedMinutes: 45,
    passingScore: 70,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 50 },
  },
  {
    id: 'lpt-2',
    title: 'Spanish Speaking Test',
    slug: 'spanish-speaking',
    description: 'Evaluate your Spanish speaking abilities through recorded responses.',
    language: 'Spanish',
    testType: 'SPEAKING',
    difficultyLevel: 'BEGINNER',
    estimatedMinutes: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 15 },
  },
  {
    id: 'lpt-3',
    title: 'German Reading Comprehension',
    slug: 'german-reading',
    description: 'Test your German reading and comprehension skills.',
    language: 'German',
    testType: 'READING',
    difficultyLevel: 'INTERMEDIATE',
    estimatedMinutes: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 25 },
  },
];

const mockLanguageTestAttempts: LanguageTestAttempt[] = [
  {
    id: 'lta-1',
    testId: 'lpt-1',
    candidateId: 'user-1',
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
    answers: [],
    score: 82,
    sectionScores: {
      READING: { correct: 18, total: 20 },
      LISTENING: { correct: 15, total: 20 },
      WRITING: { correct: 8, total: 10 },
    },
    cefrLevel: 'B2',
    correctAnswers: 41,
    totalQuestions: 50,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    test: mockLanguageTests[0],
  },
];

const mockStats: Batch7AssessmentStats = {
  liveCoding: {
    total: 2,
    completed: 1,
    averageScore: 85,
  },
  takeHomeProjects: {
    total: 2,
    submitted: 2,
    averageScore: 88,
  },
  externalAssessments: {
    total: 3,
    byProvider: { HACKERRANK: 1, CODESIGNAL: 1, LEETCODE: 1 },
    averagePercentile: 84,
  },
  softSkills: {
    total: 1,
    averageScore: 78,
  },
  languageTests: {
    total: 1,
    averageScore: 82,
    highestCEFR: 'B2',
  },
};

// ============================================
// 1.4.3 - LIVE CODING ENVIRONMENT API
// ============================================

export const liveCodingAPI = {
  getSessions: async (params?: { status?: string; upcoming?: boolean }): Promise<LiveCodingSession[]> => {
    if (USE_MOCK) {
      let sessions = [...mockLiveCodingSessions];
      if (params?.status) {
        sessions = sessions.filter(s => s.status === params.status);
      }
      if (params?.upcoming) {
        sessions = sessions.filter(s => new Date(s.scheduledAt) > new Date() && ['SCHEDULED', 'WAITING'].includes(s.status));
      }
      return sessions;
    }
    const response = await api.get('/live-coding/sessions', { params });
    return response.data.sessions;
  },

  getSession: async (sessionId: string): Promise<LiveCodingSession> => {
    if (USE_MOCK) {
      const session = mockLiveCodingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      return session;
    }
    const response = await api.get(`/live-coding/sessions/${sessionId}`);
    return response.data.session;
  },

  schedule: async (data: {
    candidateId: string;
    applicationId?: string;
    title: string;
    description?: string;
    scheduledAt: string;
    durationMinutes?: number;
    programmingLanguage: string;
    problemStatement: string;
    starterCode?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
    hints?: string[];
    difficultyLevel: string;
  }): Promise<LiveCodingSession> => {
    if (USE_MOCK) {
      const session: LiveCodingSession = {
        id: `lcs-${Date.now()}`,
        ...data,
        interviewerId: 'current-user',
        durationMinutes: data.durationMinutes || 60,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLiveCodingSessions.push(session);
      return session;
    }
    const response = await api.post('/live-coding/schedule', data);
    return response.data.session;
  },

  join: async (sessionId: string): Promise<{ session: LiveCodingSession; roomUrl: string }> => {
    if (USE_MOCK) {
      const session = mockLiveCodingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      return { session, roomUrl: `https://live-coding.kreupai.com/room/${sessionId}` };
    }
    const response = await api.post(`/live-coding/sessions/${sessionId}/join`);
    return { session: response.data.session, roomUrl: response.data.session.roomUrl };
  },

  start: async (sessionId: string): Promise<LiveCodingSession> => {
    if (USE_MOCK) {
      const session = mockLiveCodingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      session.status = 'IN_PROGRESS';
      session.startedAt = new Date().toISOString();
      return session;
    }
    const response = await api.post(`/live-coding/sessions/${sessionId}/start`);
    return response.data.session;
  },

  submitCode: async (sessionId: string, code: string, language: string): Promise<{ session: LiveCodingSession; testResults: { passed: number; total: number; executionTime: number } }> => {
    if (USE_MOCK) {
      const session = mockLiveCodingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      session.candidateCode = code;
      return {
        session,
        testResults: { passed: Math.floor(Math.random() * 10), total: 10, executionTime: Math.random() * 1000 },
      };
    }
    const response = await api.post(`/live-coding/sessions/${sessionId}/submit-code`, { code, language });
    return response.data;
  },

  end: async (sessionId: string, evaluation: {
    score?: number;
    feedback?: string;
    codeQualityScore?: number;
    problemSolvingScore?: number;
    communicationScore?: number;
    technicalKnowledgeScore?: number;
    recommendation?: string;
  }): Promise<LiveCodingSession> => {
    if (USE_MOCK) {
      const session = mockLiveCodingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      Object.assign(session, {
        status: 'COMPLETED',
        endedAt: new Date().toISOString(),
        ...evaluation,
      });
      return session;
    }
    const response = await api.post(`/live-coding/sessions/${sessionId}/end`, evaluation);
    return response.data.session;
  },
};

// ============================================
// 1.4.4 - TAKE-HOME PROJECT API
// ============================================

export const takeHomeProjectAPI = {
  getProjects: async (params?: { category?: string; difficulty?: string; isActive?: boolean }): Promise<TakeHomeProject[]> => {
    if (USE_MOCK) {
      let projects = [...mockTakeHomeProjects];
      if (params?.category) {
        projects = projects.filter(p => p.category === params.category);
      }
      if (params?.difficulty) {
        projects = projects.filter(p => p.difficultyLevel === params.difficulty);
      }
      return projects;
    }
    const response = await api.get('/projects', { params });
    return response.data.projects;
  },

  getProject: async (slug: string): Promise<TakeHomeProject> => {
    if (USE_MOCK) {
      const project = mockTakeHomeProjects.find(p => p.slug === slug || p.id === slug);
      if (!project) throw new Error('Project not found');
      return project;
    }
    const response = await api.get(`/projects/${slug}`);
    return response.data.project;
  },

  create: async (data: Omit<TakeHomeProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TakeHomeProject> => {
    if (USE_MOCK) {
      const project: TakeHomeProject = {
        ...data,
        id: `thp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTakeHomeProjects.push(project);
      return project;
    }
    const response = await api.post('/projects/create', data);
    return response.data.project;
  },

  assign: async (data: {
    projectId: string;
    candidateId: string;
    applicationId?: string;
    customDeadlineHours?: number;
    notes?: string;
  }): Promise<ProjectSubmission> => {
    if (USE_MOCK) {
      const project = mockTakeHomeProjects.find(p => p.id === data.projectId);
      if (!project) throw new Error('Project not found');
      const deadlineHours = data.customDeadlineHours || project.deadlineHours;
      const submission: ProjectSubmission = {
        id: `ps-${Date.now()}`,
        projectId: data.projectId,
        candidateId: data.candidateId,
        applicationId: data.applicationId,
        status: 'ASSIGNED',
        deadline: new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString(),
        notes: data.notes,
        submittedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        project,
      };
      mockProjectSubmissions.push(submission);
      return submission;
    }
    const response = await api.post('/projects/assign', data);
    return response.data.submission;
  },

  getSubmissions: async (params?: { status?: string }): Promise<ProjectSubmission[]> => {
    if (USE_MOCK) {
      let submissions = [...mockProjectSubmissions];
      if (params?.status) {
        submissions = submissions.filter(s => s.status === params.status);
      }
      return submissions;
    }
    const response = await api.get('/projects/user/submissions', { params });
    return response.data.submissions;
  },

  startSubmission: async (submissionId: string): Promise<ProjectSubmission> => {
    if (USE_MOCK) {
      const submission = mockProjectSubmissions.find(s => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');
      submission.status = 'IN_PROGRESS';
      submission.startedAt = new Date().toISOString();
      return submission;
    }
    const response = await api.post(`/projects/submissions/${submissionId}/start`);
    return response.data.submission;
  },

  submit: async (submissionId: string, data: {
    repositoryUrl?: string;
    liveUrl?: string;
    submissionNotes?: string;
    files?: string[];
  }): Promise<ProjectSubmission> => {
    if (USE_MOCK) {
      const submission = mockProjectSubmissions.find(s => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');
      Object.assign(submission, {
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        repositoryUrl: data.repositoryUrl,
        liveUrl: data.liveUrl,
        submissionNotes: data.submissionNotes,
        submittedFiles: data.files || [],
      });
      return submission;
    }
    const response = await api.post(`/projects/submissions/${submissionId}/submit`, data);
    return response.data.submission;
  },

  review: async (submissionId: string, review: {
    overallScore?: number;
    criteriaScores?: Record<string, number>;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    recommendation?: string;
    decision?: 'ACCEPTED' | 'REJECTED';
  }): Promise<ProjectSubmission> => {
    if (USE_MOCK) {
      const submission = mockProjectSubmissions.find(s => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');
      Object.assign(submission, {
        status: review.decision || 'REVIEWED',
        reviewedAt: new Date().toISOString(),
        ...review,
      });
      return submission;
    }
    const response = await api.post(`/projects/submissions/${submissionId}/review`, review);
    return response.data.submission;
  },
};

// ============================================
// 1.4.5 - EXTERNAL ASSESSMENT API
// ============================================

export const externalAssessmentAPI = {
  getAssessments: async (profileId?: string): Promise<ExternalAssessment[]> => {
    if (USE_MOCK) {
      return mockExternalAssessments;
    }
    const response = await api.get('/external', { params: { profileId } });
    return response.data.assessments;
  },

  link: async (data: {
    provider: ExternalAssessmentProvider;
    assessmentId: string;
    assessmentName: string;
    assessmentUrl?: string;
    score?: number;
    maxScore?: number;
    percentile?: number;
    completedAt?: string;
    skills?: string[];
    certificateUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ExternalAssessment> => {
    if (USE_MOCK) {
      const assessment: ExternalAssessment = {
        id: `ea-${Date.now()}`,
        profileId: 'profile-1',
        provider: data.provider,
        externalAssessmentId: data.assessmentId,
        assessmentName: data.assessmentName,
        assessmentUrl: data.assessmentUrl,
        score: data.score,
        maxScore: data.maxScore,
        percentile: data.percentile,
        completedAt: data.completedAt || new Date().toISOString(),
        skills: data.skills || [],
        certificateUrl: data.certificateUrl,
        isVerified: false,
        metadata: data.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockExternalAssessments.push(assessment);
      return assessment;
    }
    const response = await api.post('/external/link', data);
    return response.data.assessment;
  },

  verify: async (assessmentId: string): Promise<{ assessment: ExternalAssessment; verified: boolean }> => {
    if (USE_MOCK) {
      const assessment = mockExternalAssessments.find(a => a.id === assessmentId);
      if (!assessment) throw new Error('Assessment not found');
      assessment.isVerified = true;
      assessment.verifiedAt = new Date().toISOString();
      assessment.verificationMethod = 'API';
      return { assessment, verified: true };
    }
    const response = await api.post(`/external/${assessmentId}/verify`);
    return response.data;
  },

  getAuthUrl: async (provider: ExternalAssessmentProvider): Promise<{ authUrl: string; provider: string }> => {
    if (USE_MOCK) {
      return {
        authUrl: `https://mock-oauth.${provider.toLowerCase()}.com/authorize`,
        provider,
      };
    }
    const response = await api.get(`/external/auth/${provider}`);
    return response.data;
  },

  import: async (provider: ExternalAssessmentProvider, accessToken: string): Promise<{ assessments: ExternalAssessment[]; imported: number }> => {
    if (USE_MOCK) {
      return { assessments: mockExternalAssessments.slice(0, 2), imported: 2 };
    }
    const response = await api.post('/external/import', { provider, accessToken });
    return response.data;
  },
};

// ============================================
// 1.4.6 - SOFT SKILLS ASSESSMENT API
// ============================================

export const softSkillsAPI = {
  getAssessments: async (params?: { category?: string; isActive?: boolean }): Promise<SoftSkillsAssessment[]> => {
    if (USE_MOCK) {
      let assessments = [...mockSoftSkillsAssessments];
      if (params?.category) {
        assessments = assessments.filter(a => a.category === params.category);
      }
      return assessments;
    }
    const response = await api.get('/soft-skills', { params });
    return response.data.assessments;
  },

  getAssessment: async (slug: string): Promise<SoftSkillsAssessment> => {
    if (USE_MOCK) {
      const assessment = mockSoftSkillsAssessments.find(a => a.slug === slug || a.id === slug);
      if (!assessment) throw new Error('Assessment not found');
      return assessment;
    }
    const response = await api.get(`/soft-skills/${slug}`);
    return response.data.assessment;
  },

  start: async (assessmentId: string, applicationId?: string): Promise<{ attempt: SoftSkillAttempt; assessment: SoftSkillsAssessment; resuming?: boolean }> => {
    if (USE_MOCK) {
      const assessment = mockSoftSkillsAssessments.find(a => a.id === assessmentId);
      if (!assessment) throw new Error('Assessment not found');
      const attempt: SoftSkillAttempt = {
        id: `sat-${Date.now()}`,
        assessmentId,
        candidateId: 'user-1',
        applicationId,
        startedAt: new Date().toISOString(),
        answers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { attempt, assessment };
    }
    const response = await api.post('/soft-skills/start', { assessmentId, applicationId });
    return response.data;
  },

  submit: async (attemptId: string, answers: Array<{ questionId: string; answer: string; responseTime?: number }>): Promise<SoftSkillAttempt> => {
    if (USE_MOCK) {
      const attempt = mockSoftSkillAttempts[0];
      Object.assign(attempt, {
        id: attemptId,
        completedAt: new Date().toISOString(),
        answers,
        overallScore: 75 + Math.floor(Math.random() * 20),
        traitScores: { Leadership: 80, Teamwork: 75, Communication: 78 },
        insights: ['Strong leadership potential', 'Good team collaboration skills'],
      });
      return attempt;
    }
    const response = await api.post(`/soft-skills/attempts/${attemptId}/submit`, { answers });
    return response.data.attempt;
  },

  getAttempts: async (): Promise<SoftSkillAttempt[]> => {
    if (USE_MOCK) {
      return mockSoftSkillAttempts;
    }
    const response = await api.get('/soft-skills/user/attempts');
    return response.data.attempts;
  },
};

// ============================================
// 1.4.7 - LANGUAGE PROFICIENCY API
// ============================================

export const languageTestAPI = {
  getTests: async (params?: { language?: string; testType?: string; isActive?: boolean }): Promise<LanguageProficiencyTest[]> => {
    if (USE_MOCK) {
      let tests = [...mockLanguageTests];
      if (params?.language) {
        tests = tests.filter(t => t.language === params.language);
      }
      if (params?.testType) {
        tests = tests.filter(t => t.testType === params.testType);
      }
      return tests;
    }
    const response = await api.get('/language-tests', { params });
    return response.data.tests;
  },

  getTest: async (slug: string): Promise<LanguageProficiencyTest> => {
    if (USE_MOCK) {
      const test = mockLanguageTests.find(t => t.slug === slug || t.id === slug);
      if (!test) throw new Error('Test not found');
      return test;
    }
    const response = await api.get(`/language-tests/${slug}`);
    return response.data.test;
  },

  start: async (testId: string, applicationId?: string): Promise<{ attempt: LanguageTestAttempt; test: LanguageProficiencyTest; resuming?: boolean }> => {
    if (USE_MOCK) {
      const test = mockLanguageTests.find(t => t.id === testId);
      if (!test) throw new Error('Test not found');
      const attempt: LanguageTestAttempt = {
        id: `lta-${Date.now()}`,
        testId,
        candidateId: 'user-1',
        applicationId,
        startedAt: new Date().toISOString(),
        answers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { attempt, test };
    }
    const response = await api.post('/language-tests/start', { testId, applicationId });
    return response.data;
  },

  submit: async (attemptId: string, answers: Array<{ questionId: string; answer: string; responseTime?: number }>): Promise<LanguageTestAttempt> => {
    if (USE_MOCK) {
      const score = 70 + Math.floor(Math.random() * 25);
      const attempt: LanguageTestAttempt = {
        id: attemptId,
        testId: 'lpt-1',
        candidateId: 'user-1',
        startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        answers,
        score,
        sectionScores: {
          READING: { correct: 18, total: 20 },
          LISTENING: { correct: 15, total: 20 },
          WRITING: { correct: 8, total: 10 },
        },
        cefrLevel: score >= 85 ? 'C1' : score >= 70 ? 'B2' : score >= 55 ? 'B1' : 'A2',
        correctAnswers: Math.floor(answers.length * 0.8),
        totalQuestions: answers.length,
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return attempt;
    }
    const response = await api.post(`/language-tests/attempts/${attemptId}/submit`, { answers });
    return response.data.attempt;
  },

  getAttempts: async (): Promise<LanguageTestAttempt[]> => {
    if (USE_MOCK) {
      return mockLanguageTestAttempts;
    }
    const response = await api.get('/language-tests/user/attempts');
    return response.data.attempts;
  },
};

// ============================================
// STATS API
// ============================================

export const batch7StatsAPI = {
  getStats: async (): Promise<Batch7AssessmentStats> => {
    if (USE_MOCK) {
      return mockStats;
    }
    const response = await api.get('/stats');
    return response.data.stats;
  },
};

export default {
  liveCoding: liveCodingAPI,
  takeHomeProjects: takeHomeProjectAPI,
  externalAssessments: externalAssessmentAPI,
  softSkills: softSkillsAPI,
  languageTests: languageTestAPI,
  stats: batch7StatsAPI,
};
