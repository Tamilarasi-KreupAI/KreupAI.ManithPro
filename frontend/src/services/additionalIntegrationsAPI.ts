import axios from 'axios';
import type {
  StackOverflowProfile,
  NotionPortfolio,
  GitLabProfile,
  DesignPortfolio,
  BlogPlatform,
  AllIntegrationsStatusResponse,
  DesignPlatformType,
  BlogPlatformType,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// ============================================
// MOCK DATA
// ============================================

const mockStackOverflowProfile: StackOverflowProfile = {
  id: 'so-1',
  profileId: 'profile-1',
  stackOverflowId: '12345',
  displayName: 'johndoe',
  profileUrl: 'https://stackoverflow.com/users/12345/johndoe',
  avatarUrl: 'https://www.gravatar.com/avatar/placeholder',
  websiteUrl: 'https://johndoe.dev',
  location: 'San Francisco, CA',
  aboutMe: 'Full-stack developer passionate about clean code',
  reputation: 15420,
  reputationChangeYear: 3200,
  reputationChangeQuarter: 850,
  reputationChangeMonth: 320,
  reputationChangeWeek: 75,
  reputationChangeDay: 15,
  badges: {
    gold: 3,
    silver: 28,
    bronze: 67,
  },
  questionCount: 45,
  answerCount: 312,
  acceptedAnswerCount: 89,
  acceptRate: 78,
  topTags: [
    { name: 'javascript', count: 145, score: 2340, isTopTag: true },
    { name: 'typescript', count: 89, score: 1560, isTopTag: true },
    { name: 'react', count: 76, score: 1230, isTopTag: true },
    { name: 'node.js', count: 54, score: 890, isTopTag: false },
    { name: 'python', count: 32, score: 450, isTopTag: false },
  ],
  recentAnswers: [
    {
      id: 'ans-1',
      questionId: 'q-1',
      questionTitle: 'How to fix React useEffect infinite loop?',
      score: 45,
      isAccepted: true,
      createdAt: '2024-01-15T10:00:00Z',
      url: 'https://stackoverflow.com/a/123456',
    },
    {
      id: 'ans-2',
      questionId: 'q-2',
      questionTitle: 'TypeScript generic constraints explained',
      score: 32,
      isAccepted: true,
      createdAt: '2024-01-10T14:30:00Z',
      url: 'https://stackoverflow.com/a/123457',
    },
  ],
  recentQuestions: [
    {
      id: 'q-1',
      title: 'Best practices for React state management in 2024?',
      score: 28,
      answerCount: 12,
      isAnswered: true,
      viewCount: 1540,
      tags: ['react', 'state-management', 'redux'],
      createdAt: '2024-01-05T09:00:00Z',
      url: 'https://stackoverflow.com/q/789012',
    },
  ],
  status: 'CONNECTED',
  lastSyncAt: new Date().toISOString(),
  autoSync: true,
  showOnProfile: true,
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const mockNotionPortfolio: NotionPortfolio = {
  id: 'notion-1',
  profileId: 'profile-1',
  workspaceId: 'ws-123',
  workspaceName: 'John\'s Workspace',
  workspaceIcon: 'N',
  pages: [
    {
      id: 'page-1',
      title: 'E-commerce Platform Case Study',
      url: 'https://notion.so/page-1',
      icon: 'S',
      lastEditedAt: '2024-01-20T10:00:00Z',
      isImported: true,
      importedAsType: 'case_study',
    },
    {
      id: 'page-2',
      title: 'Mobile App Design Process',
      url: 'https://notion.so/page-2',
      icon: 'P',
      lastEditedAt: '2024-01-18T14:30:00Z',
      isImported: false,
    },
    {
      id: 'page-3',
      title: 'API Architecture Documentation',
      url: 'https://notion.so/page-3',
      lastEditedAt: '2024-01-15T09:15:00Z',
      isImported: true,
      importedAsType: 'article',
    },
  ],
  databases: [
    {
      id: 'db-1',
      title: 'Project Tracker',
      description: 'Track all ongoing projects',
      url: 'https://notion.so/db-1',
      itemCount: 24,
      lastEditedAt: '2024-01-22T11:00:00Z',
    },
  ],
  importedProjects: [
    {
      id: 'imp-1',
      notionPageId: 'page-1',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      status: 'Completed',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      url: 'https://notion.so/page-1',
      importedAt: '2024-01-20T10:30:00Z',
    },
  ],
  lastSyncAt: new Date().toISOString(),
  autoSync: true,
  status: 'CONNECTED',
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const mockGitLabProfile: GitLabProfile = {
  id: 'gl-1',
  profileId: 'profile-1',
  gitLabId: 'gl-12345',
  username: 'johndoe',
  displayName: 'John Doe',
  avatarUrl: 'https://gitlab.com/uploads/user/avatar/placeholder.png',
  profileUrl: 'https://gitlab.com/johndoe',
  bio: 'DevOps Engineer | CI/CD Enthusiast',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  email: 'john@example.com',
  company: 'TechCorp',
  jobTitle: 'Senior DevOps Engineer',
  publicRepos: 34,
  privateRepos: 12,
  followers: 156,
  following: 89,
  totalStars: 423,
  totalForks: 87,
  totalMergeRequests: 234,
  totalIssues: 156,
  totalContributions: 1245,
  contributionsLastYear: 456,
  topLanguages: [
    { name: 'Python', percentage: 35, bytes: 250000 },
    { name: 'Go', percentage: 28, bytes: 200000 },
    { name: 'Shell', percentage: 20, bytes: 143000 },
    { name: 'YAML', percentage: 12, bytes: 86000 },
    { name: 'Dockerfile', percentage: 5, bytes: 35000 },
  ],
  projects: [
    {
      id: 'proj-1',
      gitLabProfileId: 'gl-1',
      projectId: 'gl-proj-1',
      name: 'kubernetes-helm-charts',
      nameWithNamespace: 'johndoe/kubernetes-helm-charts',
      path: 'kubernetes-helm-charts',
      pathWithNamespace: 'johndoe/kubernetes-helm-charts',
      description: 'Collection of production-ready Helm charts',
      visibility: 'public',
      webUrl: 'https://gitlab.com/johndoe/kubernetes-helm-charts',
      topics: ['kubernetes', 'helm', 'devops'],
      stars: 145,
      forks: 34,
      openIssuesCount: 5,
      openMergeRequestsCount: 2,
      pipelinesEnabled: true,
      lastActivityAt: '2024-01-20T10:00:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      isArchived: false,
      isForked: false,
      isMirror: false,
      role: 'owner',
      isShowcased: true,
      displayOrder: 1,
    },
    {
      id: 'proj-2',
      gitLabProfileId: 'gl-1',
      projectId: 'gl-proj-2',
      name: 'ci-cd-templates',
      nameWithNamespace: 'johndoe/ci-cd-templates',
      path: 'ci-cd-templates',
      pathWithNamespace: 'johndoe/ci-cd-templates',
      description: 'Reusable CI/CD pipeline templates',
      visibility: 'public',
      webUrl: 'https://gitlab.com/johndoe/ci-cd-templates',
      topics: ['ci-cd', 'gitlab-ci', 'automation'],
      stars: 89,
      forks: 23,
      openIssuesCount: 3,
      openMergeRequestsCount: 1,
      pipelinesEnabled: true,
      lastActivityAt: '2024-01-18T14:30:00Z',
      createdAt: '2023-08-15T00:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      isArchived: false,
      isForked: false,
      isMirror: false,
      role: 'owner',
      isShowcased: true,
      displayOrder: 2,
    },
  ],
  groups: [
    {
      id: 'grp-1',
      name: 'DevOps Community',
      path: 'devops-community',
      description: 'Open source DevOps tools and templates',
      visibility: 'public',
      webUrl: 'https://gitlab.com/devops-community',
      projectCount: 15,
      memberCount: 234,
    },
  ],
  status: 'CONNECTED',
  lastSyncAt: new Date().toISOString(),
  autoSync: true,
  connectedAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const mockDesignPortfolios: DesignPortfolio[] = [
  {
    id: 'design-1',
    profileId: 'profile-1',
    platform: 'behance',
    platformUserId: 'behance-123',
    username: 'johndoe_design',
    displayName: 'John Doe',
    avatarUrl: 'https://mir-s3-cdn-cf.behance.net/user/placeholder.jpg',
    profileUrl: 'https://behance.net/johndoe_design',
    bio: 'UI/UX Designer crafting delightful experiences',
    location: 'San Francisco, CA',
    website: 'https://johndoe.design',
    specializations: ['UI Design', 'UX Research', 'Brand Identity'],
    followers: 4523,
    following: 234,
    projectsCount: 28,
    appreciations: 15670,
    views: 234500,
    likes: 12340,
    comments: 567,
    fields: ['UI/UX', 'Web Design', 'Mobile Design'],
    projects: [
      {
        id: 'dp-1',
        designPortfolioId: 'design-1',
        projectId: 'bp-1',
        title: 'Finance App Redesign',
        description: 'Complete redesign of a fintech mobile application',
        url: 'https://behance.net/gallery/finance-app',
        thumbnailUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/placeholder.jpg',
        images: [
          { url: 'https://mir-s3-cdn-cf.behance.net/image1.jpg', width: 1920, height: 1080 },
          { url: 'https://mir-s3-cdn-cf.behance.net/image2.jpg', width: 1920, height: 1080 },
        ],
        fields: ['UI/UX', 'Mobile Design'],
        tools: ['Figma', 'Principle', 'After Effects'],
        tags: ['fintech', 'mobile', 'ios'],
        colors: ['#1E88E5', '#FFFFFF', '#263238'],
        views: 12500,
        appreciations: 890,
        likes: 756,
        comments: 45,
        publishedAt: '2024-01-10T00:00:00Z',
        isFeatured: true,
        isShowcased: true,
        displayOrder: 1,
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
    id: 'design-2',
    profileId: 'profile-1',
    platform: 'dribbble',
    platformUserId: 'dribbble-456',
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://cdn.dribbble.com/users/placeholder.png',
    profileUrl: 'https://dribbble.com/johndoe',
    bio: 'Product Designer | Creating beautiful interfaces',
    specializations: ['Product Design', 'Icon Design', 'Illustration'],
    followers: 2890,
    following: 156,
    projectsCount: 42,
    appreciations: 0,
    views: 145000,
    likes: 8920,
    comments: 234,
    fields: ['Product Design', 'Icons', 'Illustrations'],
    projects: [
      {
        id: 'dp-2',
        designPortfolioId: 'design-2',
        projectId: 'dr-1',
        title: 'Icon Set - E-commerce',
        description: 'Custom icon set for e-commerce platforms',
        url: 'https://dribbble.com/shots/icon-set-ecommerce',
        thumbnailUrl: 'https://cdn.dribbble.com/shot-placeholder.png',
        images: [
          { url: 'https://cdn.dribbble.com/shot1.png', width: 1600, height: 1200 },
        ],
        fields: ['Icons'],
        tools: ['Illustrator', 'Figma'],
        tags: ['icons', 'ecommerce', 'ui'],
        views: 5600,
        appreciations: 0,
        likes: 423,
        comments: 28,
        publishedAt: '2024-01-15T00:00:00Z',
        isFeatured: false,
        isShowcased: true,
        displayOrder: 1,
      },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockBlogPlatforms: BlogPlatform[] = [
  {
    id: 'blog-1',
    profileId: 'profile-1',
    platform: 'medium',
    platformUserId: 'medium-123',
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://miro.medium.com/fit/c/placeholder.jpg',
    profileUrl: 'https://medium.com/@johndoe',
    bio: 'Writing about software engineering, architecture, and career growth',
    followersCount: 5670,
    followingCount: 234,
    postsCount: 45,
    totalReactions: 12340,
    totalViews: 456000,
    totalComments: 890,
    topTags: [
      { name: 'software-engineering', count: 18 },
      { name: 'javascript', count: 15 },
      { name: 'career', count: 12 },
      { name: 'react', count: 10 },
      { name: 'typescript', count: 8 },
    ],
    featuredPost: {
      id: 'post-1',
      blogPlatformId: 'blog-1',
      postId: 'mp-1',
      title: 'The Complete Guide to React Performance Optimization',
      slug: 'complete-guide-react-performance',
      url: 'https://medium.com/@johndoe/complete-guide-react-performance',
      excerpt: 'Learn how to optimize your React applications for maximum performance...',
      coverImage: 'https://miro.medium.com/max/1400/placeholder.jpg',
      tags: ['react', 'performance', 'javascript'],
      readingTime: 12,
      reactions: 2340,
      comments: 156,
      views: 45000,
      isPublished: true,
      isFeatured: true,
      isShowcased: true,
      publishedAt: '2024-01-10T00:00:00Z',
      displayOrder: 1,
    },
    recentPosts: [
      {
        id: 'post-1',
        blogPlatformId: 'blog-1',
        postId: 'mp-1',
        title: 'The Complete Guide to React Performance Optimization',
        slug: 'complete-guide-react-performance',
        url: 'https://medium.com/@johndoe/complete-guide-react-performance',
        excerpt: 'Learn how to optimize your React applications...',
        coverImage: 'https://miro.medium.com/max/1400/placeholder.jpg',
        tags: ['react', 'performance'],
        readingTime: 12,
        reactions: 2340,
        comments: 156,
        views: 45000,
        isPublished: true,
        isFeatured: true,
        isShowcased: true,
        publishedAt: '2024-01-10T00:00:00Z',
        displayOrder: 1,
      },
      {
        id: 'post-2',
        blogPlatformId: 'blog-1',
        postId: 'mp-2',
        title: 'TypeScript Best Practices in 2024',
        slug: 'typescript-best-practices-2024',
        url: 'https://medium.com/@johndoe/typescript-best-practices-2024',
        excerpt: 'Stay up to date with the latest TypeScript patterns...',
        tags: ['typescript', 'javascript'],
        readingTime: 8,
        reactions: 1560,
        comments: 89,
        views: 28000,
        isPublished: true,
        isFeatured: false,
        isShowcased: true,
        publishedAt: '2024-01-05T00:00:00Z',
        displayOrder: 2,
      },
    ],
    publications: [
      {
        id: 'pub-1',
        name: 'JavaScript in Plain English',
        description: 'New JavaScript and Web Development content every day',
        url: 'https://javascript.plainenglish.io',
        imageUrl: 'https://miro.medium.com/fit/c/placeholder-pub.jpg',
        followerCount: 234000,
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
    id: 'blog-2',
    profileId: 'profile-1',
    platform: 'devto',
    platformUserId: 'devto-456',
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://dev.to/user/placeholder.png',
    profileUrl: 'https://dev.to/johndoe',
    bio: 'Full-stack developer | Open source contributor',
    followersCount: 3450,
    followingCount: 189,
    postsCount: 32,
    totalReactions: 8900,
    totalViews: 234000,
    totalComments: 567,
    topTags: [
      { name: 'javascript', count: 12 },
      { name: 'webdev', count: 10 },
      { name: 'react', count: 8 },
      { name: 'tutorial', count: 7 },
    ],
    recentPosts: [
      {
        id: 'post-3',
        blogPlatformId: 'blog-2',
        postId: 'dp-1',
        title: 'Building a CLI Tool with Node.js',
        slug: 'building-cli-tool-nodejs',
        url: 'https://dev.to/johndoe/building-cli-tool-nodejs',
        excerpt: 'Learn how to build your own command-line tool...',
        coverImage: 'https://dev.to/cover/placeholder.jpg',
        tags: ['nodejs', 'cli', 'javascript'],
        readingTime: 10,
        reactions: 890,
        comments: 45,
        views: 12000,
        isPublished: true,
        isFeatured: false,
        isShowcased: true,
        publishedAt: '2024-01-18T00:00:00Z',
        displayOrder: 1,
      },
    ],
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    showOnProfile: true,
    connectedAt: '2024-01-02T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockAllIntegrationsStatus: AllIntegrationsStatusResponse = {
  github: { connected: true, id: 'gh-1', username: 'johndoe', status: 'CONNECTED' },
  linkedin: { connected: true, id: 'li-1', firstName: 'John', lastName: 'Doe', status: 'CONNECTED', isVerified: true },
  stackoverflow: { connected: true, id: 'so-1', displayName: 'johndoe', reputation: 15420, status: 'CONNECTED' },
  notion: { connected: true, id: 'notion-1', workspaceName: "John's Workspace", pageCount: 3, status: 'CONNECTED' },
  gitlab: { connected: true, id: 'gl-1', username: 'johndoe', status: 'CONNECTED' },
  design: {
    behance: { connected: true, id: 'design-1', username: 'johndoe_design', projectsCount: 28, status: 'CONNECTED' },
    dribbble: { connected: true, id: 'design-2', username: 'johndoe', projectsCount: 42, status: 'CONNECTED' },
  },
  blog: {
    medium: { connected: true, id: 'blog-1', username: 'johndoe', postsCount: 45, status: 'CONNECTED' },
    devto: { connected: true, id: 'blog-2', username: 'johndoe', postsCount: 32, status: 'CONNECTED' },
    hashnode: { connected: false },
  },
};

// ============================================
// API FUNCTIONS
// ============================================

export const additionalIntegrationsAPI = {
  // ============================================
  // STACK OVERFLOW
  // ============================================

  connectStackOverflow: async (userId: string): Promise<{ profile: StackOverflowProfile }> => {
    if (USE_MOCK) {
      return { profile: mockStackOverflowProfile };
    }

    const response = await axios.post(`${API_BASE_URL}/additional-integrations/stackoverflow/connect`, { userId });
    return response.data;
  },

  getStackOverflowProfile: async (): Promise<StackOverflowProfile | null> => {
    if (USE_MOCK) {
      return mockStackOverflowProfile;
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/stackoverflow/profile`);
    return response.data;
  },

  disconnectStackOverflow: async (): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: 'Stack Overflow disconnected successfully' };
    }

    const response = await axios.delete(`${API_BASE_URL}/additional-integrations/stackoverflow/disconnect`);
    return response.data;
  },

  // ============================================
  // NOTION
  // ============================================

  connectNotion: async (code: string): Promise<{ portfolio: NotionPortfolio }> => {
    if (USE_MOCK) {
      return { portfolio: mockNotionPortfolio };
    }

    const response = await axios.post(`${API_BASE_URL}/additional-integrations/notion/connect`, { code });
    return response.data;
  },

  getNotionPortfolio: async (): Promise<NotionPortfolio | null> => {
    if (USE_MOCK) {
      return mockNotionPortfolio;
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/notion/portfolio`);
    return response.data;
  },

  disconnectNotion: async (): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: 'Notion disconnected successfully' };
    }

    const response = await axios.delete(`${API_BASE_URL}/additional-integrations/notion/disconnect`);
    return response.data;
  },

  // ============================================
  // GITLAB
  // ============================================

  connectGitLab: async (code: string): Promise<{ profile: GitLabProfile }> => {
    if (USE_MOCK) {
      return { profile: mockGitLabProfile };
    }

    const response = await axios.post(`${API_BASE_URL}/additional-integrations/gitlab/connect`, { code });
    return response.data;
  },

  getGitLabProfile: async (): Promise<GitLabProfile | null> => {
    if (USE_MOCK) {
      return mockGitLabProfile;
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/gitlab/profile`);
    return response.data;
  },

  disconnectGitLab: async (): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: 'GitLab disconnected successfully' };
    }

    const response = await axios.delete(`${API_BASE_URL}/additional-integrations/gitlab/disconnect`);
    return response.data;
  },

  // ============================================
  // DESIGN PLATFORMS (BEHANCE/DRIBBBLE)
  // ============================================

  connectDesignPlatform: async (
    platform: DesignPlatformType,
    username: string
  ): Promise<{ portfolio: DesignPortfolio }> => {
    if (USE_MOCK) {
      const portfolio = mockDesignPortfolios.find(p => p.platform === platform);
      return { portfolio: portfolio || mockDesignPortfolios[0] };
    }

    const response = await axios.post(`${API_BASE_URL}/additional-integrations/design/connect`, { platform, username });
    return response.data;
  },

  getDesignPortfolios: async (): Promise<{ portfolios: DesignPortfolio[] }> => {
    if (USE_MOCK) {
      return { portfolios: mockDesignPortfolios };
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/design/portfolios`);
    return response.data;
  },

  disconnectDesignPlatform: async (platform: DesignPlatformType): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: `${platform} disconnected successfully` };
    }

    const response = await axios.delete(`${API_BASE_URL}/additional-integrations/design/${platform}/disconnect`);
    return response.data;
  },

  // ============================================
  // BLOG PLATFORMS (MEDIUM/DEV.TO/HASHNODE)
  // ============================================

  connectBlogPlatform: async (
    platform: BlogPlatformType,
    username: string
  ): Promise<{ blogPlatform: BlogPlatform }> => {
    if (USE_MOCK) {
      const blog = mockBlogPlatforms.find(b => b.platform === platform);
      return { blogPlatform: blog || mockBlogPlatforms[0] };
    }

    const response = await axios.post(`${API_BASE_URL}/additional-integrations/blog/connect`, { platform, username });
    return response.data;
  },

  getBlogPlatforms: async (): Promise<{ platforms: BlogPlatform[] }> => {
    if (USE_MOCK) {
      return { platforms: mockBlogPlatforms };
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/blog/platforms`);
    return response.data;
  },

  disconnectBlogPlatform: async (platform: BlogPlatformType): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: `${platform} disconnected successfully` };
    }

    const response = await axios.delete(`${API_BASE_URL}/additional-integrations/blog/${platform}/disconnect`);
    return response.data;
  },

  // ============================================
  // STATUS
  // ============================================

  getAllIntegrationsStatus: async (): Promise<AllIntegrationsStatusResponse> => {
    if (USE_MOCK) {
      return mockAllIntegrationsStatus;
    }

    const response = await axios.get(`${API_BASE_URL}/additional-integrations/status/all`);
    return response.data;
  },
};

export default additionalIntegrationsAPI;
