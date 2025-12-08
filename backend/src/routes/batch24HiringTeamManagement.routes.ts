import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Hiring Teams (6.1.1)
  createHiringTeam,
  getHiringTeams,
  getHiringTeamById,
  updateHiringTeam,
  updateTeamStatus,

  // Team Members & Permissions (6.1.2)
  addTeamMember,
  getTeamMembers,
  updateMemberPermissions,
  removeTeamMember,

  // Interview Panels (6.1.3)
  createInterviewPanel,
  getInterviewPanels,
  updateInterviewPanel,
  deleteInterviewPanel,
  reorderInterviewPanels,

  // Workload Dashboard (6.1.4)
  getTeamWorkload,
  updateMemberWorkload,
  calculateTeamWorkloads,
  getWorkloadSummary,

  // Coverage Scheduling (6.1.5)
  createCoverageSchedule,
  getCoverageSchedules,
  updateCoverageSchedule,
  approveCoverageSchedule,
  completeCoverageHandoff,

  // Team Performance (6.1.6)
  getTeamPerformance,
  calculateTeamPerformance,
  compareTeamPerformance,

  // Hiring Manager Dashboards (6.1.7)
  getHiringManagerDashboard,
  updateDashboardConfig,
  updateDashboardWidgets,
  saveDashboardFilter,
  getDashboardData,

  // Activity & Stats
  getTeamActivityLog,
  getHiringTeamStats,
} from '../controllers/batch24HiringTeamManagement.controller';

const router = Router();

// ============================================================================
// 6.1.1 HIRING TEAM ROUTES
// ============================================================================

// Create hiring team
router.post(
  '/teams',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createHiringTeam
);

// Get hiring teams
router.get(
  '/teams',
  authenticate,
  getHiringTeams
);

// Get hiring team by ID
router.get(
  '/teams/:id',
  authenticate,
  getHiringTeamById
);

// Update hiring team
router.put(
  '/teams/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateHiringTeam
);

// Update team status
router.patch(
  '/teams/:id/status',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateTeamStatus
);

// ============================================================================
// 6.1.2 TEAM MEMBER & PERMISSION ROUTES
// ============================================================================

// Add team member
router.post(
  '/teams/:teamId/members',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  addTeamMember
);

// Get team members
router.get(
  '/teams/:teamId/members',
  authenticate,
  getTeamMembers
);

// Update member permissions
router.put(
  '/members/:memberId/permissions',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateMemberPermissions
);

// Remove team member
router.delete(
  '/members/:memberId',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  removeTeamMember
);

// ============================================================================
// 6.1.3 INTERVIEW PANEL ROUTES
// ============================================================================

// Create interview panel
router.post(
  '/panels',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createInterviewPanel
);

// Get interview panels
router.get(
  '/panels',
  authenticate,
  getInterviewPanels
);

// Update interview panel
router.put(
  '/panels/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateInterviewPanel
);

// Delete interview panel
router.delete(
  '/panels/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  deleteInterviewPanel
);

// Reorder interview panels
router.post(
  '/panels/reorder',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  reorderInterviewPanels
);

// ============================================================================
// 6.1.4 WORKLOAD DASHBOARD ROUTES
// ============================================================================

// Get team workload
router.get(
  '/workload',
  authenticate,
  getTeamWorkload
);

// Update member workload
router.put(
  '/workload/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateMemberWorkload
);

// Calculate team workloads
router.post(
  '/teams/:teamId/workload/calculate',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  calculateTeamWorkloads
);

// Get workload summary
router.get(
  '/teams/:teamId/workload/summary',
  authenticate,
  getWorkloadSummary
);

// ============================================================================
// 6.1.5 COVERAGE SCHEDULING ROUTES
// ============================================================================

// Create coverage schedule
router.post(
  '/coverage',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createCoverageSchedule
);

// Get coverage schedules
router.get(
  '/coverage',
  authenticate,
  getCoverageSchedules
);

// Update coverage schedule
router.put(
  '/coverage/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateCoverageSchedule
);

// Approve coverage schedule
router.post(
  '/coverage/:id/approve',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  approveCoverageSchedule
);

// Complete handoff
router.post(
  '/coverage/:id/handoff',
  authenticate,
  completeCoverageHandoff
);

// ============================================================================
// 6.1.6 TEAM PERFORMANCE ROUTES
// ============================================================================

// Get team performance
router.get(
  '/performance',
  authenticate,
  getTeamPerformance
);

// Calculate team performance
router.post(
  '/teams/:teamId/performance/calculate',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  calculateTeamPerformance
);

// Compare team performance
router.get(
  '/teams/:teamId/performance/compare',
  authenticate,
  compareTeamPerformance
);

// ============================================================================
// 6.1.7 HIRING MANAGER DASHBOARD ROUTES
// ============================================================================

// Get hiring manager dashboard
router.get(
  '/dashboard/:userId',
  authenticate,
  getHiringManagerDashboard
);

// Update dashboard config
router.put(
  '/dashboard/:id/config',
  authenticate,
  updateDashboardConfig
);

// Update dashboard widgets
router.put(
  '/dashboard/:id/widgets',
  authenticate,
  updateDashboardWidgets
);

// Save dashboard filter
router.post(
  '/dashboard/:id/filters',
  authenticate,
  saveDashboardFilter
);

// Get dashboard data
router.get(
  '/dashboard/:userId/data',
  authenticate,
  getDashboardData
);

// ============================================================================
// ACTIVITY & STATS ROUTES
// ============================================================================

// Get team activity log
router.get(
  '/teams/:teamId/activity',
  authenticate,
  getTeamActivityLog
);

// Get hiring team stats
router.get(
  '/stats',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  getHiringTeamStats
);

export default router;
