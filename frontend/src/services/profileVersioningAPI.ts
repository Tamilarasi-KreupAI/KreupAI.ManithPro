import axios from 'axios';
import type { ProfileVersion, VersionComparison } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// Mock data for profile versions
const mockVersions: ProfileVersion[] = [
  {
    id: 'v1',
    profileId: 'profile-1',
    versionNumber: 1,
    versionLabel: 'Initial Profile',
    profileSnapshot: {
      headline: 'Software Engineer',
      summary: 'Passionate about building great software',
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    changeSummary: 'Initial version',
    createdBy: 'user',
    createdAt: '2024-01-01T10:00:00Z',
    isFirst: true,
    isLatest: false,
    changeCount: 0,
  },
  {
    id: 'v2',
    profileId: 'profile-1',
    versionNumber: 2,
    versionLabel: 'Added skills',
    profileSnapshot: {
      headline: 'Software Engineer',
      summary: 'Passionate about building great software',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    },
    changes: [
      { field: 'skills', oldValue: '3 items', newValue: '5 items', type: 'add' },
    ],
    changeSummary: 'Added 2 item(s)',
    createdBy: 'user',
    createdAt: '2024-01-15T14:30:00Z',
    isFirst: false,
    isLatest: false,
    changeCount: 1,
  },
  {
    id: 'v3',
    profileId: 'profile-1',
    versionNumber: 3,
    versionLabel: 'Updated headline',
    profileSnapshot: {
      headline: 'Senior Software Engineer',
      summary: 'Passionate about building great software and leading teams',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    },
    changes: [
      { field: 'headline', oldValue: 'Software Engineer', newValue: 'Senior Software Engineer', type: 'update' },
      { field: 'summary', oldValue: 'Passionate about building great software', newValue: 'Passionate about building great software and leading teams', type: 'update' },
    ],
    changeSummary: 'Updated headline, summary',
    createdBy: 'user',
    createdAt: '2024-02-01T09:15:00Z',
    isFirst: false,
    isLatest: true,
    changeCount: 2,
  },
];

// Profile Versioning API
export const profileVersioningAPI = {
  // Get all versions
  getVersions: async (): Promise<{ total: number; versions: ProfileVersion[] }> => {
    if (USE_MOCK) {
      return {
        total: mockVersions.length,
        versions: mockVersions.map(({ profileSnapshot, ...v }) => v),
      };
    }

    const response = await axios.get(`${API_BASE_URL}/profile-versions`);
    return response.data;
  },

  // Get version timeline
  getTimeline: async (): Promise<{ total: number; timeline: ProfileVersion[] }> => {
    if (USE_MOCK) {
      return {
        total: mockVersions.length,
        timeline: mockVersions,
      };
    }

    const response = await axios.get(`${API_BASE_URL}/profile-versions/timeline`);
    return response.data;
  },

  // Create a new version (manual save point)
  createVersion: async (versionLabel?: string): Promise<{ version: ProfileVersion }> => {
    if (USE_MOCK) {
      const newVersion: ProfileVersion = {
        id: `v${mockVersions.length + 1}`,
        profileId: 'profile-1',
        versionNumber: mockVersions.length + 1,
        versionLabel: versionLabel || `Version ${mockVersions.length + 1}`,
        profileSnapshot: mockVersions[mockVersions.length - 1].profileSnapshot,
        changeSummary: 'Manual save point',
        createdBy: 'user',
        createdAt: new Date().toISOString(),
        isLatest: true,
        changeCount: 0,
      };
      return { version: newVersion };
    }

    const response = await axios.post(`${API_BASE_URL}/profile-versions`, { versionLabel });
    return response.data;
  },

  // Get a specific version
  getVersion: async (versionId: string): Promise<ProfileVersion> => {
    if (USE_MOCK) {
      const version = mockVersions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      return version;
    }

    const response = await axios.get(`${API_BASE_URL}/profile-versions/${versionId}`);
    return response.data;
  },

  // Compare two versions
  compareVersions: async (versionId1: string, versionId2: string): Promise<VersionComparison> => {
    if (USE_MOCK) {
      const v1 = mockVersions.find(v => v.id === versionId1);
      const v2 = mockVersions.find(v => v.id === versionId2);
      if (!v1 || !v2) throw new Error('Version not found');

      return {
        version1: {
          id: v1.id,
          versionNumber: v1.versionNumber,
          versionLabel: v1.versionLabel,
          createdAt: v1.createdAt,
        },
        version2: {
          id: v2.id,
          versionNumber: v2.versionNumber,
          versionLabel: v2.versionLabel,
          createdAt: v2.createdAt,
        },
        changes: v2.changes || [],
        summary: `Comparing version ${v1.versionNumber} to version ${v2.versionNumber}`,
      };
    }

    const response = await axios.get(`${API_BASE_URL}/profile-versions/compare/${versionId1}/${versionId2}`);
    return response.data;
  },

  // Restore a version
  restoreVersion: async (versionId: string): Promise<{ message: string; restoredVersion: number }> => {
    if (USE_MOCK) {
      const version = mockVersions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      return { message: `Profile restored to version ${version.versionNumber}`, restoredVersion: version.versionNumber };
    }

    const response = await axios.post(`${API_BASE_URL}/profile-versions/${versionId}/restore`);
    return response.data;
  },

  // Delete a version
  deleteVersion: async (versionId: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return { message: 'Version deleted successfully' };
    }

    const response = await axios.delete(`${API_BASE_URL}/profile-versions/${versionId}`);
    return response.data;
  },
};

export default profileVersioningAPI;
