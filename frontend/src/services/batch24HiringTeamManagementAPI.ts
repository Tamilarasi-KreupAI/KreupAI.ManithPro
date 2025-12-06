import axios from 'axios';
import type {
  HiringTeam,
  CreateHiringTeamInput,
  UpdateHiringTeamInput,
  HiringTeamMember,
  AddTeamMemberInput,
  UpdateMemberPermissionsInput,
  InterviewPanel,
  CreateInterviewPanelInput,
  UpdateInterviewPanelInput,
  TeamWorkload,
  WorkloadSummary,
  CoverageSchedule,
  CreateCoverageScheduleInput,
  UpdateCoverageScheduleInput,
  TeamPerformance,
  PerformanceComparison,
  HiringManagerDashboard,
  UpdateDashboardConfigInput,
  DashboardWidget,
  DashboardData,
  TeamActivityLog,
  HiringTeamStats,
  TeamStatus,
  PeriodType,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTeams: HiringTeam[] = [
  {
    id: 'team-1',
    companyId: 'company-1',
    jobId: 'job-1',
    name: 'Senior Engineer Hiring Team',
    description: 'Team for hiring senior software engineers',
    teamType: 'STANDARD',
    leadRecruiterId: 'rec-1',
    hiringManagerId: 'hm-1',
    status: 'ACTIVE',
    activatedAt: new Date().toISOString(),
    totalCandidates: 45,
    totalInterviews: 28,
    totalHires: 3,
    avgTimeToHire: 32,
    createdById: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'team-2',
    companyId: 'company-1',
    jobId: 'job-2',
    name: 'Product Manager Hiring',
    description: 'Team for PM roles',
    teamType: 'EXECUTIVE',
    leadRecruiterId: 'rec-2',
    hiringManagerId: 'hm-2',
    status: 'ACTIVE',
    activatedAt: new Date().toISOString(),
    totalCandidates: 30,
    totalInterviews: 15,
    totalHires: 1,
    avgTimeToHire: 45,
    createdById: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockMembers: HiringTeamMember[] = [
  {
    id: 'member-1',
    teamId: 'team-1',
    userId: 'rec-1',
    companyId: 'company-1',
    role: 'LEAD_RECRUITER',
    title: 'Senior Technical Recruiter',
    permissionLevel: 'ADMIN',
    canViewCandidates: true,
    canEditCandidates: true,
    canScheduleInterviews: true,
    canSubmitFeedback: true,
    canMakeDecisions: true,
    canManageTeam: true,
    canAccessReports: true,
    isActive: true,
    maxInterviewsPerWeek: 15,
    currentInterviewLoad: 8,
    expertiseAreas: ['Backend', 'System Design'],
    interviewTypes: ['TECHNICAL', 'BEHAVIORAL'],
    notifyOnNewCandidates: true,
    notifyOnInterviews: true,
    notifyOnDecisions: true,
    addedById: 'admin-1',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-2',
    teamId: 'team-1',
    userId: 'hm-1',
    companyId: 'company-1',
    role: 'HIRING_MANAGER',
    title: 'Engineering Manager',
    permissionLevel: 'EDITOR',
    canViewCandidates: true,
    canEditCandidates: true,
    canScheduleInterviews: true,
    canSubmitFeedback: true,
    canMakeDecisions: true,
    canManageTeam: false,
    canAccessReports: true,
    isActive: true,
    maxInterviewsPerWeek: 8,
    currentInterviewLoad: 4,
    expertiseAreas: ['Team Leadership', 'Architecture'],
    interviewTypes: ['FINAL', 'CULTURE'],
    notifyOnNewCandidates: true,
    notifyOnInterviews: true,
    notifyOnDecisions: true,
    addedById: 'admin-1',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-3',
    teamId: 'team-1',
    userId: 'int-1',
    companyId: 'company-1',
    role: 'INTERVIEWER',
    title: 'Staff Engineer',
    permissionLevel: 'COMMENTER',
    canViewCandidates: true,
    canEditCandidates: false,
    canScheduleInterviews: false,
    canSubmitFeedback: true,
    canMakeDecisions: false,
    canManageTeam: false,
    canAccessReports: false,
    isActive: true,
    maxInterviewsPerWeek: 6,
    currentInterviewLoad: 3,
    expertiseAreas: ['React', 'Node.js', 'System Design'],
    interviewTypes: ['TECHNICAL'],
    notifyOnNewCandidates: false,
    notifyOnInterviews: true,
    notifyOnDecisions: false,
    addedById: 'rec-1',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPanels: InterviewPanel[] = [
  {
    id: 'panel-1',
    companyId: 'company-1',
    teamId: 'team-1',
    jobId: 'job-1',
    name: 'Phone Screen',
    roundNumber: 1,
    roundType: 'PHONE_SCREEN',
    panelMembers: [{ userId: 'rec-1', role: 'LEAD_RECRUITER', isRequired: true }],
    minPanelSize: 1,
    maxPanelSize: 1,
    duration: 30,
    format: 'PHONE',
    schedulingMode: 'SELF_SCHEDULE',
    bufferTime: 10,
    allowWeekends: false,
    requireUnanimous: false,
    isActive: true,
    order: 1,
    createdById: 'rec-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'panel-2',
    companyId: 'company-1',
    teamId: 'team-1',
    jobId: 'job-1',
    name: 'Technical Interview',
    roundNumber: 2,
    roundType: 'TECHNICAL',
    panelMembers: [
      { userId: 'int-1', role: 'INTERVIEWER', isRequired: true },
      { userId: 'int-2', role: 'INTERVIEWER', isRequired: false },
    ],
    minPanelSize: 1,
    maxPanelSize: 2,
    duration: 60,
    format: 'VIDEO',
    videoLink: 'https://meet.google.com/xyz',
    schedulingMode: 'MANUAL',
    bufferTime: 15,
    allowWeekends: false,
    requireUnanimous: false,
    passingScore: 3.5,
    isActive: true,
    order: 2,
    createdById: 'rec-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'panel-3',
    companyId: 'company-1',
    teamId: 'team-1',
    jobId: 'job-1',
    name: 'Final Round',
    roundNumber: 3,
    roundType: 'FINAL',
    panelMembers: [
      { userId: 'hm-1', role: 'HIRING_MANAGER', isRequired: true },
      { userId: 'dir-1', role: 'INTERVIEWER', isRequired: true },
    ],
    minPanelSize: 2,
    maxPanelSize: 3,
    duration: 45,
    format: 'VIDEO',
    schedulingMode: 'MANUAL',
    bufferTime: 15,
    allowWeekends: false,
    requireUnanimous: true,
    isActive: true,
    order: 3,
    createdById: 'rec-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockWorkloadSummary: WorkloadSummary = {
  totalMembers: 5,
  totalCapacity: 45,
  currentLoad: 22,
  availableCapacity: 23,
  overloadedMembers: 0,
  byRole: {
    LEAD_RECRUITER: { count: 1, load: 8, capacity: 15 },
    HIRING_MANAGER: { count: 1, load: 4, capacity: 8 },
    INTERVIEWER: { count: 3, load: 10, capacity: 18 },
  },
};

const mockCoverages: CoverageSchedule[] = [
  {
    id: 'cov-1',
    companyId: 'company-1',
    teamId: 'team-1',
    primaryUserId: 'int-1',
    coveringUserId: 'int-2',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    reason: 'VACATION',
    notes: 'Annual leave',
    coverageType: 'FULL',
    approvalStatus: 'APPROVED',
    approvedById: 'rec-1',
    approvedAt: new Date().toISOString(),
    notifyStakeholders: true,
    stakeholdersNotified: true,
    status: 'SCHEDULED',
    createdById: 'int-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPerformance: TeamPerformance = {
  id: 'perf-1',
  companyId: 'company-1',
  teamId: 'team-1',
  periodType: 'MONTHLY',
  periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  periodEnd: new Date().toISOString(),
  candidatesSourced: 45,
  candidatesScreened: 35,
  interviewsScheduled: 28,
  interviewsCompleted: 25,
  offersExtended: 5,
  offersAccepted: 3,
  hiresMade: 3,
  avgTimeToScreen: 2.5,
  avgTimeToInterview: 7,
  avgTimeToOffer: 21,
  avgTimeToHire: 32,
  avgInterviewsPerHire: 8.3,
  candidateQualityScore: 4.2,
  interviewQualityScore: 4.5,
  offerAcceptanceRate: 60,
  teamUtilization: 75,
  avgFeedbackTurnaround: 12,
  feedbackCompletionRate: 95,
  calculatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDashboard: HiringManagerDashboard = {
  id: 'dash-1',
  companyId: 'company-1',
  userId: 'hm-1',
  dashboardName: 'My Hiring Dashboard',
  widgets: [
    { type: 'PIPELINE_OVERVIEW', position: { x: 0, y: 0, w: 6, h: 4 } },
    { type: 'RECENT_CANDIDATES', position: { x: 6, y: 0, w: 6, h: 4 } },
    { type: 'INTERVIEWS_THIS_WEEK', position: { x: 0, y: 4, w: 4, h: 3 } },
    { type: 'PENDING_ACTIONS', position: { x: 4, y: 4, w: 4, h: 3 } },
    { type: 'TEAM_ACTIVITY', position: { x: 8, y: 4, w: 4, h: 3 } },
  ],
  defaultTimeRange: 'LAST_30_DAYS',
  autoRefresh: true,
  refreshInterval: 300,
  emailDigest: true,
  digestFrequency: 'DAILY',
  showCompletedJobs: false,
  showTeamMetrics: true,
  compactMode: false,
  colorScheme: 'DEFAULT',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDashboardData: DashboardData = {
  summary: {
    activeTeams: 2,
    totalCandidates: 75,
    totalInterviews: 43,
    totalHires: 4,
  },
  teams: [
    { id: 'team-1', name: 'Senior Engineer Hiring Team', candidates: 45, interviews: 28, hires: 3, status: 'ACTIVE' },
    { id: 'team-2', name: 'Product Manager Hiring', candidates: 30, interviews: 15, hires: 1, status: 'ACTIVE' },
  ],
  recentActivity: [
    { id: 'act-1', type: 'CANDIDATE_MOVED', description: 'John Doe moved to Final Round', performedAt: new Date().toISOString() },
    { id: 'act-2', type: 'INTERVIEW_SCHEDULED', description: 'Interview scheduled with Jane Smith', performedAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  upcomingInterviews: [
    { id: 'int-1', candidateName: 'Alice Johnson', jobTitle: 'Senior Engineer', scheduledAt: new Date(Date.now() + 86400000).toISOString() },
    { id: 'int-2', candidateName: 'Bob Williams', jobTitle: 'Senior Engineer', scheduledAt: new Date(Date.now() + 172800000).toISOString() },
  ],
  pendingActions: {
    feedbackPending: 3,
    decisionsNeeded: 2,
    interviewsToSchedule: 5,
  },
};

const mockStats: HiringTeamStats = {
  teamsByStatus: { ACTIVE: 2, PAUSED: 0, COMPLETED: 1, ARCHIVED: 0 },
  membersByRole: { LEAD_RECRUITER: 2, RECRUITER: 3, HIRING_MANAGER: 2, INTERVIEWER: 8, COORDINATOR: 1, VIEWER: 2 },
  activePanels: 6,
  activeCoverages: 1,
};

// ============================================================================
// 6.1.1 HIRING TEAMS API
// ============================================================================

export const hiringTeamsAPI = {
  create: async (input: CreateHiringTeamInput): Promise<HiringTeam> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockTeams[0], ...input, id: `team-${Date.now()}` };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/teams`, input, { headers: getAuthHeader() });
    return response.data;
  },

  getAll: async (filters?: { companyId?: string; jobId?: string; status?: TeamStatus }): Promise<HiringTeam[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTeams;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams`, { headers: getAuthHeader(), params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<HiringTeam> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const team = mockTeams.find(t => t.id === id) || mockTeams[0];
      return { ...team, members: mockMembers.filter(m => m.teamId === id || m.teamId === 'team-1') };
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  update: async (id: string, input: UpdateHiringTeamInput): Promise<HiringTeam> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockTeams[0], ...input };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/teams/${id}`, input, { headers: getAuthHeader() });
    return response.data;
  },

  updateStatus: async (id: string, status: TeamStatus): Promise<HiringTeam> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockTeams[0], status };
    }
    const response = await axios.patch(`${API_URL}/hiring-teams/teams/${id}/status`, { status }, { headers: getAuthHeader() });
    return response.data;
  },
};

// ============================================================================
// 6.1.2 TEAM MEMBERS API
// ============================================================================

export const teamMembersAPI = {
  add: async (teamId: string, input: AddTeamMemberInput): Promise<HiringTeamMember> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockMembers[0], ...input, teamId, id: `member-${Date.now()}` };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/teams/${teamId}/members`, input, { headers: getAuthHeader() });
    return response.data;
  },

  getByTeam: async (teamId: string): Promise<HiringTeamMember[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMembers;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams/${teamId}/members`, { headers: getAuthHeader() });
    return response.data;
  },

  updatePermissions: async (memberId: string, input: UpdateMemberPermissionsInput): Promise<HiringTeamMember> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockMembers[0], ...input };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/members/${memberId}/permissions`, input, { headers: getAuthHeader() });
    return response.data;
  },

  remove: async (memberId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    await axios.delete(`${API_URL}/hiring-teams/members/${memberId}`, { headers: getAuthHeader() });
  },
};

// ============================================================================
// 6.1.3 INTERVIEW PANELS API
// ============================================================================

export const interviewPanelsAPI = {
  create: async (input: CreateInterviewPanelInput): Promise<InterviewPanel> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockPanels[0], ...input, id: `panel-${Date.now()}` };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/panels`, input, { headers: getAuthHeader() });
    return response.data;
  },

  getAll: async (filters?: { teamId?: string; jobId?: string }): Promise<InterviewPanel[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPanels;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/panels`, { headers: getAuthHeader(), params: filters });
    return response.data;
  },

  update: async (id: string, input: UpdateInterviewPanelInput): Promise<InterviewPanel> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockPanels[0], ...input };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/panels/${id}`, input, { headers: getAuthHeader() });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    await axios.delete(`${API_URL}/hiring-teams/panels/${id}`, { headers: getAuthHeader() });
  },

  reorder: async (panels: { id: string; order: number }[]): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    await axios.post(`${API_URL}/hiring-teams/panels/reorder`, { panels }, { headers: getAuthHeader() });
  },
};

// ============================================================================
// 6.1.4 WORKLOAD API
// ============================================================================

export const workloadAPI = {
  getTeamWorkload: async (teamId: string): Promise<TeamWorkload[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    }
    const response = await axios.get(`${API_URL}/hiring-teams/workload`, { headers: getAuthHeader(), params: { teamId } });
    return response.data;
  },

  getWorkloadSummary: async (teamId: string): Promise<WorkloadSummary> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockWorkloadSummary;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams/${teamId}/workload/summary`, { headers: getAuthHeader() });
    return response.data;
  },

  calculate: async (teamId: string, periodStart: string, periodEnd: string): Promise<TeamWorkload[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    }
    const response = await axios.post(
      `${API_URL}/hiring-teams/teams/${teamId}/workload/calculate`,
      { periodStart, periodEnd },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

// ============================================================================
// 6.1.5 COVERAGE API
// ============================================================================

export const coverageAPI = {
  create: async (input: CreateCoverageScheduleInput): Promise<CoverageSchedule> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockCoverages[0], ...input, id: `cov-${Date.now()}` };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/coverage`, input, { headers: getAuthHeader() });
    return response.data;
  },

  getAll: async (filters?: { teamId?: string; status?: string }): Promise<CoverageSchedule[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCoverages;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/coverage`, { headers: getAuthHeader(), params: filters });
    return response.data;
  },

  update: async (id: string, input: UpdateCoverageScheduleInput): Promise<CoverageSchedule> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockCoverages[0], ...input };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/coverage/${id}`, input, { headers: getAuthHeader() });
    return response.data;
  },

  approve: async (id: string, approved: boolean): Promise<CoverageSchedule> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockCoverages[0], approvalStatus: approved ? 'APPROVED' : 'REJECTED' };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/coverage/${id}/approve`, { approved }, { headers: getAuthHeader() });
    return response.data;
  },

  completeHandoff: async (id: string, handoffNotes: string): Promise<CoverageSchedule> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockCoverages[0], handoffNotes, handoffCompletedAt: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/hiring-teams/coverage/${id}/handoff`, { handoffNotes }, { headers: getAuthHeader() });
    return response.data;
  },
};

// ============================================================================
// 6.1.6 PERFORMANCE API
// ============================================================================

export const performanceAPI = {
  get: async (teamId: string, periodType?: PeriodType): Promise<TeamPerformance[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [mockPerformance];
    }
    const response = await axios.get(`${API_URL}/hiring-teams/performance`, { headers: getAuthHeader(), params: { teamId, periodType } });
    return response.data;
  },

  calculate: async (teamId: string, periodType: PeriodType, periodStart: string, periodEnd: string): Promise<TeamPerformance> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPerformance;
    }
    const response = await axios.post(
      `${API_URL}/hiring-teams/teams/${teamId}/performance/calculate`,
      { periodType, periodStart, periodEnd },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  compare: async (teamId: string, periodType: PeriodType, periods?: number): Promise<PerformanceComparison> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        performance: [mockPerformance],
        trends: {
          hires: { direction: 'up', percentage: 15 },
          interviews: { direction: 'up', percentage: 8 },
          timeToHire: { direction: 'down', percentage: 10 },
        },
      };
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams/${teamId}/performance/compare`, {
      headers: getAuthHeader(),
      params: { periodType, comparisonPeriods: periods },
    });
    return response.data;
  },
};

// ============================================================================
// 6.1.7 DASHBOARD API
// ============================================================================

export const dashboardAPI = {
  get: async (userId: string, companyId: string): Promise<HiringManagerDashboard> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDashboard;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/dashboard/${userId}`, { headers: getAuthHeader(), params: { companyId } });
    return response.data;
  },

  updateConfig: async (id: string, input: UpdateDashboardConfigInput): Promise<HiringManagerDashboard> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockDashboard, ...input };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/dashboard/${id}/config`, input, { headers: getAuthHeader() });
    return response.data;
  },

  updateWidgets: async (id: string, widgets: DashboardWidget[]): Promise<HiringManagerDashboard> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockDashboard, widgets };
    }
    const response = await axios.put(`${API_URL}/hiring-teams/dashboard/${id}/widgets`, { widgets }, { headers: getAuthHeader() });
    return response.data;
  },

  saveFilter: async (id: string, filterName: string, filterConfig: Record<string, unknown>): Promise<HiringManagerDashboard> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDashboard;
    }
    const response = await axios.post(`${API_URL}/hiring-teams/dashboard/${id}/filters`, { filterName, filterConfig }, { headers: getAuthHeader() });
    return response.data;
  },

  getData: async (userId: string, companyId: string): Promise<DashboardData> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDashboardData;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/dashboard/${userId}/data`, { headers: getAuthHeader(), params: { companyId } });
    return response.data;
  },
};

// ============================================================================
// ACTIVITY & STATS API
// ============================================================================

export const activityAPI = {
  getTeamActivity: async (teamId: string, limit?: number): Promise<TeamActivityLog[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    }
    const response = await axios.get(`${API_URL}/hiring-teams/teams/${teamId}/activity`, { headers: getAuthHeader(), params: { limit } });
    return response.data;
  },
};

export const statsAPI = {
  get: async (companyId: string): Promise<HiringTeamStats> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockStats;
    }
    const response = await axios.get(`${API_URL}/hiring-teams/stats`, { headers: getAuthHeader(), params: { companyId } });
    return response.data;
  },
};

export default {
  teams: hiringTeamsAPI,
  members: teamMembersAPI,
  panels: interviewPanelsAPI,
  workload: workloadAPI,
  coverage: coverageAPI,
  performance: performanceAPI,
  dashboard: dashboardAPI,
  activity: activityAPI,
  stats: statsAPI,
};
