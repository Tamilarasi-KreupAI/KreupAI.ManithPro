/**
 * Metrics Service
 * Tracks user response rates, activity metrics, and engagement statistics
 */

export interface ResponseMetrics {
  userId: string;
  userType: 'CANDIDATE' | 'RECRUITER';

  // Response rates
  messageResponseRate: number; // 0-100%
  averageResponseTime: number; // in minutes
  interviewAttendanceRate: number; // 0-100%

  // Activity metrics
  totalMessages: number;
  messagesResponded: number;
  totalInterviewsScheduled: number;
  totalInterviewsAttended: number;

  // Engagement
  lastActiveAt: Date;
  accountCreatedAt: Date;
  activeDays: number; // Number of days active in last 30 days

  // Recruiter-specific
  jobPostsCreated?: number;
  candidatesContacted?: number;
  offersExtended?: number;

  // Candidate-specific
  applicationsSubmitted?: number;
  interviewsCompleted?: number;
  offersReceived?: number;
}

export interface ActivityScore {
  score: number; // 0-100
  level: 'inactive' | 'casual' | 'active' | 'very_active' | 'super_active';
  description: string;
}

class MetricsService {
  private static instance: MetricsService;
  private metricsCache: Map<string, ResponseMetrics> = new Map();

  private constructor() {}

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(userId: string): Promise<ResponseMetrics | null> {
    // Check cache
    if (this.metricsCache.has(userId)) {
      return this.metricsCache.get(userId)!;
    }

    try {
      const response = await fetch(`/api/metrics/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const metrics: ResponseMetrics = {
        userId: data.userId,
        userType: data.userType,
        messageResponseRate: data.messageResponseRate || 0,
        averageResponseTime: data.averageResponseTime || 0,
        interviewAttendanceRate: data.interviewAttendanceRate || 0,
        totalMessages: data.totalMessages || 0,
        messagesResponded: data.messagesResponded || 0,
        totalInterviewsScheduled: data.totalInterviewsScheduled || 0,
        totalInterviewsAttended: data.totalInterviewsAttended || 0,
        lastActiveAt: new Date(data.lastActiveAt),
        accountCreatedAt: new Date(data.accountCreatedAt),
        activeDays: data.activeDays || 0,
        jobPostsCreated: data.jobPostsCreated,
        candidatesContacted: data.candidatesContacted,
        offersExtended: data.offersExtended,
        applicationsSubmitted: data.applicationsSubmitted,
        interviewsCompleted: data.interviewsCompleted,
        offersReceived: data.offersReceived,
      };

      // Cache the result
      this.metricsCache.set(userId, metrics);

      return metrics;
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      return null;
    }
  }

  /**
   * Calculate activity score
   */
  calculateActivityScore(metrics: ResponseMetrics): ActivityScore {
    let score = 0;

    // Response rate (30 points)
    score += (metrics.messageResponseRate / 100) * 30;

    // Interview attendance (20 points)
    score += (metrics.interviewAttendanceRate / 100) * 20;

    // Activity days (25 points)
    score += (metrics.activeDays / 30) * 25;

    // Response time bonus (15 points) - faster is better
    if (metrics.averageResponseTime > 0) {
      const responseScore = Math.max(0, 15 - (metrics.averageResponseTime / 60)); // Penalty after 60 min
      score += Math.min(15, responseScore);
    }

    // Engagement (10 points)
    const daysSinceLastActive = Math.floor(
      (Date.now() - metrics.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const engagementScore = Math.max(0, 10 - daysSinceLastActive);
    score += Math.min(10, engagementScore);

    score = Math.min(100, Math.max(0, score));

    let level: ActivityScore['level'];
    let description: string;

    if (score >= 80) {
      level = 'super_active';
      description = 'Highly engaged and responsive user';
    } else if (score >= 60) {
      level = 'very_active';
      description = 'Very active and reliable';
    } else if (score >= 40) {
      level = 'active';
      description = 'Active user with good engagement';
    } else if (score >= 20) {
      level = 'casual';
      description = 'Casual user, moderate activity';
    } else {
      level = 'inactive';
      description = 'Limited recent activity';
    }

    return { score, level, description };
  }

  /**
   * Format response time for display
   */
  formatResponseTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.round(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.round(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get response rate badge config
   */
  getResponseRateBadge(rate: number): {
    color: string;
    label: string;
    icon: string;
  } {
    if (rate >= 90) {
      return {
        color: 'text-green-700 bg-green-100 border-green-300 dark:bg-green-900 dark:text-green-200',
        label: 'Excellent',
        icon: '🌟',
      };
    } else if (rate >= 75) {
      return {
        color: 'text-blue-700 bg-blue-100 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
        label: 'Great',
        icon: '⭐',
      };
    } else if (rate >= 60) {
      return {
        color: 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Good',
        icon: '✓',
      };
    } else if (rate >= 40) {
      return {
        color: 'text-orange-700 bg-orange-100 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
        label: 'Fair',
        icon: '−',
      };
    } else {
      return {
        color: 'text-gray-700 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:text-gray-200',
        label: 'Low',
        icon: '○',
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.metricsCache.clear();
  }

  /**
   * Invalidate cache for specific user
   */
  invalidateUserCache(userId: string): void {
    this.metricsCache.delete(userId);
  }
}

export const metricsService = MetricsService.getInstance();
