import axios from 'axios';
import type {
  GithubProfile,
  GithubRepository,
  LinkedInProfile,
  IntegrationStatusResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// Mock data for GitHub
const mockGithubProfile: GithubProfile = {
  id: 'gh-1',
  profileId: 'profile-1',
  githubId: 'gh_123456',
  username: 'johndoe',
  displayName: 'John Doe',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1234567?v=4',
  profileUrl: 'https://github.com/johndoe',
  bio: 'Full-stack developer passionate about open source',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  blog: 'https://johndoe.dev',
  email: 'john@example.com',
  publicRepos: 45,
  privateRepos: 12,
  totalStars: 234,
  followers: 567,
  following: 123,
  gists: 8,
  totalContributions: 2345,
  contributionsLastYear: 987,
  longestStreak: 65,
  currentStreak: 12,
  topLanguages: [
    { name: 'TypeScript', percentage: 35, bytes: 1250000 },
    { name: 'JavaScript', percentage: 28, bytes: 1000000 },
    { name: 'Python', percentage: 20, bytes: 715000 },
    { name: 'Go', percentage: 10, bytes: 357000 },
    { name: 'Rust', percentage: 7, bytes: 250000 },
  ],
  status: 'CONNECTED',
  lastSyncAt: '2024-02-15T10:30:00Z',
  autoSync: true,
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-02-15T10:30:00Z',
};

const mockGithubRepos: GithubRepository[] = [
  {
    id: 'repo-1',
    githubProfileId: 'gh-1',
    repoId: 'r_123',
    name: 'awesome-project',
    fullName: 'johndoe/awesome-project',
    description: 'An awesome open source project built with React and TypeScript',
    language: 'TypeScript',
    htmlUrl: 'https://github.com/johndoe/awesome-project',
    stars: 156,
    forks: 34,
    watchers: 12,
    openIssues: 5,
    size: 2500,
    hasWiki: true,
    hasPages: true,
    hasProjects: true,
    hasDiscussions: true,
    topics: ['react', 'typescript', 'open-source'],
    isForked: false,
    isFork: false,
    isArchived: false,
    isPrivate: false,
    contributionCount: 234,
    role: 'owner',
    isShowcased: true,
    isPinned: true,
    displayOrder: 1,
    createdAt: '2023-01-15',
    updatedAt: '2024-02-10',
    pushedAt: '2024-02-10',
  },
  {
    id: 'repo-2',
    githubProfileId: 'gh-1',
    repoId: 'r_124',
    name: 'api-toolkit',
    fullName: 'johndoe/api-toolkit',
    description: 'A collection of API utilities and helpers',
    language: 'JavaScript',
    htmlUrl: 'https://github.com/johndoe/api-toolkit',
    stars: 89,
    forks: 21,
    watchers: 8,
    openIssues: 2,
    size: 1200,
    hasWiki: false,
    hasPages: false,
    hasProjects: false,
    hasDiscussions: false,
    topics: ['api', 'javascript', 'utilities'],
    isForked: false,
    isFork: false,
    isArchived: false,
    isPrivate: false,
    contributionCount: 156,
    role: 'owner',
    isShowcased: true,
    isPinned: false,
    displayOrder: 2,
    createdAt: '2023-06-20',
    updatedAt: '2024-01-25',
    pushedAt: '2024-01-25',
  },
];

// Mock data for LinkedIn
const mockLinkedInProfile: LinkedInProfile = {
  id: 'li-1',
  profileId: 'profile-1',
  linkedInId: 'li_123456',
  vanityName: 'johndoe',
  profileUrl: 'https://www.linkedin.com/in/johndoe',
  firstName: 'John',
  lastName: 'Doe',
  headline: 'Senior Software Engineer at Tech Corp',
  summary: 'Passionate software engineer with 10+ years of experience in building scalable web applications.',
  profilePicture: 'https://media.licdn.com/dms/image/placeholder.jpg',
  location: 'San Francisco Bay Area',
  country: 'United States',
  currentCompany: 'Tech Corp',
  currentTitle: 'Senior Software Engineer',
  industry: 'Computer Software',
  connections: 500,
  followersCount: 1250,
  positions: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      isCurrent: true,
      description: 'Leading development of microservices architecture',
    },
    {
      title: 'Software Engineer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      startDate: '2017-06',
      endDate: '2019-12',
      description: 'Full-stack development with React and Node.js',
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2015',
      endDate: '2017',
    },
  ],
  skills: [
    { name: 'JavaScript', endorsements: 45 },
    { name: 'React', endorsements: 38 },
    { name: 'Node.js', endorsements: 32 },
    { name: 'Python', endorsements: 28 },
    { name: 'AWS', endorsements: 25 },
  ],
  status: 'CONNECTED',
  lastSyncAt: '2024-02-15T10:30:00Z',
  autoSync: true,
  importWorkHistory: true,
  importEducation: true,
  importSkills: true,
  importCertifications: true,
  isVerified: true,
  verifiedAt: '2024-01-01T00:00:00Z',
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-02-15T10:30:00Z',
};

// Integrations API
export const integrationsAPI = {
  // Get integration status
  getStatus: async (): Promise<IntegrationStatusResponse> => {
    if (USE_MOCK) {
      return {
        github: {
          connected: true,
          id: mockGithubProfile.id,
          username: mockGithubProfile.username,
          status: mockGithubProfile.status,
          lastSyncAt: mockGithubProfile.lastSyncAt,
        },
        linkedin: {
          connected: true,
          id: mockLinkedInProfile.id,
          firstName: mockLinkedInProfile.firstName,
          lastName: mockLinkedInProfile.lastName,
          status: mockLinkedInProfile.status,
          lastSyncAt: mockLinkedInProfile.lastSyncAt,
          isVerified: mockLinkedInProfile.isVerified,
        },
      };
    }

    const response = await axios.get(`${API_BASE_URL}/integrations/status`);
    return response.data;
  },

  // GitHub Integration
  github: {
    getAuthUrl: async (): Promise<{ authUrl: string }> => {
      if (USE_MOCK) {
        return { authUrl: 'https://github.com/login/oauth/authorize?client_id=mock' };
      }
      const response = await axios.get(`${API_BASE_URL}/integrations/github/auth-url`);
      return response.data;
    },

    callback: async (code: string, state: string): Promise<{ profile: Partial<GithubProfile> }> => {
      if (USE_MOCK) {
        return { profile: mockGithubProfile };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/github/callback`, { code, state });
      return response.data;
    },

    getProfile: async (): Promise<GithubProfile> => {
      if (USE_MOCK) {
        return mockGithubProfile;
      }
      const response = await axios.get(`${API_BASE_URL}/integrations/github/profile`);
      return response.data;
    },

    sync: async (): Promise<{ message: string; lastSyncAt: string }> => {
      if (USE_MOCK) {
        return { message: 'GitHub profile synced successfully', lastSyncAt: new Date().toISOString() };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/github/sync`);
      return response.data;
    },

    getRepositories: async (params?: {
      language?: string;
      showcased?: boolean;
      page?: number;
      limit?: number;
    }): Promise<{
      repositories: GithubRepository[];
      total: number;
      page: number;
      totalPages: number;
      languages: { name: string; count: number }[];
    }> => {
      if (USE_MOCK) {
        let repos = [...mockGithubRepos];
        if (params?.language) {
          repos = repos.filter(r => r.language === params.language);
        }
        if (params?.showcased) {
          repos = repos.filter(r => r.isShowcased);
        }
        return {
          repositories: repos,
          total: repos.length,
          page: params?.page || 1,
          totalPages: 1,
          languages: [
            { name: 'TypeScript', count: 15 },
            { name: 'JavaScript', count: 12 },
            { name: 'Python', count: 8 },
          ],
        };
      }
      const response = await axios.get(`${API_BASE_URL}/integrations/github/repositories`, { params });
      return response.data;
    },

    toggleShowcase: async (repoId: string): Promise<{ isShowcased: boolean }> => {
      if (USE_MOCK) {
        const repo = mockGithubRepos.find(r => r.id === repoId);
        return { isShowcased: !(repo?.isShowcased || false) };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/github/repositories/${repoId}/showcase`);
      return response.data;
    },

    disconnect: async (): Promise<{ message: string }> => {
      if (USE_MOCK) {
        return { message: 'GitHub disconnected successfully' };
      }
      const response = await axios.delete(`${API_BASE_URL}/integrations/github/disconnect`);
      return response.data;
    },
  },

  // LinkedIn Integration
  linkedin: {
    getAuthUrl: async (): Promise<{ authUrl: string }> => {
      if (USE_MOCK) {
        return { authUrl: 'https://www.linkedin.com/oauth/v2/authorization?client_id=mock' };
      }
      const response = await axios.get(`${API_BASE_URL}/integrations/linkedin/auth-url`);
      return response.data;
    },

    callback: async (code: string, state: string): Promise<{ profile: Partial<LinkedInProfile> }> => {
      if (USE_MOCK) {
        return { profile: mockLinkedInProfile };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/linkedin/callback`, { code, state });
      return response.data;
    },

    getProfile: async (): Promise<LinkedInProfile> => {
      if (USE_MOCK) {
        return mockLinkedInProfile;
      }
      const response = await axios.get(`${API_BASE_URL}/integrations/linkedin/profile`);
      return response.data;
    },

    sync: async (): Promise<{ message: string; lastSyncAt: string }> => {
      if (USE_MOCK) {
        return { message: 'LinkedIn profile synced successfully', lastSyncAt: new Date().toISOString() };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/linkedin/sync`);
      return response.data;
    },

    importData: async (options: {
      importWorkHistory: boolean;
      importEducation: boolean;
      importSkills: boolean;
    }): Promise<{ imported: { workHistory?: number; education?: number; skills?: number } }> => {
      if (USE_MOCK) {
        return {
          imported: {
            workHistory: options.importWorkHistory ? 2 : undefined,
            education: options.importEducation ? 1 : undefined,
            skills: options.importSkills ? 5 : undefined,
          },
        };
      }
      const response = await axios.post(`${API_BASE_URL}/integrations/linkedin/import`, options);
      return response.data;
    },

    disconnect: async (): Promise<{ message: string }> => {
      if (USE_MOCK) {
        return { message: 'LinkedIn disconnected successfully' };
      }
      const response = await axios.delete(`${API_BASE_URL}/integrations/linkedin/disconnect`);
      return response.data;
    },
  },
};

export default integrationsAPI;
