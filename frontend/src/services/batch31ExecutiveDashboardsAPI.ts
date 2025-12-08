// Batch 31: Executive Dashboards API Services (9.2.1-9.2.8)
import api from './api';

const BASE_URL = '/api/executive';

// ==========================================
// 9.2.1 Executive Summary Dashboard API
// ==========================================

export const dashboardAPI = {
  // Get all dashboards
  getDashboards: async (params?: {
    type?: string;
    isDefault?: boolean;
  }) => {
    const response = await api.get(`${BASE_URL}/dashboards`, { params });
    return response.data;
  },

  // Get executive summary
  getExecutiveSummary: async (params?: {
    dateRange?: string;
    departmentId?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },

  // Get specific dashboard
  getDashboard: async (dashboardId: string) => {
    const response = await api.get(`${BASE_URL}/dashboards/${dashboardId}`);
    return response.data;
  },

  // Create dashboard
  createDashboard: async (data: {
    name: string;
    type: string;
    description?: string;
    layout?: any;
    widgets?: any[];
    isDefault?: boolean;
    settings?: any;
  }) => {
    const response = await api.post(`${BASE_URL}/dashboards`, data);
    return response.data;
  },

  // Update dashboard
  updateDashboard: async (dashboardId: string, data: Partial<{
    name: string;
    type: string;
    description: string;
    layout: any;
    widgets: any[];
    isDefault: boolean;
    settings: any;
  }>) => {
    const response = await api.put(`${BASE_URL}/dashboards/${dashboardId}`, data);
    return response.data;
  },

  // Delete dashboard
  deleteDashboard: async (dashboardId: string) => {
    const response = await api.delete(`${BASE_URL}/dashboards/${dashboardId}`);
    return response.data;
  },
};

// ==========================================
// 9.2.2 Trend Analysis API
// ==========================================

export const trendAPI = {
  // Get trend analyses
  getTrendAnalyses: async (params?: {
    metricType?: string;
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/trends`, { params });
    return response.data;
  },

  // Create trend analysis
  createTrendAnalysis: async (data: {
    metricType: string;
    period: string;
    dateFrom: string;
    dateTo: string;
    granularity?: string;
    filters?: any;
  }) => {
    const response = await api.post(`${BASE_URL}/trends`, data);
    return response.data;
  },

  // Get forecast
  getForecast: async (params?: {
    metricType?: string;
    forecastPeriod?: number;
    forecastUnit?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/forecast`, { params });
    return response.data;
  },
};

// ==========================================
// 9.2.3 Benchmark Comparisons API
// ==========================================

export const benchmarkAPI = {
  // Get industry benchmarks
  getIndustryBenchmarks: async (params?: {
    industry?: string;
    companySize?: string;
    region?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/benchmarks/industry`, { params });
    return response.data;
  },

  // Get benchmark comparisons
  getBenchmarkComparisons: async (params?: {
    benchmarkId?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/benchmarks/comparisons`, { params });
    return response.data;
  },

  // Run benchmark comparison
  runBenchmarkComparison: async (data: {
    benchmarkId: string;
    metrics: string[];
    includeHistorical?: boolean;
  }) => {
    const response = await api.post(`${BASE_URL}/benchmarks/compare`, data);
    return response.data;
  },
};

// ==========================================
// 9.2.4 Custom Dashboard Builder API
// ==========================================

export const widgetAPI = {
  // Get widgets
  getWidgets: async (params?: {
    dashboardId?: string;
    type?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/widgets`, { params });
    return response.data;
  },

  // Get widget templates
  getWidgetTemplates: async (params?: {
    category?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/widgets/templates`, { params });
    return response.data;
  },

  // Create widget
  createWidget: async (data: {
    dashboardId: string;
    name: string;
    type: string;
    config?: any;
    position?: any;
    size?: any;
  }) => {
    const response = await api.post(`${BASE_URL}/widgets`, data);
    return response.data;
  },

  // Update widget
  updateWidget: async (widgetId: string, data: Partial<{
    name: string;
    type: string;
    config: any;
    position: any;
    size: any;
  }>) => {
    const response = await api.put(`${BASE_URL}/widgets/${widgetId}`, data);
    return response.data;
  },

  // Delete widget
  deleteWidget: async (widgetId: string) => {
    const response = await api.delete(`${BASE_URL}/widgets/${widgetId}`);
    return response.data;
  },
};

// ==========================================
// 9.2.5 Scheduled Reports API
// ==========================================

export const reportAPI = {
  // Get scheduled reports
  getScheduledReports: async (params?: {
    isActive?: boolean;
    frequency?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/reports`, { params });
    return response.data;
  },

  // Get specific scheduled report
  getScheduledReport: async (reportId: string) => {
    const response = await api.get(`${BASE_URL}/reports/${reportId}`);
    return response.data;
  },

  // Create scheduled report
  createScheduledReport: async (data: {
    name: string;
    description?: string;
    reportType: string;
    dashboardId?: string;
    frequency: string;
    schedule: any;
    recipients: any[];
    format: string;
    filters?: any;
  }) => {
    const response = await api.post(`${BASE_URL}/reports`, data);
    return response.data;
  },

  // Update scheduled report
  updateScheduledReport: async (reportId: string, data: Partial<{
    name: string;
    description: string;
    reportType: string;
    dashboardId: string;
    frequency: string;
    schedule: any;
    recipients: any[];
    format: string;
    filters: any;
    isActive: boolean;
  }>) => {
    const response = await api.put(`${BASE_URL}/reports/${reportId}`, data);
    return response.data;
  },

  // Delete scheduled report
  deleteScheduledReport: async (reportId: string) => {
    const response = await api.delete(`${BASE_URL}/reports/${reportId}`);
    return response.data;
  },

  // Run report now
  runReportNow: async (reportId: string) => {
    const response = await api.post(`${BASE_URL}/reports/${reportId}/run`);
    return response.data;
  },

  // Get report executions
  getReportExecutions: async (reportId: string, params?: {
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/reports/${reportId}/executions`, { params });
    return response.data;
  },
};

// ==========================================
// 9.2.6 BI Tool Export API
// ==========================================

export const biExportAPI = {
  // Get BI configurations
  getBIConfigs: async (params?: {
    toolType?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get(`${BASE_URL}/bi-exports`, { params });
    return response.data;
  },

  // Get specific BI configuration
  getBIConfig: async (configId: string) => {
    const response = await api.get(`${BASE_URL}/bi-exports/${configId}`);
    return response.data;
  },

  // Create BI configuration
  createBIConfig: async (data: {
    name: string;
    toolType: string;
    connectionSettings: any;
    dataMapping?: any;
    syncFrequency?: string;
    syncSchedule?: any;
  }) => {
    const response = await api.post(`${BASE_URL}/bi-exports`, data);
    return response.data;
  },

  // Update BI configuration
  updateBIConfig: async (configId: string, data: Partial<{
    name: string;
    toolType: string;
    connectionSettings: any;
    dataMapping: any;
    syncFrequency: string;
    syncSchedule: any;
    isActive: boolean;
  }>) => {
    const response = await api.put(`${BASE_URL}/bi-exports/${configId}`, data);
    return response.data;
  },

  // Delete BI configuration
  deleteBIConfig: async (configId: string) => {
    const response = await api.delete(`${BASE_URL}/bi-exports/${configId}`);
    return response.data;
  },

  // Test BI connection
  testBIConnection: async (configId: string) => {
    const response = await api.post(`${BASE_URL}/bi-exports/${configId}/test`);
    return response.data;
  },

  // Trigger BI export
  triggerBIExport: async (configId: string, data?: {
    fullSync?: boolean;
  }) => {
    const response = await api.post(`${BASE_URL}/bi-exports/${configId}/export`, data);
    return response.data;
  },

  // Get BI export logs
  getBIExportLogs: async (configId: string, params?: {
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/bi-exports/${configId}/logs`, { params });
    return response.data;
  },
};

// ==========================================
// 9.2.7 Goal Tracking API
// ==========================================

export const goalAPI = {
  // Get hiring goals
  getHiringGoals: async (params?: {
    status?: string;
    type?: string;
    departmentId?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/goals`, { params });
    return response.data;
  },

  // Get specific hiring goal
  getHiringGoal: async (goalId: string) => {
    const response = await api.get(`${BASE_URL}/goals/${goalId}`);
    return response.data;
  },

  // Create hiring goal
  createHiringGoal: async (data: {
    name: string;
    type: string;
    targetValue: number;
    currentValue?: number;
    startDate: string;
    endDate: string;
    departmentId?: string;
    teamId?: string;
    milestones?: any[];
    description?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/goals`, data);
    return response.data;
  },

  // Update hiring goal
  updateHiringGoal: async (goalId: string, data: Partial<{
    name: string;
    type: string;
    targetValue: number;
    currentValue: number;
    startDate: string;
    endDate: string;
    departmentId: string;
    teamId: string;
    milestones: any[];
    description: string;
    status: string;
  }>) => {
    const response = await api.put(`${BASE_URL}/goals/${goalId}`, data);
    return response.data;
  },

  // Delete hiring goal
  deleteHiringGoal: async (goalId: string) => {
    const response = await api.delete(`${BASE_URL}/goals/${goalId}`);
    return response.data;
  },

  // Get goal progress
  getGoalProgress: async (goalId: string) => {
    const response = await api.get(`${BASE_URL}/goals/${goalId}/progress`);
    return response.data;
  },

  // Record goal progress
  recordGoalProgress: async (goalId: string, data: {
    value: number;
    notes?: string;
    milestoneId?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/goals/${goalId}/progress`, data);
    return response.data;
  },
};

// ==========================================
// 9.2.8 Department/Team Views API
// ==========================================

export const departmentAPI = {
  // Get department views
  getDepartmentViews: async (params?: {
    includeMetrics?: boolean;
  }) => {
    const response = await api.get(`${BASE_URL}/departments`, { params });
    return response.data;
  },

  // Get specific department view
  getDepartmentView: async (departmentId: string, params?: {
    dateRange?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/departments/${departmentId}`, { params });
    return response.data;
  },

  // Compare departments
  compareDepartments: async (data: {
    departmentIds: string[];
    metrics: string[];
    dateRange?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/departments/compare`, data);
    return response.data;
  },
};

export const teamAPI = {
  // Get team metrics
  getTeamMetrics: async (params?: {
    departmentId?: string;
    dateRange?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/teams`, { params });
    return response.data;
  },

  // Get specific team metric
  getTeamMetric: async (teamId: string, params?: {
    dateRange?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/teams/${teamId}`, { params });
    return response.data;
  },
};

// Export all APIs
export default {
  dashboard: dashboardAPI,
  trend: trendAPI,
  benchmark: benchmarkAPI,
  widget: widgetAPI,
  report: reportAPI,
  biExport: biExportAPI,
  goal: goalAPI,
  department: departmentAPI,
  team: teamAPI,
};
