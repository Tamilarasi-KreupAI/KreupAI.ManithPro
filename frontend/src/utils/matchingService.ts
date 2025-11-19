/**
 * AI-Powered Matching Service
 * Intelligent job and candidate matching using scoring algorithms
 */

export interface MatchScore {
  overallScore: number; // 0-100
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
    culture: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface JobRecommendation {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  matchScore: MatchScore;
  postedDate: Date;
  applicationDeadline?: Date;
  isRemote: boolean;
  requiredSkills: string[];
  experienceLevel: string;
}

export interface CandidateRecommendation {
  candidateId: string;
  name: string;
  title: string;
  location: string;
  expectedSalary: {
    min: number;
    max: number;
    currency: string;
  };
  matchScore: MatchScore;
  skills: string[];
  yearsExperience: number;
  availability: string;
  isVerified: boolean;
  trustScore: number;
}

export interface SkillGap {
  skill: string;
  currentLevel: number; // 0-5
  requiredLevel: number; // 0-5
  importance: 'critical' | 'important' | 'nice-to-have';
  learningResources?: {
    title: string;
    url: string;
    type: 'course' | 'article' | 'video';
  }[];
}

export interface SalaryInsight {
  role: string;
  location: string;
  percentile25: number;
  percentile50: number; // median
  percentile75: number;
  averageSalary: number;
  sampleSize: number;
  currency: string;
  lastUpdated: Date;
}

class MatchingService {
  private static instance: MatchingService;

  private constructor() {}

  static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  /**
   * Get job recommendations for a candidate
   */
  async getJobRecommendations(
    candidateId?: string,
    limit: number = 10
  ): Promise<JobRecommendation[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (candidateId) {
        params.append('candidateId', candidateId);
      }

      const response = await fetch(`/api/recommendations/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((rec: any) => ({
        ...rec,
        postedDate: new Date(rec.postedDate),
        applicationDeadline: rec.applicationDeadline ? new Date(rec.applicationDeadline) : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch job recommendations:', error);
      return [];
    }
  }

  /**
   * Get candidate recommendations for a job
   */
  async getCandidateRecommendations(
    jobId: string,
    limit: number = 20
  ): Promise<CandidateRecommendation[]> {
    try {
      const params = new URLSearchParams({
        jobId,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/recommendations/candidates?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch candidate recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate match score between candidate and job
   */
  async calculateMatchScore(
    candidateId: string,
    jobId: string
  ): Promise<MatchScore | null> {
    try {
      const response = await fetch('/api/matching/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidateId, jobId }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to calculate match score:', error);
      return null;
    }
  }

  /**
   * Get skill gap analysis for a candidate and job
   */
  async getSkillGapAnalysis(
    candidateId: string,
    jobId: string
  ): Promise<SkillGap[]> {
    try {
      const response = await fetch(`/api/matching/skill-gap?candidateId=${candidateId}&jobId=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch skill gap analysis:', error);
      return [];
    }
  }

  /**
   * Get salary insights for a role
   */
  async getSalaryInsights(
    role: string,
    location?: string
  ): Promise<SalaryInsight | null> {
    try {
      const params = new URLSearchParams({ role });
      if (location) {
        params.append('location', location);
      }

      const response = await fetch(`/api/insights/salary?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated),
      };
    } catch (error) {
      console.error('Failed to fetch salary insights:', error);
      return null;
    }
  }

  /**
   * Get match score color based on score value
   */
  getMatchScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Get match score badge color
   */
  getMatchScoreBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
  }

  /**
   * Get match score label
   */
  getMatchScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  }

  /**
   * Track recommendation interaction
   */
  async trackRecommendationClick(
    recommendationType: 'job' | 'candidate',
    itemId: string,
    action: 'view' | 'apply' | 'contact' | 'dismiss'
  ): Promise<void> {
    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type: recommendationType,
          itemId,
          action,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track recommendation:', error);
    }
  }

  /**
   * Get personalized job alerts settings
   */
  async getJobAlertPreferences(): Promise<any> {
    try {
      const response = await fetch('/api/recommendations/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch job alert preferences:', error);
      return null;
    }
  }

  /**
   * Update job alert preferences
   */
  async updateJobAlertPreferences(preferences: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'instant';
    minMatchScore: number;
    locations: string[];
    remoteOnly: boolean;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/recommendations/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update job alert preferences:', error);
      return false;
    }
  }
}

export const matchingService = MatchingService.getInstance();
