// Batch 43-45: Enterprise Administration Hub Component (13.1-13.3)
import React, { useState, useEffect } from 'react';
import {
  Tenant,
  Organization,
  CostCenter,
  Department,
  License,
  RoleTemplate,
  CustomRole,
  AccessReview,
  UserActivityLog,
  Subscription,
  Invoice,
  UsageRecord,
  Quota,
  EnterpriseContract,
  AdminDashboard,
} from '../../types';
import enterpriseAdminAPI from '../../services/batch43_45EnterpriseAdminAPI';

type TabType = 'organizations' | 'licenses' | 'billing' | 'dashboard';

const EnterpriseAdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organizations state (Batch 43)
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Licenses & Roles state (Batch 44)
  const [licenses, setLicenses] = useState<License[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [accessReviews, setAccessReviews] = useState<AccessReview[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);

  // Billing state (Batch 45)
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [contracts, setContracts] = useState<EnterpriseContract[]>([]);

  // Dashboard state
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'organizations':
          const [tenantsRes, orgsRes, costCentersRes, deptsRes] = await Promise.all([
            enterpriseAdminAPI.tenants.getTenants(),
            enterpriseAdminAPI.organizations.getOrganizations(),
            enterpriseAdminAPI.costCenters.getCostCenters(),
            enterpriseAdminAPI.departments.getDepartments(),
          ]);
          setTenants(tenantsRes.tenants || []);
          setOrganizations(orgsRes.organizations || []);
          setCostCenters(costCentersRes.costCenters || []);
          setDepartments(deptsRes.departments || []);
          break;

        case 'licenses':
          const [licensesRes, templatesRes, customRolesRes, reviewsRes, logsRes] = await Promise.all([
            enterpriseAdminAPI.licenses.getLicenses(),
            enterpriseAdminAPI.roles.getTemplates(),
            enterpriseAdminAPI.roles.getCustomRoles(),
            enterpriseAdminAPI.accessReviews.getReviews(),
            enterpriseAdminAPI.activityLogs.getLogs(),
          ]);
          setLicenses(licensesRes.licenses || []);
          setRoleTemplates(templatesRes.templates || []);
          setCustomRoles(customRolesRes.roles || []);
          setAccessReviews(reviewsRes.reviews || []);
          setActivityLogs(logsRes.logs || []);
          break;

        case 'billing':
          const [subRes, invoicesRes, usageRes, quotasRes, contractsRes] = await Promise.all([
            enterpriseAdminAPI.subscription.getSubscription(),
            enterpriseAdminAPI.invoices.getInvoices(),
            enterpriseAdminAPI.usage.getUsage(),
            enterpriseAdminAPI.usage.getQuotas(),
            enterpriseAdminAPI.contracts.getContracts(),
          ]);
          setSubscription(subRes.subscription || null);
          setInvoices(invoicesRes.invoices || []);
          setUsage(usageRes.usage || []);
          setQuotas(quotasRes.quotas || []);
          setContracts(contractsRes.contracts || []);
          break;

        case 'dashboard':
          const dashboardRes = await enterpriseAdminAPI.dashboard.getDashboard();
          setDashboard(dashboardRes.dashboard || null);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'organizations' as TabType, label: 'Organizations', icon: '🏢' },
    { id: 'licenses' as TabType, label: 'Licenses & Roles', icon: '🔑' },
    { id: 'billing' as TabType, label: 'Billing', icon: '💳' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {dashboard && (
        <>
          {/* Tenant Overview */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">{dashboard.tenant.name}</h3>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{dashboard.tenant.plan}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${dashboard.tenant.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {dashboard.tenant.status}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.users.total}</div>
              <div className="text-xs text-gray-400">{dashboard.users.active} active</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Licenses</div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.licenses.used}/{dashboard.licenses.total}</div>
              <div className="text-xs text-green-500">{dashboard.licenses.available} available</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Monthly Revenue</div>
              <div className="text-2xl font-bold text-gray-900">${dashboard.billing.mrr.toLocaleString()}</div>
              <div className="text-xs text-gray-400">{dashboard.billing.currentPlan}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">API Calls</div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.usage.apiCalls.toLocaleString()}</div>
              <div className="text-xs text-gray-400">This period</div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{dashboard.usage.jobsPosted}</div>
                <div className="text-sm text-gray-500">Jobs Posted</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{dashboard.usage.candidatesProcessed.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Candidates</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{dashboard.usage.storageUsed} GB</div>
                <div className="text-sm text-gray-500">Storage Used</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{dashboard.users.admins}</div>
                <div className="text-sm text-gray-500">Administrators</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboard.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-gray-500 ml-2">by {activity.user}</span>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderOrganizations = () => (
    <div className="space-y-6">
      {/* Tenants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tenants</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            Add Tenant
          </button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Users</th>
                  <th className="pb-3 font-medium">Region</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.domain}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">{tenant.plan}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3">{tenant.maxUsers}</td>
                    <td className="py-3">{tenant.dataRegion}</td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Organization Hierarchy */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Organization Structure</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" style={{ marginLeft: `${org.level * 24}px` }}>
                <span className="text-lg">{org.type === 'company' ? '🏢' : org.type === 'department' ? '📁' : '👥'}</span>
                <div className="flex-1">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-gray-500">{org.type}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {org.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments & Cost Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Departments</h3>
          </div>
          <div className="p-4 space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-sm text-gray-500">Code: {dept.code}</div>
                </div>
                {dept.headName && (
                  <span className="text-sm text-gray-500">Head: {dept.headName}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Cost Centers</h3>
          </div>
          <div className="p-4 space-y-2">
            {costCenters.map((cc) => (
              <div key={cc.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{cc.name}</div>
                    <div className="text-sm text-gray-500">Code: {cc.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${cc.currentSpend.toLocaleString()} / ${cc.annualBudget.toLocaleString()}</div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(cc.currentSpend / cc.annualBudget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLicenses = () => (
    <div className="space-y-6">
      {/* Licenses */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">License Management</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            Add License
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map((license) => (
              <div key={license.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{license.name}</div>
                    <div className="text-sm text-gray-500">{license.licenseType} license</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${license.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {license.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seats Used</span>
                    <span className="font-medium">{license.usedSeats} / {license.totalSeats}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${license.usedSeats / license.totalSeats > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${(license.usedSeats / license.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {license.availableSeats} seats available
                    {license.pricePerSeat && ` - $${license.pricePerSeat}/seat`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Templates */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Role Templates</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleTemplates.map((role) => (
              <div key={role.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{role.category === 'admin' ? '🔐' : role.category === 'recruiter' ? '👤' : '👁️'}</span>
                  <div className="font-medium">{role.name}</div>
                  {role.isSystem && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">System</span>}
                </div>
                <div className="text-sm text-gray-500 mb-2">Data Access: {role.dataAccess}</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((perm, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{perm}</span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded">+{role.permissions.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Roles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Custom Roles</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            Create Role
          </button>
        </div>
        <div className="p-4">
          {customRoles.length > 0 ? (
            <div className="space-y-3">
              {customRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.userCount} users assigned</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{role.permissions.length} permissions</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No custom roles created yet</div>
          )}
        </div>
      </div>

      {/* Access Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Access Reviews</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            Start Review
          </button>
        </div>
        <div className="p-4">
          {accessReviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium">{review.name}</div>
                  <div className="text-sm text-gray-500">{review.reviewType} review</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  review.status === 'completed' ? 'bg-green-100 text-green-700' :
                  review.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {review.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{review.reviewedItems} / {review.totalItems} reviewed</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(review.reviewedItems / review.totalItems) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  Due: {new Date(review.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-gray-500">{log.resourceType} - {log.resourceName || log.resourceId}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      {/* Subscription */}
      {subscription && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Current Subscription</h3>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Upgrade Plan
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-2xl font-bold">{subscription.planName}</div>
                <div className="text-gray-500">{subscription.billingCycle} billing</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">${subscription.amount.toLocaleString()}</div>
                <div className="text-gray-500">per {subscription.billingCycle === 'monthly' ? 'month' : 'year'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {subscription.status}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Current Period</div>
                <div className="font-medium">{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Next Invoice</div>
                <div className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Currency</div>
                <div className="font-medium">{subscription.currency}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage & Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Current Usage</h3>
          </div>
          <div className="p-4 space-y-4">
            {usage.map((record, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{record.metricName.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-500">{record.unit}</div>
                </div>
                <div className="text-lg font-bold">{record.metricValue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Quotas</h3>
          </div>
          <div className="p-4 space-y-4">
            {quotas.map((quota, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium capitalize">{quota.quotaType.replace(/_/g, ' ')}</span>
                  <span className="text-sm">{quota.currentUsage.toLocaleString()} / {quota.quotaLimit.toLocaleString()} {quota.unit}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${(quota.currentUsage / quota.quotaLimit) > 0.9 ? 'bg-red-500' : (quota.currentUsage / quota.quotaLimit) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((quota.currentUsage / quota.quotaLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Invoices</h3>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="py-3">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="py-3">${invoice.total.toLocaleString()} {invoice.currency}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {invoice.pdfUrl && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Contracts */}
      {contracts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Enterprise Contracts</h3>
          </div>
          <div className="p-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-sm text-gray-500">{contract.contractNumber}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {contract.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Value</div>
                    <div className="font-medium">${contract.contractValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Start Date</div>
                    <div className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">End Date</div>
                    <div className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Administration</h1>
          <p className="text-gray-500">Manage tenants, licenses, roles, and billing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'organizations' && renderOrganizations()}
            {activeTab === 'licenses' && renderLicenses()}
            {activeTab === 'billing' && renderBilling()}
          </>
        )}
      </div>
    </div>
  );
};

export default EnterpriseAdminHub;
