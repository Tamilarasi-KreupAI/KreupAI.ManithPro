// Batch 33-36: Platform Integrations Hub (10.1-10.4)
import React, { useState, useEffect } from 'react';
import {
  hrIntegrationsAPI,
  communicationAPI,
  jobBoardsAPI,
  developerToolsAPI,
} from '../../services/batch33_36PlatformIntegrationsAPI';

type MainTab = 'hr' | 'communication' | 'jobBoards' | 'developer';

const PlatformIntegrationsHub: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('hr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HR Integrations State
  const [hrIntegrations, setHRIntegrations] = useState<any[]>([]);
  const [hrProviders, setHRProviders] = useState<any[]>([]);
  const [hrDashboard, setHRDashboard] = useState<any>(null);
  const [selectedHRIntegration, setSelectedHRIntegration] = useState<any>(null);
  const [hrSyncLogs, setHRSyncLogs] = useState<any[]>([]);

  // Communication State
  const [commIntegrations, setCommIntegrations] = useState<any[]>([]);
  const [commPlatforms, setCommPlatforms] = useState<any[]>([]);
  const [commTemplates, setCommTemplates] = useState<any[]>([]);
  const [commDashboard, setCommDashboard] = useState<any>(null);

  // Job Boards State
  const [jobBoardIntegrations, setJobBoardIntegrations] = useState<any[]>([]);
  const [availableBoards, setAvailableBoards] = useState<any[]>([]);
  const [jobBoardDashboard, setJobBoardDashboard] = useState<any>(null);
  const [jobPostings, setJobPostings] = useState<any[]>([]);

  // Developer Tools State
  const [apiKeys, setAPIKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [devDashboard, setDevDashboard] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [apiScopes, setAPIScopes] = useState<any[]>([]);

  // Modal States
  const [showNewIntegrationModal, setShowNewIntegrationModal] = useState(false);
  const [showNewAPIKeyModal, setShowNewAPIKeyModal] = useState(false);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    loadTabData();
  }, [activeMainTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeMainTab) {
        case 'hr':
          const [hrIntData, hrProvData, hrDashData] = await Promise.all([
            hrIntegrationsAPI.getIntegrations(),
            hrIntegrationsAPI.getProviders(),
            hrIntegrationsAPI.getDashboard(),
          ]);
          setHRIntegrations(hrIntData.integrations || []);
          setHRProviders(hrProvData.providers || []);
          setHRDashboard(hrDashData);
          break;

        case 'communication':
          const [commIntData, commPlatData, commTempData, commDashData] = await Promise.all([
            communicationAPI.getIntegrations(),
            communicationAPI.getPlatforms(),
            communicationAPI.getTemplates(),
            communicationAPI.getDashboard(),
          ]);
          setCommIntegrations(commIntData.integrations || []);
          setCommPlatforms(commPlatData.platforms || []);
          setCommTemplates(commTempData.templates || []);
          setCommDashboard(commDashData);
          break;

        case 'jobBoards':
          const [jbIntData, jbBoardsData, jbDashData] = await Promise.all([
            jobBoardsAPI.getIntegrations(),
            jobBoardsAPI.getBoards(),
            jobBoardsAPI.getDashboard(),
          ]);
          setJobBoardIntegrations(jbIntData.integrations || []);
          setAvailableBoards(jbBoardsData.boards || []);
          setJobBoardDashboard(jbDashData);
          break;

        case 'developer':
          const [apiKeysData, webhooksData, devDashData, eventsData, scopesData] = await Promise.all([
            developerToolsAPI.getAPIKeys(),
            developerToolsAPI.getWebhooks(),
            developerToolsAPI.getDashboard(),
            developerToolsAPI.getAvailableEvents(),
            developerToolsAPI.getAPIScopes(),
          ]);
          setAPIKeys(apiKeysData.apiKeys || []);
          setWebhooks(webhooksData.webhooks || []);
          setDevDashboard(devDashData);
          setAvailableEvents(eventsData.events || []);
          setAPIScopes(scopesData.scopes || []);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // HR Integration handlers
  const handleTestHRConnection = async (integrationId: string) => {
    try {
      const result = await hrIntegrationsAPI.testConnection(integrationId);
      alert(result.success ? 'Connection successful!' : 'Connection failed: ' + result.error);
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleTriggerSync = async (integrationId: string) => {
    try {
      await hrIntegrationsAPI.triggerSync(integrationId);
      alert('Sync triggered successfully!');
      loadTabData();
    } catch (err) {
      alert('Sync failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleViewSyncLogs = async (integrationId: string) => {
    try {
      const result = await hrIntegrationsAPI.getSyncLogs(integrationId);
      setHRSyncLogs(result.logs || []);
      setSelectedHRIntegration(hrIntegrations.find(i => i.id === integrationId));
    } catch (err) {
      alert('Failed to load logs: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Communication handlers
  const handleTestCommunication = async (integrationId: string) => {
    try {
      const result = await communicationAPI.testIntegration(integrationId);
      alert(result.success ? 'Test successful!' : 'Test failed: ' + result.error);
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Job Board handlers
  const handleTestJobBoard = async (integrationId: string) => {
    try {
      const result = await jobBoardsAPI.testConnection(integrationId);
      alert(result.success ? 'Connection successful!' : 'Connection failed: ' + result.error);
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleViewPostings = async (integrationId: string) => {
    try {
      const result = await jobBoardsAPI.getPostings(integrationId);
      setJobPostings(result.postings || []);
    } catch (err) {
      alert('Failed to load postings: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Developer Tools handlers
  const handleRevokeAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    try {
      await developerToolsAPI.revokeAPIKey(keyId);
      loadTabData();
    } catch (err) {
      alert('Failed to revoke key: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const result = await developerToolsAPI.testWebhook(webhookId);
      alert(result.success ? 'Webhook test sent!' : 'Test failed: ' + result.error);
    } catch (err) {
      alert('Test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await developerToolsAPI.deleteWebhook(webhookId);
      loadTabData();
    } catch (err) {
      alert('Failed to delete webhook: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Render HR Integrations Tab
  const renderHRIntegrationsTab = () => (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {hrDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total Integrations</h4>
            <p className="text-2xl font-bold text-blue-600">{hrDashboard.totalIntegrations || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active</h4>
            <p className="text-2xl font-bold text-green-600">{hrDashboard.activeIntegrations || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Records Synced</h4>
            <p className="text-2xl font-bold text-purple-600">{hrDashboard.totalRecordsSynced || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Last Sync</h4>
            <p className="text-lg font-semibold text-gray-700">
              {hrDashboard.lastSyncTime ? new Date(hrDashboard.lastSyncTime).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">HR & Payroll Integrations</h3>
        <button
          onClick={() => setShowNewIntegrationModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Integration
        </button>
      </div>

      {/* Available Providers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Available Providers</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hrProviders.map((provider: any) => (
            <div key={provider.id} className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-1">{provider.icon || '🔗'}</div>
              <p className="font-medium text-sm">{provider.name}</p>
              <p className="text-xs text-gray-500">{provider.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hrIntegrations.map((integration: any) => (
              <tr key={integration.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{integration.name}</div>
                  <div className="text-sm text-gray-500">{integration.integrationType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{integration.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    integration.status === 'active' ? 'bg-green-100 text-green-800' :
                    integration.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestHRConnection(integration.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleTriggerSync(integration.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => handleViewSyncLogs(integration.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sync Logs Panel */}
      {selectedHRIntegration && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Sync Logs - {selectedHRIntegration.name}</h4>
            <button onClick={() => setSelectedHRIntegration(null)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hrSyncLogs.map((log: any) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    log.status === 'completed' ? 'bg-green-100 text-green-800' :
                    log.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status}
                  </span>
                  <span className="ml-2 text-sm">{log.syncType} - {log.direction}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {log.recordsProcessed || 0} records • {new Date(log.startedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Communication Tab
  const renderCommunicationTab = () => (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {commDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total Integrations</h4>
            <p className="text-2xl font-bold text-blue-600">{commDashboard.totalIntegrations || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Messages Sent</h4>
            <p className="text-2xl font-bold text-green-600">{commDashboard.messagesSent || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active Templates</h4>
            <p className="text-2xl font-bold text-purple-600">{commDashboard.activeTemplates || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Delivery Rate</h4>
            <p className="text-2xl font-bold text-orange-600">{commDashboard.deliveryRate || 0}%</p>
          </div>
        </div>
      )}

      {/* Integrations */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Communication Platforms</h3>
          <button
            onClick={() => setShowNewIntegrationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Platform
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commIntegrations.map((integration: any) => (
            <div key={integration.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-gray-500">{integration.platform}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {integration.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <p>Messages: {integration.messagesSent || 0}</p>
                <p>Type: {integration.integrationType}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestCommunication(integration.id)}
                  className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Test
                </button>
                <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Templates */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Message Templates</h3>
          <button
            onClick={() => setShowNewTemplateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + New Template
          </button>
        </div>

        <div className="space-y-3">
          {commTemplates.map((template: any) => (
            <div key={template.id} className="border rounded-lg p-3 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500">
                  {template.templateType} • {template.platform || 'All Platforms'} • {template.eventType}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-purple-600 hover:text-purple-800 text-sm">Preview</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Platforms */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Available Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commPlatforms.map((platform: any) => (
            <div key={platform.id} className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-1">{platform.icon || '💬'}</div>
              <p className="font-medium text-sm">{platform.name}</p>
              <p className="text-xs text-gray-500">{platform.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Job Boards Tab
  const renderJobBoardsTab = () => (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {jobBoardDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active Boards</h4>
            <p className="text-2xl font-bold text-blue-600">{jobBoardDashboard.activeBoards || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active Postings</h4>
            <p className="text-2xl font-bold text-green-600">{jobBoardDashboard.activePostings || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total Applications</h4>
            <p className="text-2xl font-bold text-purple-600">{jobBoardDashboard.totalApplications || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Avg. Cost per Application</h4>
            <p className="text-2xl font-bold text-orange-600">${jobBoardDashboard.avgCostPerApplication || 0}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Job Board Integrations</h3>
        <button
          onClick={() => setShowNewIntegrationModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Job Board
        </button>
      </div>

      {/* Available Boards */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-3">Available Job Boards</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableBoards.map((board: any) => (
            <div key={board.id} className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-1">{board.icon || '📋'}</div>
              <p className="font-medium text-sm">{board.name}</p>
              <p className="text-xs text-gray-500">{board.category}</p>
              {board.isPremium && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Premium</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Board</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Postings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobBoardIntegrations.map((integration: any) => (
              <tr key={integration.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{integration.name}</div>
                  <div className="text-sm text-gray-500">{integration.platform}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    integration.status === 'active' ? 'bg-green-100 text-green-800' :
                    integration.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{integration.activePostings || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{integration.totalApplications || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestJobBoard(integration.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleViewPostings(integration.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Postings
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 text-sm">
                      Analytics
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Job Postings */}
      {jobPostings.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-3">Job Postings</h4>
          <div className="space-y-2">
            {jobPostings.map((posting: any) => (
              <div key={posting.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <h5 className="font-medium">{posting.jobTitle}</h5>
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(posting.postedAt).toLocaleDateString()} •
                    Expires: {posting.expiresAt ? new Date(posting.expiresAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{posting.views || 0} views</p>
                    <p className="text-xs text-gray-500">{posting.applications || 0} applications</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    posting.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {posting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Developer Tools Tab
  const renderDeveloperToolsTab = () => (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {devDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active API Keys</h4>
            <p className="text-2xl font-bold text-blue-600">{devDashboard.activeAPIKeys || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Active Webhooks</h4>
            <p className="text-2xl font-bold text-green-600">{devDashboard.activeWebhooks || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">API Calls (30d)</h4>
            <p className="text-2xl font-bold text-purple-600">{devDashboard.apiCallsLast30Days || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Webhook Success Rate</h4>
            <p className="text-2xl font-bold text-orange-600">{devDashboard.webhookSuccessRate || 0}%</p>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">API Keys</h3>
          <button
            onClick={() => setShowNewAPIKeyModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Generate Key
          </button>
        </div>

        <div className="space-y-3">
          {apiKeys.map((key: any) => (
            <div key={key.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{key.name}</h4>
                  <p className="text-sm text-gray-500">{key.description || 'No description'}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {key.isActive ? 'Active' : 'Revoked'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>Key: {key.keyPrefix}••••••••</span>
                <span>Environment: {key.environment || 'production'}</span>
                <span>Rate Limit: {key.rateLimit || 1000}/min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(key.scopes || []).slice(0, 3).map((scope: string) => (
                    <span key={scope} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {scope}
                    </span>
                  ))}
                  {(key.scopes || []).length > 3 && (
                    <span className="text-xs text-gray-500">+{key.scopes.length - 3} more</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View Usage</button>
                  {key.isActive && (
                    <button
                      onClick={() => handleRevokeAPIKey(key.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Webhooks</h3>
          <button
            onClick={() => setShowNewWebhookModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Webhook
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map((webhook: any) => (
            <div key={webhook.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{webhook.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {(webhook.events || []).map((event: string) => (
                  <span key={event} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {event}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  Last triggered: {webhook.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString() : 'Never'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Test
                  </button>
                  <button className="text-purple-600 hover:text-purple-800">Deliveries</button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Events & Scopes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-3">Available Webhook Events</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableEvents.map((event: any) => (
              <div key={event.id} className="p-2 bg-gray-50 rounded">
                <p className="font-medium text-sm">{event.name}</p>
                <p className="text-xs text-gray-500">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-3">API Scopes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {apiScopes.map((scope: any) => (
              <div key={scope.id} className="p-2 bg-gray-50 rounded">
                <p className="font-medium text-sm">{scope.name}</p>
                <p className="text-xs text-gray-500">{scope.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-2">Developer Documentation</h3>
        <p className="text-sm opacity-90 mb-4">
          Access comprehensive API documentation, code samples, and integration guides.
        </p>
        <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100">
          View Documentation
        </button>
      </div>
    </div>
  );

  const mainTabs = [
    { id: 'hr' as MainTab, label: 'HR & Payroll', icon: '👥' },
    { id: 'communication' as MainTab, label: 'Communication', icon: '💬' },
    { id: 'jobBoards' as MainTab, label: 'Job Boards', icon: '📋' },
    { id: 'developer' as MainTab, label: 'Developer Tools', icon: '🔧' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Integrations</h1>
        <p className="text-gray-600">Connect and manage third-party platform integrations</p>
      </div>

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
          {activeMainTab === 'hr' && renderHRIntegrationsTab()}
          {activeMainTab === 'communication' && renderCommunicationTab()}
          {activeMainTab === 'jobBoards' && renderJobBoardsTab()}
          {activeMainTab === 'developer' && renderDeveloperToolsTab()}
        </>
      )}

      {/* New Integration Modal Placeholder */}
      {showNewIntegrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Add New {activeMainTab === 'hr' ? 'HR Integration' :
                       activeMainTab === 'communication' ? 'Communication Platform' :
                       'Job Board'}
            </h3>
            <p className="text-gray-500 mb-4">Integration configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewIntegrationModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Integration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New API Key Modal Placeholder */}
      {showNewAPIKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate New API Key</h3>
            <p className="text-gray-500 mb-4">API key configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewAPIKeyModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Webhook Modal Placeholder */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Webhook</h3>
            <p className="text-gray-500 mb-4">Webhook configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewWebhookModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal Placeholder */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Message Template</h3>
            <p className="text-gray-500 mb-4">Template configuration form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformIntegrationsHub;
