// Batch 31: Executive Dashboards Routes (9.2.1-9.2.8)
import { Router } from 'express';
import * as executiveController from '../controllers/batch31ExecutiveDashboards.controller';

const router = Router();

// ==========================================
// 9.2.1 Executive Summary Dashboard Routes
// ==========================================

// Get all dashboards
router.get('/dashboards', executiveController.getDashboards);

// Get executive summary
router.get('/summary', executiveController.getExecutiveSummary);

// Get specific dashboard
router.get('/dashboards/:dashboardId', executiveController.getDashboard);

// Create dashboard
router.post('/dashboards', executiveController.createDashboard);

// Update dashboard
router.put('/dashboards/:dashboardId', executiveController.updateDashboard);

// Delete dashboard
router.delete('/dashboards/:dashboardId', executiveController.deleteDashboard);

// ==========================================
// 9.2.2 Trend Analysis Routes
// ==========================================

// Get trend analyses
router.get('/trends', executiveController.getTrendAnalyses);

// Create trend analysis
router.post('/trends', executiveController.createTrendAnalysis);

// Get forecast
router.get('/forecast', executiveController.getForecast);

// ==========================================
// 9.2.3 Benchmark Comparisons Routes
// ==========================================

// Get industry benchmarks
router.get('/benchmarks/industry', executiveController.getIndustryBenchmarks);

// Get organization benchmark comparisons
router.get('/benchmarks/comparisons', executiveController.getBenchmarkComparisons);

// Run new benchmark comparison
router.post('/benchmarks/compare', executiveController.runBenchmarkComparison);

// ==========================================
// 9.2.4 Custom Dashboard Builder Routes
// ==========================================

// Get widgets
router.get('/widgets', executiveController.getWidgets);

// Get widget templates
router.get('/widgets/templates', executiveController.getWidgetTemplates);

// Create widget
router.post('/widgets', executiveController.createWidget);

// Update widget
router.put('/widgets/:widgetId', executiveController.updateWidget);

// Delete widget
router.delete('/widgets/:widgetId', executiveController.deleteWidget);

// ==========================================
// 9.2.5 Scheduled Reports Routes
// ==========================================

// Get scheduled reports
router.get('/reports', executiveController.getScheduledReports);

// Get specific scheduled report
router.get('/reports/:reportId', executiveController.getScheduledReport);

// Create scheduled report
router.post('/reports', executiveController.createScheduledReport);

// Update scheduled report
router.put('/reports/:reportId', executiveController.updateScheduledReport);

// Delete scheduled report
router.delete('/reports/:reportId', executiveController.deleteScheduledReport);

// Run report now
router.post('/reports/:reportId/run', executiveController.runReportNow);

// Get report executions
router.get('/reports/:reportId/executions', executiveController.getReportExecutions);

// ==========================================
// 9.2.6 BI Tool Export Routes
// ==========================================

// Get BI configurations
router.get('/bi-exports', executiveController.getBIConfigs);

// Get specific BI configuration
router.get('/bi-exports/:configId', executiveController.getBIConfig);

// Create BI configuration
router.post('/bi-exports', executiveController.createBIConfig);

// Update BI configuration
router.put('/bi-exports/:configId', executiveController.updateBIConfig);

// Delete BI configuration
router.delete('/bi-exports/:configId', executiveController.deleteBIConfig);

// Test BI connection
router.post('/bi-exports/:configId/test', executiveController.testBIConnection);

// Trigger BI export
router.post('/bi-exports/:configId/export', executiveController.triggerBIExport);

// Get BI export logs
router.get('/bi-exports/:configId/logs', executiveController.getBIExportLogs);

// ==========================================
// 9.2.7 Goal Tracking Routes
// ==========================================

// Get hiring goals
router.get('/goals', executiveController.getHiringGoals);

// Get specific hiring goal
router.get('/goals/:goalId', executiveController.getHiringGoal);

// Create hiring goal
router.post('/goals', executiveController.createHiringGoal);

// Update hiring goal
router.put('/goals/:goalId', executiveController.updateHiringGoal);

// Delete hiring goal
router.delete('/goals/:goalId', executiveController.deleteHiringGoal);

// Get goal progress
router.get('/goals/:goalId/progress', executiveController.getGoalProgress);

// Record goal progress
router.post('/goals/:goalId/progress', executiveController.recordGoalProgress);

// ==========================================
// 9.2.8 Department/Team Views Routes
// ==========================================

// Get department views
router.get('/departments', executiveController.getDepartmentViews);

// Get specific department view
router.get('/departments/:departmentId', executiveController.getDepartmentView);

// Compare departments
router.post('/departments/compare', executiveController.compareDepartments);

// Get team metrics
router.get('/teams', executiveController.getTeamMetrics);

// Get specific team metric
router.get('/teams/:teamId', executiveController.getTeamMetric);

export default router;
