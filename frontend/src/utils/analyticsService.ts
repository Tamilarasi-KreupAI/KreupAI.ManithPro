/**
 * Analytics Service
 * Tracks and aggregates platform metrics for reporting
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RecruiterMetrics {
  jobPostings: {
    total: number;
    active: number;
    closed: number;
    draft: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
  };
  interviews: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  hires: {
    total: number;
    accepted: number;
    declined: number;
  };
  timeMetrics: {
    avgTimeToHire: number; // in days
    avgTimeToFirstResponse: number; // in hours
    avgInterviewsPerHire: number;
  };
  engagement: {
    profileViews: number;
    messagesSent: number;
    messagesReceived: number;
    responseRate: number;
  };
}

export interface CandidateMetrics {
  applications: {
    total: number;
    pending: number;
    interviewing: number;
    offered: number;
    rejected: number;
  };
  interviews: {
    scheduled: number;
    completed: number;
    upcoming: number;
  };
  profileMetrics: {
    views: number;
    saves: number;
    contactRequests: number;
  };
  engagement: {
    jobsViewed: number;
    jobsSaved: number;
    messagesReceived: number;
    responseRate: number;
  };
  offers: {
    received: number;
    accepted: number;
    declined: number;
    pending: number;
  };
}

export interface PlatformMetrics {
  users: {
    totalCandidates: number;
    totalRecruiters: number;
    activeUsers: number;
    newUsersThisPeriod: number;
  };
  jobs: {
    totalJobs: number;
    activeJobs: number;
    avgApplicationsPerJob: number;
  };
  applications: {
    total: number;
    avgPerDay: number;
    conversionRate: number; // applications to hires
  };
  engagement: {
    avgSessionDuration: number; // in minutes
    avgPageViews: number;
    bounceRate: number;
  };
}

export interface TrendData {
  date: string;
  value: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get recruiter analytics
   */
  async getRecruiterMetrics(dateRange?: DateRange): Promise<RecruiterMetrics | null> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/recruiter?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch recruiter metrics:', error);
      return null;
    }
  }

  /**
   * Get candidate analytics
   */
  async getCandidateMetrics(dateRange?: DateRange): Promise<CandidateMetrics | null> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/candidate?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch candidate metrics:', error);
      return null;
    }
  }

  /**
   * Get platform-wide analytics (admin only)
   */
  async getPlatformMetrics(dateRange?: DateRange): Promise<PlatformMetrics | null> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/platform?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
      return null;
    }
  }

  /**
   * Get trend data for charts
   */
  async getTrendData(
    metric: string,
    dateRange: DateRange,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<TrendData[]> {
    try {
      const params = new URLSearchParams({
        metric,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        interval,
      });

      const response = await fetch(`/api/analytics/trends?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      return [];
    }
  }

  /**
   * Export analytics data as CSV
   */
  async exportToCSV(userType: 'recruiter' | 'candidate', dateRange?: DateRange): Promise<void> {
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/${userType}/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${userType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }

  /**
   * Export analytics data as PDF
   */
  async exportToPDF(userType: 'recruiter' | 'candidate', dateRange?: DateRange): Promise<void> {
    try {
      const params = new URLSearchParams({ format: 'pdf' });
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/${userType}/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${userType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw error;
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          eventName,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Get common date ranges
   */
  getDateRangePresets(): Record<string, DateRange> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      today: {
        startDate: today,
        endDate: now,
      },
      yesterday: {
        startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        endDate: today,
      },
      last7days: {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: now,
      },
      last30days: {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: now,
      },
      last90days: {
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: now,
      },
      thisMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
      },
      lastMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0),
      },
      thisYear: {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
      },
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
