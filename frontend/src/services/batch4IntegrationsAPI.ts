import axios from 'axios';
import type {
  KaggleProfile,
  CodingPlatformProfile,
  CodingPlatformType,
  OnlineCourseProfile,
  OnlineCoursePlatform,
  AcademicProfile,
  AcademicPlatform,
  CustomPortfolioLink,
  Batch4IntegrationsStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// ============================================
// MOCK DATA
// ============================================

const mockKaggleProfile: KaggleProfile = {
  id: 'kaggle-1',
  profileId: 'profile-1',
  kaggleId: 'kaggle-johndoe',
  username: 'johndoe',
  displayName: 'John Doe',
  avatarUrl: 'https://www.kaggle.com/static/images/user-avatar.png',
  profileUrl: 'https://www.kaggle.com/johndoe',
  bio: 'Data Scientist | ML Engineer | Kaggle Expert',
  location: 'San Francisco, CA',
  occupation: 'Senior Data Scientist',
  organization: 'TechCorp',
  tier: 'Expert',
  competitionTier: 'Expert',
  notebookTier: 'Master',
  datasetTier: 'Contributor',
  competitionRanking: 1234,
  notebookRanking: 567,
  competitionCount: 25,
  datasetCount: 8,
  notebookCount: 42,
  discussionCount: 156,
  totalMedals: 15,
  goldMedals: 3,
  silverMedals: 5,
  bronzeMedals: 7,
  topCompetitions: [
    { id: 'comp-1', name: 'Titanic - Machine Learning from Disaster', url: 'https://www.kaggle.com/c/titanic', rank: 234, totalTeams: 15000, medal: 'silver', date: '2024-01-15' },
    { id: 'comp-2', name: 'House Prices Prediction', url: 'https://www.kaggle.com/c/house-prices', rank: 89, totalTeams: 12000, medal: 'gold', date: '2024-02-20' },
  ],
  featuredNotebooks: [
    { id: 'nb-1', title: 'Complete EDA Guide for Beginners', url: 'https://www.kaggle.com/code/johndoe/eda-guide', votes: 1250, comments: 89, views: 45000, language: 'Python' },
    { id: 'nb-2', title: 'Advanced Feature Engineering', url: 'https://www.kaggle.com/code/johndoe/feature-eng', votes: 890, comments: 56, views: 32000, language: 'Python' },
  ],
  status: 'CONNECTED',
  lastSyncAt: new Date().toISOString(),
  autoSync: true,
  showOnProfile: true,
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const mockCodingPlatforms: CodingPlatformProfile[] = [
  {
    id: 'lc-1',
    profileId: 'profile-1',
    platform: 'leetcode',
    platformUserId: 'lc-johndoe',
    username: 'johndoe',
    displayName: 'John Doe',
    profileUrl: 'https://leetcode.com/johndoe',
    rating: 1850,
    maxRating: 1920,
    globalRank: 12456,
    percentile: 92.5,
    totalSolved: 456,
    easySolved: 180,
    mediumSolved: 200,
    hardSolved: 76,
    acceptanceRate: 65.5,
    totalSubmissions: 890,
    contestsAttended: 35,
    totalBadges: 12,
    currentStreak: 15,
    maxStreak: 45,
    totalActiveDays: 280,
    languageStats: [
      { language: 'Python', problemsSolved: 250, percentage: 55 },
      { language: 'JavaScript', problemsSolved: 130, percentage: 28 },
      { language: 'Java', problemsSolved: 76, percentage: 17 },
    ],
    topSkills: [
      { skill: 'Dynamic Programming', problemsSolved: 89, beats: 85 },
      { skill: 'Tree', problemsSolved: 75, beats: 78 },
      { skill: 'Graph', problemsSolved: 56, beats: 72 },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hr-1',
    profileId: 'profile-1',
    platform: 'hackerrank',
    platformUserId: 'hr-johndoe',
    username: 'johndoe',
    displayName: 'John Doe',
    profileUrl: 'https://www.hackerrank.com/johndoe',
    rating: 2100,
    totalSolved: 320,
    easySolved: 120,
    mediumSolved: 150,
    hardSolved: 50,
    totalSubmissions: 580,
    contestsAttended: 20,
    totalBadges: 8,
    currentStreak: 10,
    maxStreak: 30,
    totalActiveDays: 200,
    hackerRankCertificates: [
      { id: 'cert-1', name: 'Python (Basic)', skill: 'Python', level: 'Basic', url: 'https://www.hackerrank.com/certificates/python-basic', earnedAt: '2023-06-15' },
      { id: 'cert-2', name: 'JavaScript (Intermediate)', skill: 'JavaScript', level: 'Intermediate', url: 'https://www.hackerrank.com/certificates/js-intermediate', earnedAt: '2023-08-20' },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockOnlineCourseProfiles: OnlineCourseProfile[] = [
  {
    id: 'coursera-1',
    profileId: 'profile-1',
    platform: 'coursera',
    platformUserId: 'coursera-johndoe',
    username: 'johndoe',
    displayName: 'John Doe',
    profileUrl: 'https://www.coursera.org/user/johndoe',
    totalCourses: 25,
    completedCourses: 18,
    totalHours: 320,
    certificationsEarned: 12,
    specializations: [
      { id: 'spec-1', name: 'Machine Learning Specialization', provider: 'Stanford', completedAt: '2023-08-15', certificateUrl: 'https://coursera.org/verify/spec-1' },
      { id: 'spec-2', name: 'Deep Learning Specialization', provider: 'DeepLearning.AI', completedAt: '2023-12-01', certificateUrl: 'https://coursera.org/verify/spec-2' },
    ],
    courses: [
      {
        id: 'course-1', courseProfileId: 'coursera-1', courseId: 'ml-course-1', title: 'Machine Learning', description: 'Comprehensive ML course by Andrew Ng',
        provider: 'Stanford', category: 'Data Science', duration: '60 hours', durationHours: 60, isCompleted: true, progress: 100,
        grade: '96%', gradeNumeric: 96, hasCertificate: true, certificateUrl: 'https://coursera.org/verify/cert-1',
        skills: ['Machine Learning', 'Python', 'scikit-learn'], topics: ['Supervised Learning', 'Unsupervised Learning'],
        verificationStatus: 'VERIFIED', isShowcased: true, displayOrder: 1,
      },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'udemy-1',
    profileId: 'profile-1',
    platform: 'udemy',
    platformUserId: 'udemy-johndoe',
    username: 'johndoe',
    displayName: 'John Doe',
    profileUrl: 'https://www.udemy.com/user/johndoe',
    totalCourses: 32,
    completedCourses: 28,
    totalHours: 180,
    certificationsEarned: 28,
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-02T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockAcademicProfiles: AcademicProfile[] = [
  {
    id: 'scholar-1',
    profileId: 'profile-1',
    platform: 'google_scholar',
    platformUserId: 'scholar-johndoe',
    profileUrl: 'https://scholar.google.com/citations?user=johndoe',
    displayName: 'John Doe, PhD',
    affiliation: 'Stanford University',
    department: 'Computer Science',
    position: 'Research Scientist',
    totalPublications: 28,
    totalCitations: 450,
    hIndex: 12,
    i10Index: 15,
    citationsLastYear: 120,
    researchInterests: ['Machine Learning', 'Natural Language Processing', 'Computer Vision'],
    keywords: ['deep learning', 'NLP', 'transformers', 'neural networks'],
    coAuthors: [
      { name: 'Jane Smith', affiliation: 'MIT', collaborations: 5, profileUrl: 'https://scholar.google.com/jane' },
      { name: 'Bob Johnson', affiliation: 'Google Research', collaborations: 3 },
    ],
    featuredPublications: [
      {
        id: 'pub-1', academicProfileId: 'scholar-1', publicationId: 'pub-1', title: 'Attention Is All You Need',
        abstract: 'We propose a new simple network architecture...', publicationType: 'conference',
        venue: 'NeurIPS 2023', year: 2023, doi: '10.1234/example', url: 'https://arxiv.org/example',
        authors: ['John Doe', 'Jane Smith', 'Bob Johnson'], authorPosition: 1,
        citations: 150, keywords: ['transformers', 'attention'], topics: ['NLP'],
        verificationStatus: 'VERIFIED', isFeatured: true, isShowcased: true, displayOrder: 1,
      },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockPortfolioLinks: CustomPortfolioLink[] = [
  {
    id: 'link-1', profileId: 'profile-1', title: 'Personal Portfolio Website', url: 'https://johndoe.dev',
    description: 'My personal portfolio showcasing projects and blog posts', linkType: 'portfolio',
    platform: 'Custom', siteName: 'John Doe Portfolio', thumbnailUrl: 'https://johndoe.dev/og-image.png',
    tags: ['portfolio', 'web development'], category: 'portfolio',
    isPublic: true, isFeatured: true, showPreview: true, displayOrder: 1,
    isVerified: true, verifiedAt: '2024-01-15T00:00:00Z', isAccessible: true,
    metaKeywords: [], createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'link-2', profileId: 'profile-1', title: 'YouTube Channel', url: 'https://youtube.com/@johndoe',
    description: 'Tech tutorials and coding content', linkType: 'video',
    platform: 'YouTube', thumbnailUrl: 'https://yt3.ggpht.com/placeholder',
    tags: ['youtube', 'tutorials', 'coding'], category: 'video',
    isPublic: true, isFeatured: false, showPreview: true, displayOrder: 2,
    isVerified: false, isAccessible: true, metaKeywords: [],
    createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'link-3', profileId: 'profile-1', title: 'Figma Design System', url: 'https://www.figma.com/@johndoe/design-system',
    description: 'Open source design system components', linkType: 'project',
    platform: 'Figma', tags: ['design', 'figma', 'ui'], category: 'design',
    isPublic: true, isFeatured: true, showPreview: true, displayOrder: 3,
    isVerified: false, isAccessible: true, metaKeywords: [],
    createdAt: '2024-01-08T00:00:00Z', updatedAt: '2024-01-08T00:00:00Z',
  },
];

const mockBatch4Status: Batch4IntegrationsStatus = {
  kaggle: { connected: true, id: 'kaggle-1', username: 'johndoe', tier: 'Expert', status: 'CONNECTED' },
  codingPlatforms: {
    leetcode: { connected: true, id: 'lc-1', username: 'johndoe', totalSolved: 456 },
    hackerrank: { connected: true, id: 'hr-1', username: 'johndoe', totalSolved: 320 },
    codeforces: { connected: false },
  },
  onlineCourses: {
    coursera: { connected: true, id: 'coursera-1', completedCourses: 18 },
    udemy: { connected: true, id: 'udemy-1', completedCourses: 28 },
  },
  academic: {
    googleScholar: { connected: true, id: 'scholar-1', totalPublications: 28, citations: 450 },
    researchgate: { connected: false },
  },
  portfolioLinks: { count: 3, featuredCount: 2 },
};

// ============================================
// API FUNCTIONS
// ============================================

export const batch4IntegrationsAPI = {
  // ============================================
  // KAGGLE
  // ============================================

  connectKaggle: async (username: string): Promise<{ profile: KaggleProfile }> => {
    if (USE_MOCK) {
      return { profile: { ...mockKaggleProfile, username, displayName: username } };
    }
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/kaggle/connect`, { username });
    return response.data;
  },

  getKaggleProfile: async (): Promise<KaggleProfile | null> => {
    if (USE_MOCK) return mockKaggleProfile;
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/kaggle/profile`);
    return response.data;
  },

  disconnectKaggle: async (): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: 'Kaggle disconnected successfully' };
    const response = await axios.delete(`${API_BASE_URL}/batch4-integrations/kaggle/disconnect`);
    return response.data;
  },

  // ============================================
  // CODING PLATFORMS
  // ============================================

  connectCodingPlatform: async (platform: CodingPlatformType, username: string): Promise<{ profile: CodingPlatformProfile }> => {
    if (USE_MOCK) {
      const mock = mockCodingPlatforms.find(p => p.platform === platform) || mockCodingPlatforms[0];
      return { profile: { ...mock, platform, username } };
    }
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/coding/connect`, { platform, username });
    return response.data;
  },

  getCodingPlatforms: async (): Promise<{ platforms: CodingPlatformProfile[] }> => {
    if (USE_MOCK) return { platforms: mockCodingPlatforms };
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/coding/platforms`);
    return response.data;
  },

  disconnectCodingPlatform: async (platform: CodingPlatformType): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: `${platform} disconnected successfully` };
    const response = await axios.delete(`${API_BASE_URL}/batch4-integrations/coding/${platform}/disconnect`);
    return response.data;
  },

  // ============================================
  // ONLINE COURSES
  // ============================================

  connectOnlineCourses: async (platform: OnlineCoursePlatform, username: string): Promise<{ profile: OnlineCourseProfile }> => {
    if (USE_MOCK) {
      const mock = mockOnlineCourseProfiles.find(p => p.platform === platform) || mockOnlineCourseProfiles[0];
      return { profile: { ...mock, platform, username } };
    }
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/courses/connect`, { platform, username });
    return response.data;
  },

  getOnlineCourseProfiles: async (): Promise<{ profiles: OnlineCourseProfile[] }> => {
    if (USE_MOCK) return { profiles: mockOnlineCourseProfiles };
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/courses/profiles`);
    return response.data;
  },

  disconnectOnlineCourses: async (platform: OnlineCoursePlatform): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: `${platform} disconnected successfully` };
    const response = await axios.delete(`${API_BASE_URL}/batch4-integrations/courses/${platform}/disconnect`);
    return response.data;
  },

  // ============================================
  // ACADEMIC PROFILES
  // ============================================

  connectAcademicProfile: async (platform: AcademicPlatform, profileUrl: string, displayName: string): Promise<{ profile: AcademicProfile }> => {
    if (USE_MOCK) {
      const mock = mockAcademicProfiles.find(p => p.platform === platform) || mockAcademicProfiles[0];
      return { profile: { ...mock, platform, profileUrl, displayName } };
    }
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/academic/connect`, { platform, profileUrl, displayName });
    return response.data;
  },

  getAcademicProfiles: async (): Promise<{ profiles: AcademicProfile[] }> => {
    if (USE_MOCK) return { profiles: mockAcademicProfiles };
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/academic/profiles`);
    return response.data;
  },

  disconnectAcademicProfile: async (platform: AcademicPlatform): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: `${platform} disconnected successfully` };
    const response = await axios.delete(`${API_BASE_URL}/batch4-integrations/academic/${platform}/disconnect`);
    return response.data;
  },

  // ============================================
  // PORTFOLIO LINKS
  // ============================================

  addPortfolioLink: async (linkData: Partial<CustomPortfolioLink>): Promise<{ link: CustomPortfolioLink }> => {
    if (USE_MOCK) {
      const newLink: CustomPortfolioLink = {
        id: `link-${Date.now()}`,
        profileId: 'profile-1',
        title: linkData.title || 'New Link',
        url: linkData.url || '',
        description: linkData.description,
        linkType: linkData.linkType,
        tags: linkData.tags || [],
        category: linkData.category,
        isPublic: true,
        isFeatured: linkData.isFeatured || false,
        showPreview: true,
        displayOrder: mockPortfolioLinks.length + 1,
        isVerified: false,
        isAccessible: true,
        metaKeywords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { link: newLink };
    }
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/portfolio-links`, linkData);
    return response.data;
  },

  getPortfolioLinks: async (): Promise<{ links: CustomPortfolioLink[] }> => {
    if (USE_MOCK) return { links: mockPortfolioLinks };
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/portfolio-links`);
    return response.data;
  },

  updatePortfolioLink: async (linkId: string, updateData: Partial<CustomPortfolioLink>): Promise<{ link: CustomPortfolioLink }> => {
    if (USE_MOCK) {
      const existing = mockPortfolioLinks.find(l => l.id === linkId);
      return { link: { ...existing!, ...updateData } };
    }
    const response = await axios.put(`${API_BASE_URL}/batch4-integrations/portfolio-links/${linkId}`, updateData);
    return response.data;
  },

  deletePortfolioLink: async (linkId: string): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: 'Portfolio link deleted successfully' };
    const response = await axios.delete(`${API_BASE_URL}/batch4-integrations/portfolio-links/${linkId}`);
    return response.data;
  },

  reorderPortfolioLinks: async (linkIds: string[]): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: 'Links reordered successfully' };
    const response = await axios.post(`${API_BASE_URL}/batch4-integrations/portfolio-links/reorder`, { linkIds });
    return response.data;
  },

  // ============================================
  // STATUS
  // ============================================

  getStatus: async (): Promise<Batch4IntegrationsStatus> => {
    if (USE_MOCK) return mockBatch4Status;
    const response = await axios.get(`${API_BASE_URL}/batch4-integrations/status`);
    return response.data;
  },
};

export default batch4IntegrationsAPI;
