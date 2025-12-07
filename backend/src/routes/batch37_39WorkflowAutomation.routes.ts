// Batch 37-39: Workflow Automation Routes (11.1-11.3)
import { Router } from 'express';
import * as workflowController from '../controllers/batch37_39WorkflowAutomation.controller';

const router = Router();

// ==========================================
// Batch 37: Automation Engine Routes (11.1)
// ==========================================

// Workflow Automations
router.get('/automations', workflowController.getWorkflowAutomations);
router.get('/automations/:automationId', workflowController.getWorkflowAutomation);
router.post('/automations', workflowController.createWorkflowAutomation);
router.put('/automations/:automationId', workflowController.updateWorkflowAutomation);
router.delete('/automations/:automationId', workflowController.deleteWorkflowAutomation);
router.post('/automations/:automationId/toggle', workflowController.toggleWorkflowStatus);
router.post('/automations/:automationId/execute', workflowController.executeWorkflow);
router.get('/automations/:automationId/executions', workflowController.getWorkflowExecutions);

// Workflow Templates
router.get('/templates', workflowController.getWorkflowTemplates);
router.post('/templates/:templateId/create', workflowController.createFromTemplate);

// Trigger Events & Actions
router.get('/trigger-events', workflowController.getTriggerEvents);
router.get('/actions', workflowController.getAvailableActions);

// Scheduled Jobs
router.get('/scheduled-jobs', workflowController.getScheduledJobs);
router.post('/scheduled-jobs', workflowController.createScheduledJob);
router.put('/scheduled-jobs/:jobId', workflowController.updateScheduledJob);
router.delete('/scheduled-jobs/:jobId', workflowController.deleteScheduledJob);
router.post('/scheduled-jobs/:jobId/run', workflowController.runJobNow);

// Bulk Actions
router.get('/bulk-actions', workflowController.getBulkActions);
router.post('/bulk-actions', workflowController.createBulkAction);
router.get('/bulk-actions/:actionId/status', workflowController.getBulkActionStatus);
router.post('/bulk-actions/:actionId/cancel', workflowController.cancelBulkAction);

// ==========================================
// Batch 39: Approval Workflows Routes (11.3)
// ==========================================

// Approval Workflows
router.get('/approval-workflows', workflowController.getApprovalWorkflows);
router.get('/approval-workflows/:workflowId', workflowController.getApprovalWorkflow);
router.post('/approval-workflows', workflowController.createApprovalWorkflow);
router.put('/approval-workflows/:workflowId', workflowController.updateApprovalWorkflow);
router.delete('/approval-workflows/:workflowId', workflowController.deleteApprovalWorkflow);

// Approval Requests
router.get('/approval-requests', workflowController.getApprovalRequests);
router.get('/approval-requests/my-pending', workflowController.getMyPendingApprovals);
router.post('/approval-requests', workflowController.submitApprovalRequest);
router.post('/approval-requests/:requestId/approve', workflowController.approveRequest);
router.post('/approval-requests/:requestId/reject', workflowController.rejectRequest);
router.post('/approval-requests/:requestId/delegate', workflowController.delegateApproval);

// Analytics
router.get('/approval-analytics', workflowController.getApprovalAnalytics);

// Dashboard
router.get('/dashboard', workflowController.getAutomationDashboard);

export default router;
