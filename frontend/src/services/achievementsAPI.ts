import axios from 'axios';
import type {
  Achievement,
  AchievementDefinition,
  AchievementStats,
  AchievementLeaderboardEntry
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// Mock data for achievements
const mockAchievementDefinitions: AchievementDefinition[] = [
  {
    id: '1',
    name: 'profile_starter',
    title: 'Profile Starter',
    description: 'Complete your basic profile information',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'profileCompleteness', operator: 'gte', value: 20 },
    targetValue: 1,
    points: 10,
    badgeIcon: 'user',
    badgeColor: 'blue',
    tier: 'bronze',
    isPublic: true,
    isActive: true,
    displayOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'profile_builder',
    title: 'Profile Builder',
    description: 'Complete 50% of your profile',
    category: 'profile',
    type: 'one_time',
    criteria: { field: 'profileCompleteness', operator: 'gte', value: 50 },
    targetValue: 1,
    points: 25,
    badgeIcon: 'user-check',
    badgeColor: 'green',
    tier: 'silver',
    isPublic: true,
    isActive: true,
    displayOrder: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'skill_collector',
    title: 'Skill Collector',
    description: 'Add your first 5 skills',
    category: 'skill',
    type: 'progressive',
    criteria: { field: 'skillsCount', operator: 'gte', value: 5 },
    targetValue: 5,
    points: 15,
    badgeIcon: 'code',
    badgeColor: 'purple',
    tier: 'bronze',
    isPublic: true,
    isActive: true,
    displayOrder: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'github_connected',
    title: 'GitHub Connected',
    description: 'Connect your GitHub account',
    category: 'social',
    type: 'one_time',
    criteria: { field: 'githubConnected', operator: 'eq', value: true },
    targetValue: 1,
    points: 25,
    badgeIcon: 'github',
    badgeColor: 'gray',
    tier: 'silver',
    isPublic: true,
    isActive: true,
    displayOrder: 4,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockUserAchievements: Achievement[] = [
  {
    id: '1',
    profileId: 'profile-1',
    title: 'Profile Starter',
    description: 'Complete your basic profile information',
    type: 'one_time',
    category: 'profile',
    badgeIcon: 'user',
    badgeColor: 'blue',
    points: 10,
    currentProgress: 1,
    targetProgress: 1,
    isCompleted: true,
    earnedAt: '2024-01-15',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    profileId: 'profile-1',
    title: 'Skill Collector',
    description: 'Add your first 5 skills',
    type: 'progressive',
    category: 'skill',
    badgeIcon: 'code',
    badgeColor: 'purple',
    points: 15,
    currentProgress: 3,
    targetProgress: 5,
    isCompleted: false,
    createdAt: '2024-01-20',
  },
];

const mockStats: AchievementStats = {
  totalPoints: 35,
  maxPossiblePoints: 500,
  progressPercentage: 7,
  earnedCount: 2,
  totalAvailable: 20,
  byCategory: {
    profile: { total: 5, earned: 1, points: 10 },
    skill: { total: 5, earned: 1, points: 15 },
    social: { total: 5, earned: 0, points: 0 },
    activity: { total: 3, earned: 0, points: 0 },
    milestone: { total: 2, earned: 1, points: 10 },
  },
  tierDistribution: {
    platinum: 0,
    gold: 0,
    silver: 1,
    bronze: 1,
  },
  recentAchievements: mockUserAchievements.filter(a => a.isCompleted),
};

const mockLeaderboard: AchievementLeaderboardEntry[] = [
  { userId: '1', name: 'John Doe', headline: 'Senior Developer', totalPoints: 450, achievementCount: 15 },
  { userId: '2', name: 'Jane Smith', headline: 'Product Manager', totalPoints: 380, achievementCount: 12 },
  { userId: '3', name: 'Bob Johnson', headline: 'Full Stack Engineer', totalPoints: 320, achievementCount: 10 },
  { userId: '4', name: 'Alice Brown', headline: 'UX Designer', totalPoints: 290, achievementCount: 9 },
  { userId: '5', name: 'Charlie Wilson', headline: 'Data Scientist', totalPoints: 250, achievementCount: 8 },
];

// Achievements API
export const achievementsAPI = {
  // Get achievement definitions
  getDefinitions: async (category?: string): Promise<{ definitions: Record<string, AchievementDefinition[]>; categories: string[] }> => {
    if (USE_MOCK) {
      const filtered = category
        ? mockAchievementDefinitions.filter(d => d.category === category)
        : mockAchievementDefinitions;

      const grouped = filtered.reduce((acc: Record<string, AchievementDefinition[]>, def) => {
        if (!acc[def.category]) acc[def.category] = [];
        acc[def.category].push(def);
        return acc;
      }, {});

      return { definitions: grouped, categories: Object.keys(grouped) };
    }

    const response = await axios.get(`${API_BASE_URL}/achievements/definitions`, {
      params: { category },
    });
    return response.data;
  },

  // Get user achievements
  getUserAchievements: async (): Promise<{
    totalPoints: number;
    totalEarned: number;
    totalAvailable: number;
    achievements: {
      earned: Achievement[];
      inProgress: Achievement[];
      locked: Achievement[];
    };
  }> => {
    if (USE_MOCK) {
      return {
        totalPoints: 35,
        totalEarned: mockUserAchievements.filter(a => a.isCompleted).length,
        totalAvailable: mockAchievementDefinitions.length,
        achievements: {
          earned: mockUserAchievements.filter(a => a.isCompleted),
          inProgress: mockUserAchievements.filter(a => !a.isCompleted),
          locked: [],
        },
      };
    }

    const response = await axios.get(`${API_BASE_URL}/achievements/me`);
    return response.data;
  },

  // Check and update achievements
  checkAchievements: async (): Promise<{ newlyEarned: Achievement[] }> => {
    if (USE_MOCK) {
      return { newlyEarned: [] };
    }

    const response = await axios.post(`${API_BASE_URL}/achievements/check`);
    return response.data;
  },

  // Get achievement stats
  getStats: async (): Promise<AchievementStats> => {
    if (USE_MOCK) {
      return mockStats;
    }

    const response = await axios.get(`${API_BASE_URL}/achievements/stats`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit?: number): Promise<{ leaderboard: AchievementLeaderboardEntry[] }> => {
    if (USE_MOCK) {
      return { leaderboard: mockLeaderboard.slice(0, limit || 10) };
    }

    const response = await axios.get(`${API_BASE_URL}/achievements/leaderboard`, {
      params: { limit },
    });
    return response.data;
  },

  // Seed achievement definitions (admin)
  seedDefinitions: async (): Promise<{ count: number }> => {
    if (USE_MOCK) {
      return { count: mockAchievementDefinitions.length };
    }

    const response = await axios.post(`${API_BASE_URL}/achievements/definitions/seed`);
    return response.data;
  },
};

export default achievementsAPI;
