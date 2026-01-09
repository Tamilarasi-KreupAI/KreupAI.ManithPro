import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getB2BSettings, updateB2BSettings, B2BSettingsData } from '../../services/b2b.service';
import { authAPI } from '../../services/api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'VENDOR';
  const isClient = user?.role === 'CLIENT';

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [settings, setSettings] = useState<B2BSettingsData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    emailNotifications: true,
    newSubmissionsNotify: true,
    contractUpdatesNotify: true,
    invoiceRemindersNotify: true,
    weeklyDigestNotify: false,
    defaultPaymentTerms: 'NET_30',
    preferredContractDuration: '6_MONTHS',
    autoApproveSubmissions: false,
    requireNDA: true,
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    minimumRate: '',
    serviceAreas: [],
    specializations: [],
    availableForNewProjects: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getB2BSettings();
      setSettings({
        ...settings,
        ...data,
        serviceAreas: data.serviceAreas || [],
        specializations: data.specializations || [],
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateB2BSettings(settings);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to save settings');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to change password');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceArea = (area: string) => {
    const areas = settings.serviceAreas || [];
    const newAreas = areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area];
    setSettings({ ...settings, serviceAreas: newAreas });
  };

  const tabs = [
    {
      id: 'profile',
      name: 'Company Profile',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
    {
      id: 'security',
      name: 'Security',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    ...(isClient
      ? [
          {
            id: 'billing',
            name: 'Billing & Contracts',
            icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
          },
        ]
      : []),
    ...(isVendor
      ? [
          {
            id: 'payment',
            name: 'Payment & Services',
            icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your {isVendor ? 'vendor' : 'client'} account settings
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-52 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 ">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Company Profile
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Information visible to {isVendor ? 'clients' : 'vendors'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={settings.companyName || ''}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={settings.contactPerson || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, contactPerson: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={settings.website || ''}
                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={settings.address || ''}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={settings.description || ''}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      How you want to be notified
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'emailNotifications',
                        label: 'Email Notifications',
                        desc: 'Receive notifications via email',
                      },
                      {
                        key: 'newSubmissionsNotify',
                        label: isVendor ? 'New Requirements' : 'New Submissions',
                        desc: isVendor
                          ? 'Get notified about new requirements'
                          : 'Get notified about candidate submissions',
                      },
                      {
                        key: 'contractUpdatesNotify',
                        label: 'Contract Updates',
                        desc: 'Notifications for contract changes',
                      },
                      {
                        key: 'invoiceRemindersNotify',
                        label: 'Invoice Reminders',
                        desc: 'Reminders for pending invoices',
                      },
                      {
                        key: 'weeklyDigestNotify',
                        label: 'Weekly Digest',
                        desc: 'Weekly activity summary',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[item.key as keyof B2BSettingsData] as boolean}
                            onChange={(e) =>
                              setSettings({ ...settings, [item.key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Security
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage password and security
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Change Password
                    </h3>
                    <div className="space-y-3 max-w-sm">
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        placeholder="Current password"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        placeholder="New password"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={handlePasswordChange}
                        disabled={
                          saving || !passwordForm.currentPassword || !passwordForm.newPassword
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-medium text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                      Once deleted, there is no going back.
                    </p>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && isClient && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Billing & Contracts
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Default billing settings
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Terms
                      </label>
                      <select
                        value={settings.defaultPaymentTerms || 'NET_30'}
                        onChange={(e) =>
                          setSettings({ ...settings, defaultPaymentTerms: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="NET_15">Net 15</option>
                        <option value="NET_30">Net 30</option>
                        <option value="NET_45">Net 45</option>
                        <option value="NET_60">Net 60</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contract Duration
                      </label>
                      <select
                        value={settings.preferredContractDuration || '6_MONTHS'}
                        onChange={(e) =>
                          setSettings({ ...settings, preferredContractDuration: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="3_MONTHS">3 Months</option>
                        <option value="6_MONTHS">6 Months</option>
                        <option value="12_MONTHS">12 Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'autoApproveSubmissions',
                        label: 'Auto-approve Submissions',
                        desc: 'Auto-approve from trusted vendors',
                      },
                      {
                        key: 'requireNDA',
                        label: 'Require NDA',
                        desc: 'Require vendors to sign NDA',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[item.key as keyof B2BSettingsData] as boolean}
                            onChange={(e) =>
                              setSettings({ ...settings, [item.key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && isVendor && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Payment & Services
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Payment info and service offerings
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={settings.bankName || ''}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        placeholder="Bank name"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        value={settings.accountNumber || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, accountNumber: e.target.value })
                        }
                        placeholder="Account number"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        value={settings.routingNumber || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, routingNumber: e.target.value })
                        }
                        placeholder="Routing number"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        value={settings.minimumRate || ''}
                        onChange={(e) => setSettings({ ...settings, minimumRate: e.target.value })}
                        placeholder="Minimum hourly rate"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Service Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Software Development',
                        'Data Science',
                        'DevOps',
                        'Cloud Architecture',
                        'Mobile Development',
                        'UI/UX Design',
                      ].map((area) => (
                        <button
                          key={area}
                          onClick={() => toggleServiceArea(area)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            (settings.serviceAreas || []).includes(area)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Available for New Projects
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Show availability to clients
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.availableForNewProjects}
                        onChange={(e) =>
                          setSettings({ ...settings, availableForNewProjects: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
