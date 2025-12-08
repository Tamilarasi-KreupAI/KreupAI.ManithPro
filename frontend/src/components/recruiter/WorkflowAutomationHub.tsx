// Batch 37-39: Workflow Automation Hub (11.1-11.3)
import React, { useState, useEffect } from 'react';
import {
  automationsAPI,
  templatesAPI,
  triggersAPI,
  scheduledJobsAPI,
  bulkActionsAPI,
  approvalWorkflowsAPI,
  approvalRequestsAPI,
  dashboardAPI,
} from '../../services/batch37_39WorkflowAutomationAPI';

type MainTab = 'automations' | 'scheduled' | 'bulk' | 'approvals';

const WorkflowAutomationHub: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('automations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<any>(null);

  // Automations state
  const [automations, setAutomations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);

  // Scheduled jobs state
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);

  // Bulk actions state
  const [bulkActions, setBulkActions] = useState<any[]>([]);

  // Approval state
  const [approvalWorkflows, setApprovalWorkflows] = useState<any[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
  const [myPendingApprovals, setMyPendingApprovals] = useState<any[]>([]);

  // Modal states
  const [showNewAutomationModal, setShowNewAutomationModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showNewApprovalWorkflowModal, setShowNewApprovalWorkflowModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeMainTab]);

  const loadDashboard = async () => {
    try {
      const data = await dashboardAPI.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeMainTab) {
        case 'automations':
          const [autoData, tplData, eventsData, actionsData] = await Promise.all([
            automationsAPI.getAutomations(),
            templatesAPI.getTemplates(),
            triggersAPI.getEvents(),
            triggersAPI.getActions(),
          ]);
          setAutomations(autoData.automations || []);
          setTemplates(tplData.templates || []);
          setTriggerEvents(eventsData.events || []);
          setActions(actionsData.actions || []);
          break;

        case 'scheduled':
          const jobsData = await scheduledJobsAPI.getJobs();
          setScheduledJobs(jobsData.jobs || []);
          break;

        case 'bulk':
          const bulkData = await bulkActionsAPI.getActions();
          setBulkActions(bulkData.actions || []);
          break;

        case 'approvals':
          const [workflowsData, requestsData, pendingData] = await Promise.all([
            approvalWorkflowsAPI.getWorkflows(),
            approvalRequestsAPI.getRequests(),
            approvalRequestsAPI.getMyPending(),
          ]);
          setApprovalWorkflows(workflowsData.workflows || []);
          setApprovalRequests(requestsData.requests || []);
          setMyPendingApprovals(pendingData.pendingApprovals || []);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Automation handlers
  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      await automationsAPI.toggleAutomation(automationId, !isActive);
      loadTabData();
    } catch (err) {
      alert('Failed to toggle automation');
    }
  };

  const handleExecuteAutomation = async (automationId: string) => {
    try {
      await automationsAPI.executeAutomation(automationId);
      alert('Automation executed!');
      loadTabData();
    } catch (err) {
      alert('Failed to execute automation');
    }
  };

  const handleViewExecutions = async (automation: any) => {
    try {
      const data = await automationsAPI.getExecutions(automation.id);
      setExecutions(data.executions || []);
      setSelectedAutomation(automation);
    } catch (err) {
      alert('Failed to load executions');
    }
  };

  // Scheduled job handlers
  const handleRunJobNow = async (jobId: string) => {
    try {
      await scheduledJobsAPI.runNow(jobId);
      alert('Job started!');
      loadTabData();
    } catch (err) {
      alert('Failed to run job');
    }
  };

  // Approval handlers
  const handleApprove = async (requestId: string) => {
    try {
      await approvalRequestsAPI.approve(requestId);
      alert('Request approved!');
      loadTabData();
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      await approvalRequestsAPI.reject(requestId, reason);
      alert('Request rejected');
      loadTabData();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  // Render Dashboard Summary
  const renderDashboard = () => (
    dashboard && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Active Automations</h4>
          <p className="text-2xl font-bold text-blue-600">{dashboard.workflowAutomations?.active || 0}</p>
          <p className="text-xs text-gray-400">{dashboard.workflowAutomations?.executionsToday || 0} executions today</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Scheduled Jobs</h4>
          <p className="text-2xl font-bold text-green-600">{dashboard.scheduledJobs?.active || 0}</p>
          <p className="text-xs text-gray-400">Next run in {dashboard.scheduledJobs?.nextRunIn || 0} min</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Bulk Actions</h4>
          <p className="text-2xl font-bold text-purple-600">{dashboard.bulkActions?.inProgress || 0} in progress</p>
          <p className="text-xs text-gray-400">{dashboard.bulkActions?.recordsProcessedToday || 0} records today</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Pending Approvals</h4>
          <p className="text-2xl font-bold text-orange-600">{dashboard.approvalWorkflows?.pendingApprovals || 0}</p>
          <p className="text-xs text-gray-400">{dashboard.approvalWorkflows?.urgentApprovals || 0} urgent</p>
        </div>
      </div>
    )
  );

  // Render Automations Tab
  const renderAutomationsTab = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Workflow Automations</h3>
        <button
          onClick={() => setShowNewAutomationModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Automation
        </button>
      </div>

      {/* Templates */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Quick Start Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.slice(0, 4).map((template: any) => (
            <div key={template.id} className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer">
              <div className="text-2xl mb-1">{template.icon || '🔄'}</div>
              <h5 className="font-medium text-sm">{template.name}</h5>
              <p className="text-xs text-gray-500">{template.category}</p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <span>Used {template.usageCount} times</span>
                {template.rating && <span className="ml-2">★ {template.rating}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Automation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {automations.map((automation: any) => (
              <tr key={automation.id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{automation.name}</div>
                  <div className="text-sm text-gray-500">{automation.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                    {automation.triggerType}
                  </span>
                  {automation.triggerEvent && (
                    <span className="ml-1 text-xs text-gray-500">{automation.triggerEvent}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={automation.isActive}
                      onChange={() => handleToggleAutomation(automation.id, automation.isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{automation.executionCount} total</div>
                  <div className="text-xs text-gray-500">
                    {automation.successCount} success / {automation.failureCount} failed
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExecuteAutomation(automation.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Run
                    </button>
                    <button
                      onClick={() => handleViewExecutions(automation)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      History
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Execution History Panel */}
      {selectedAutomation && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Execution History - {selectedAutomation.name}</h4>
            <button onClick={() => setSelectedAutomation(null)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {executions.map((exec: any) => (
              <div key={exec.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    exec.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exec.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exec.status}
                  </span>
                  <span className="ml-2 text-sm">Triggered by {exec.triggeredBy}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {exec.stepsCompleted}/{exec.totalSteps} steps • {exec.duration}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trigger Events Reference */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Available Trigger Events</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {triggerEvents.slice(0, 8).map((event: any) => (
            <div key={event.id} className="p-2 bg-gray-50 rounded text-sm">
              <p className="font-medium">{event.name}</p>
              <p className="text-xs text-gray-500">{event.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Scheduled Jobs Tab
  const renderScheduledTab = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Scheduled Jobs</h3>
        <button
          onClick={() => setShowNewJobModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Job
        </button>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scheduledJobs.map((job: any) => (
              <tr key={job.id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{job.name}</div>
                  <div className="text-sm text-gray-500">{job.description}</div>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{job.jobType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono">{job.schedule}</div>
                  <div className="text-xs text-gray-500">{job.timezone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Never'}
                  </div>
                  {job.lastStatus && (
                    <span className={`text-xs ${
                      job.lastStatus === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {job.lastStatus} ({job.lastDuration}ms)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRunJobNow(job.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Run Now
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Next Run Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Upcoming Runs</h4>
        <div className="space-y-2">
          {scheduledJobs.filter(j => j.nextRunAt).slice(0, 3).map((job: any) => (
            <div key={job.id} className="flex justify-between text-sm">
              <span>{job.name}</span>
              <span className="text-blue-600">{new Date(job.nextRunAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Bulk Actions Tab
  const renderBulkTab = () => (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bulk Actions</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Bulk Action
        </button>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {bulkActions.map((action: any) => (
          <div key={action.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{action.name || `Bulk ${action.actionType}`}</h4>
                <p className="text-sm text-gray-500">
                  Target: {action.targetType} • Action: {action.actionType}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                action.status === 'completed' ? 'bg-green-100 text-green-800' :
                action.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                action.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {action.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{action.processedCount} / {action.totalCount} ({action.progress.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    action.status === 'completed' ? 'bg-green-500' :
                    action.status === 'processing' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${action.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {action.successCount} success / {action.failureCount} failed
              </span>
              {action.status === 'processing' && (
                <button className="text-red-600 hover:text-red-800">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Quick Bulk Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 border rounded-lg text-left hover:border-blue-500">
            <div className="text-lg mb-1">📧</div>
            <p className="font-medium text-sm">Send Emails</p>
            <p className="text-xs text-gray-500">Bulk email to candidates</p>
          </button>
          <button className="p-3 border rounded-lg text-left hover:border-blue-500">
            <div className="text-lg mb-1">🏷️</div>
            <p className="font-medium text-sm">Add Tags</p>
            <p className="text-xs text-gray-500">Tag multiple records</p>
          </button>
          <button className="p-3 border rounded-lg text-left hover:border-blue-500">
            <div className="text-lg mb-1">📁</div>
            <p className="font-medium text-sm">Archive</p>
            <p className="text-xs text-gray-500">Archive old records</p>
          </button>
          <button className="p-3 border rounded-lg text-left hover:border-blue-500">
            <div className="text-lg mb-1">👤</div>
            <p className="font-medium text-sm">Assign</p>
            <p className="text-xs text-gray-500">Bulk assign recruiter</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Render Approvals Tab
  const renderApprovalsTab = () => (
    <div className="space-y-6">
      {/* My Pending Approvals */}
      {myPendingApprovals.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-3">Your Pending Approvals ({myPendingApprovals.length})</h4>
          <div className="space-y-2">
            {myPendingApprovals.map((approval: any) => (
              <div key={approval.id} className="bg-white p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{approval.title}</p>
                  <p className="text-sm text-gray-500">
                    {approval.requestType} • Requested by {approval.requestedBy}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    approval.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    approval.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {approval.priority}
                  </span>
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Workflows */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Approval Workflows</h3>
          <button
            onClick={() => setShowNewApprovalWorkflowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Workflow
          </button>
        </div>

        <div className="space-y-3">
          {approvalWorkflows.map((workflow: any) => (
            <div key={workflow.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-gray-500">{workflow.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Approval Steps */}
              <div className="flex items-center space-x-2 mb-3">
                {workflow.steps?.map((step: any, index: number) => (
                  <React.Fragment key={index}>
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {step.name}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span>Avg. time: {workflow.avgApprovalTime}h</span>
                  <span className="mx-2">•</span>
                  <span>Approval rate: {(workflow.approvalRate * 100).toFixed(0)}%</span>
                  <span className="mx-2">•</span>
                  <span>{workflow.totalRequests} requests</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Requests */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Recent Approval Requests</h4>
        <div className="space-y-2">
          {approvalRequests.map((request: any) => (
            <div key={request.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{request.title}</p>
                <p className="text-sm text-gray-500">
                  {request.requestType} • By {request.requestedByName} • {new Date(request.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  request.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
                <span className="text-sm text-gray-500">
                  Step {request.currentStep + 1}/{request.approvalSteps?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const mainTabs = [
    { id: 'automations' as MainTab, label: 'Automations', icon: '🔄' },
    { id: 'scheduled' as MainTab, label: 'Scheduled Jobs', icon: '📅' },
    { id: 'bulk' as MainTab, label: 'Bulk Actions', icon: '📦' },
    { id: 'approvals' as MainTab, label: 'Approvals', icon: '✅' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
        <p className="text-gray-600">Automate tasks, schedule jobs, and manage approval workflows</p>
      </div>

      {/* Dashboard Summary */}
      {renderDashboard()}

      {/* Main Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
              activeMainTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeMainTab === 'automations' && renderAutomationsTab()}
          {activeMainTab === 'scheduled' && renderScheduledTab()}
          {activeMainTab === 'bulk' && renderBulkTab()}
          {activeMainTab === 'approvals' && renderApprovalsTab()}
        </>
      )}

      {/* Modals */}
      {showNewAutomationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Automation</h3>
            <p className="text-gray-500 mb-4">Automation configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowNewAutomationModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create Scheduled Job</h3>
            <p className="text-gray-500 mb-4">Job configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowNewJobModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewApprovalWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create Approval Workflow</h3>
            <p className="text-gray-500 mb-4">Workflow configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowNewApprovalWorkflowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomationHub;
