// Batch 40-42: Mobile & Accessibility Hub (12.1-12.3)
import React, { useState, useEffect } from 'react';
import {
  devicesAPI,
  pushNotificationsAPI,
  appConfigAPI,
  pwaAPI,
  accessibilityAPI,
  dashboardAPI,
} from '../../services/batch40_42MobileAccessibilityAPI';

type MainTab = 'mobile' | 'pwa' | 'accessibility';

const MobileAccessibilityHub: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<any>(null);

  // Mobile state
  const [devices, setDevices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<any>(null);

  // PWA state
  const [pwaConfig, setPwaConfig] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [swStatus, setSwStatus] = useState<any>(null);

  // Accessibility state
  const [accessibilitySettings, setAccessibilitySettings] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [accessibilityDashboard, setAccessibilityDashboard] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeMainTab]);

  const loadDashboard = async () => {
    try {
      const data = await dashboardAPI.getDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeMainTab) {
        case 'mobile':
          const [devicesData, notifData, configData] = await Promise.all([
            devicesAPI.getDevices(),
            pushNotificationsAPI.getNotifications(),
            appConfigAPI.getConfig(),
          ]);
          setDevices(devicesData.devices || []);
          setNotifications(notifData.notifications || []);
          setAppConfig(configData.config);
          break;

        case 'pwa':
          const [pwaConfigData, subsData, statusData] = await Promise.all([
            pwaAPI.getConfig(),
            pwaAPI.getSubscriptions(),
            pwaAPI.getServiceWorkerStatus(),
          ]);
          setPwaConfig(pwaConfigData.config);
          setSubscriptions(subsData.subscriptions || []);
          setSwStatus(statusData.status);
          break;

        case 'accessibility':
          const [settingsData, presetsData, auditsData, accDashData] = await Promise.all([
            accessibilityAPI.getSettings(),
            accessibilityAPI.getPresets(),
            accessibilityAPI.getAudits(),
            accessibilityAPI.getDashboard(),
          ]);
          setAccessibilitySettings(settingsData.settings);
          setPresets(presetsData.presets || []);
          setAudits(auditsData.audits || []);
          setAccessibilityDashboard(accDashData.dashboard);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Mobile handlers
  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Remove this device?')) return;
    try {
      await devicesAPI.deleteDevice(deviceId);
      loadTabData();
    } catch (err) {
      alert('Failed to remove device');
    }
  };

  // Accessibility handlers
  const handleUpdateAccessibility = async (key: string, value: any) => {
    try {
      const updated = await accessibilityAPI.updateSettings({ [key]: value });
      setAccessibilitySettings(updated.settings);
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      const result = await accessibilityAPI.applyPreset(presetId);
      setAccessibilitySettings(result.settings);
      alert('Preset applied successfully!');
    } catch (err) {
      alert('Failed to apply preset');
    }
  };

  const handleResetAccessibility = async () => {
    if (!confirm('Reset all accessibility settings to defaults?')) return;
    try {
      const result = await accessibilityAPI.resetSettings();
      setAccessibilitySettings(result.settings);
      alert('Settings reset to defaults');
    } catch (err) {
      alert('Failed to reset settings');
    }
  };

  const handleRunAudit = async (pageUrl: string) => {
    try {
      await accessibilityAPI.runAudit({ pageUrl });
      alert('Audit started!');
      loadTabData();
    } catch (err) {
      alert('Failed to start audit');
    }
  };

  // Render Dashboard Summary
  const renderDashboard = () => (
    dashboard && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Mobile Devices</h4>
          <p className="text-2xl font-bold text-blue-600">{dashboard.mobile?.activeDevices || 0}</p>
          <p className="text-xs text-gray-400">
            {dashboard.mobile?.iosDevices || 0} iOS / {dashboard.mobile?.androidDevices || 0} Android
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">PWA Users</h4>
          <p className="text-2xl font-bold text-green-600">{dashboard.pwa?.activeUsers || 0}</p>
          <p className="text-xs text-gray-400">{dashboard.pwa?.installations || 0} installations</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Accessibility Score</h4>
          <p className="text-2xl font-bold text-purple-600">{dashboard.accessibility?.overallScore || 0}</p>
          <p className="text-xs text-gray-400">WCAG {dashboard.accessibility?.wcagCompliance}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Notifications Today</h4>
          <p className="text-2xl font-bold text-orange-600">{dashboard.notifications?.sentToday || 0}</p>
          <p className="text-xs text-gray-400">{dashboard.notifications?.deliveryRate || 0}% delivered</p>
        </div>
      </div>
    )
  );

  // Render Mobile Tab
  const renderMobileTab = () => (
    <div className="space-y-6">
      {/* App Configuration */}
      {appConfig && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">App Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Version</p>
              <p className="font-medium">{appConfig.currentVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Minimum Version</p>
              <p className="font-medium">{appConfig.minVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Force Update</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                appConfig.forceUpdate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {appConfig.forceUpdate ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance Mode</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                appConfig.maintenanceMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {appConfig.maintenanceMode ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Flags</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(appConfig.features || {}).map(([key, value]) => (
                <span key={key} className={`px-2 py-1 text-xs rounded ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {key}: {value ? 'ON' : 'OFF'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registered Devices */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Registered Devices</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device: any) => (
              <tr key={device.id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{device.deviceName}</div>
                  <div className="text-sm text-gray-500">{device.deviceModel}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    device.platform === 'ios' ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {device.platform === 'ios' ? 'iOS' : 'Android'} {device.osVersion}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {device.pushEnabled && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Push</span>
                    )}
                    {device.biometricEnabled && (
                      <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                        {device.biometricType === 'face_id' ? 'Face ID' : 'Fingerprint'}
                      </span>
                    )}
                    {device.deviceTrusted && (
                      <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">Trusted</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Recent Push Notifications</h3>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notif: any) => (
            <div key={notif.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-gray-500">{notif.body}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  notif.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  notif.status === 'read' ? 'bg-blue-100 text-blue-800' :
                  notif.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {notif.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render PWA Tab
  const renderPWATab = () => (
    <div className="space-y-6">
      {/* PWA Configuration */}
      {pwaConfig && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">PWA Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">App Name</p>
              <p className="font-medium">{pwaConfig.appName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Short Name</p>
              <p className="font-medium">{pwaConfig.shortName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Theme Color</p>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: pwaConfig.themeColor }}></div>
                <span className="font-mono text-sm">{pwaConfig.themeColor}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Push Enabled</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                pwaConfig.pushEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pwaConfig.pushEnabled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Service Worker Status */}
      {swStatus && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Service Worker Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-medium">{swStatus.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cache Version</p>
              <p className="font-medium">{swStatus.cacheVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cache Size</p>
              <p className="font-medium">{swStatus.cacheSize} MB</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                swStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {swStatus.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Cached Routes</p>
            <div className="flex flex-wrap gap-2">
              {swStatus.cachedRoutes?.map((route: string) => (
                <span key={route} className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                  {route}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Web Push Subscriptions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Web Push Subscriptions</h3>
        <div className="space-y-3">
          {subscriptions.map((sub: any) => (
            <div key={sub.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{sub.browserName} {sub.browserVersion}</p>
                <p className="text-sm text-gray-500">
                  Sent: {sub.totalSent} | Delivered: {sub.totalDelivered}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {sub.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Install Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-2">Install Our App</h3>
        <p className="text-sm opacity-90 mb-4">
          Get the best experience with our Progressive Web App. Install it on your device for offline access and push notifications.
        </p>
        <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100">
          Install PWA
        </button>
      </div>
    </div>
  );

  // Render Accessibility Tab
  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      {/* Accessibility Score */}
      {accessibilityDashboard && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Accessibility Overview</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              accessibilityDashboard.overallScore >= 90 ? 'bg-green-100 text-green-800' :
              accessibilityDashboard.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Score: {accessibilityDashboard.overallScore}/100
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{accessibilityDashboard.byCategory?.perceivable?.score}</p>
              <p className="text-xs text-gray-500">Perceivable</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{accessibilityDashboard.byCategory?.operable?.score}</p>
              <p className="text-xs text-gray-500">Operable</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{accessibilityDashboard.byCategory?.understandable?.score}</p>
              <p className="text-xs text-gray-500">Understandable</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{accessibilityDashboard.byCategory?.robust?.score}</p>
              <p className="text-xs text-gray-500">Robust</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>WCAG {accessibilityDashboard.wcagCompliance} Compliance</p>
            <p>{accessibilityDashboard.issuesResolved} of {accessibilityDashboard.issuesFound} issues resolved ({accessibilityDashboard.resolutionRate}%)</p>
          </div>
        </div>
      )}

      {/* User Settings */}
      {accessibilitySettings && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Your Accessibility Settings</h3>
            <button
              onClick={handleResetAccessibility}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Visual</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">High Contrast</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.highContrast}
                    onChange={(e) => handleUpdateAccessibility('highContrast', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Reduced Motion</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.reducedMotion}
                    onChange={(e) => handleUpdateAccessibility('reducedMotion', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Font Size</span>
                  <select
                    value={accessibilitySettings.fontSize}
                    onChange={(e) => handleUpdateAccessibility('fontSize', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="x-large">Extra Large</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Navigation</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Keyboard Navigation</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.keyboardNavigation}
                    onChange={(e) => handleUpdateAccessibility('keyboardNavigation', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Focus Indicators</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.focusIndicators}
                    onChange={(e) => handleUpdateAccessibility('focusIndicators', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Skip Links</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.skipLinks}
                    onChange={(e) => handleUpdateAccessibility('skipLinks', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Screen Reader */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Screen Reader</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Screen Reader Optimized</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.screenReaderOptimized}
                    onChange={(e) => handleUpdateAccessibility('screenReaderOptimized', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Verbose Labels</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.verboseLabels}
                    onChange={(e) => handleUpdateAccessibility('verboseLabels', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Timing */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Timing & Media</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Extended Timeouts</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.extendedTimeouts}
                    onChange={(e) => handleUpdateAccessibility('extendedTimeouts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Auto-play Media</span>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.autoPlayMedia}
                    onChange={(e) => handleUpdateAccessibility('autoPlayMedia', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset: any) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className="p-3 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50"
            >
              <p className="font-medium text-sm">{preset.name}</p>
              <p className="text-xs text-gray-500">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Audits */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Accessibility Audits</h3>
          <button
            onClick={() => handleRunAudit('/jobs')}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Run New Audit
          </button>
        </div>
        <div className="space-y-3">
          {audits.map((audit: any) => (
            <div key={audit.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{audit.pageTitle || audit.pageUrl}</p>
                <p className="text-sm text-gray-500">
                  {audit.passedRules} passed / {audit.failedRules} failed / {audit.warningRules} warnings
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                  audit.score >= 90 ? 'bg-green-100 text-green-800' :
                  audit.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {audit.score}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(audit.auditDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const mainTabs = [
    { id: 'mobile' as MainTab, label: 'Mobile Apps', icon: '📱' },
    { id: 'pwa' as MainTab, label: 'PWA', icon: '🌐' },
    { id: 'accessibility' as MainTab, label: 'Accessibility', icon: '♿' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mobile & Accessibility</h1>
        <p className="text-gray-600">Manage mobile apps, PWA settings, and accessibility features</p>
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
          {activeMainTab === 'mobile' && renderMobileTab()}
          {activeMainTab === 'pwa' && renderPWATab()}
          {activeMainTab === 'accessibility' && renderAccessibilityTab()}
        </>
      )}
    </div>
  );
};

export default MobileAccessibilityHub;
