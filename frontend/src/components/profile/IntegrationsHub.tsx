import React, { useState, useEffect } from 'react';
import { integrationsAPI } from '../../services/integrationsAPI';
import type {
  GithubProfile,
  GithubRepository,
  LinkedInProfile,
  IntegrationStatusResponse,
} from '../../types';

const IntegrationsHub: React.FC = () => {
  const [status, setStatus] = useState<IntegrationStatusResponse | null>(null);
  const [githubProfile, setGithubProfile] = useState<GithubProfile | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepository[]>([]);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'github' | 'linkedin'>('github');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importOptions, setImportOptions] = useState({
    importWorkHistory: true,
    importEducation: true,
    importSkills: true,
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const statusData = await integrationsAPI.getStatus();
      setStatus(statusData);

      if (statusData.github.connected) {
        const [profile, repos] = await Promise.all([
          integrationsAPI.github.getProfile(),
          integrationsAPI.github.getRepositories(),
        ]);
        setGithubProfile(profile);
        setGithubRepos(repos.repositories);
      }

      if (statusData.linkedin.connected) {
        const profile = await integrationsAPI.linkedin.getProfile();
        setLinkedInProfile(profile);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGithub = async () => {
    try {
      // For demo purposes, simulate the OAuth flow
      const mockCode = 'mock_auth_code';
      const mockState = btoa(JSON.stringify({ userId: 'current-user' }));
      await integrationsAPI.github.callback(mockCode, mockState);
      loadIntegrations();
    } catch (error) {
      console.error('Error connecting GitHub:', error);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      // For demo purposes, simulate the OAuth flow
      const mockCode = 'mock_auth_code';
      const mockState = btoa(JSON.stringify({ userId: 'current-user' }));
      await integrationsAPI.linkedin.callback(mockCode, mockState);
      loadIntegrations();
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
    }
  };

  const handleSync = async (platform: 'github' | 'linkedin') => {
    try {
      setSyncing(platform);
      if (platform === 'github') {
        await integrationsAPI.github.sync();
      } else {
        await integrationsAPI.linkedin.sync();
      }
      loadIntegrations();
    } catch (error) {
      console.error(`Error syncing ${platform}:`, error);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (platform: 'github' | 'linkedin') => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      if (platform === 'github') {
        await integrationsAPI.github.disconnect();
        setGithubProfile(null);
        setGithubRepos([]);
      } else {
        await integrationsAPI.linkedin.disconnect();
        setLinkedInProfile(null);
      }
      loadIntegrations();
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
    }
  };

  const handleToggleShowcase = async (repoId: string) => {
    try {
      await integrationsAPI.github.toggleShowcase(repoId);
      const repos = await integrationsAPI.github.getRepositories();
      setGithubRepos(repos.repositories);
    } catch (error) {
      console.error('Error toggling showcase:', error);
    }
  };

  const handleImportLinkedIn = async () => {
    try {
      await integrationsAPI.linkedin.importData(importOptions);
      setShowImportModal(false);
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Platform Integrations</h2>
        <p className="text-sm text-gray-500">Connect your accounts to import data and verify your profile</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Card */}
        <div className={`rounded-xl border-2 p-6 ${status?.github.connected ? 'border-gray-800 bg-gray-50' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">GitHub</h3>
                <p className="text-sm text-gray-500">Import repositories & contributions</p>
              </div>
            </div>
            {status?.github.connected ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                Not connected
              </span>
            )}
          </div>

          {status?.github.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <img
                  src={githubProfile?.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                  alt={githubProfile?.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">@{githubProfile?.username}</p>
                  <p className="text-xs text-gray-500">Last synced: {formatDate(githubProfile?.lastSyncAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{githubProfile?.publicRepos || 0}</p>
                  <p className="text-xs text-gray-500">Repos</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{githubProfile?.totalStars || 0}</p>
                  <p className="text-xs text-gray-500">Stars</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{githubProfile?.followers || 0}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSync('github')}
                  disabled={syncing === 'github'}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {syncing === 'github' ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={() => handleDisconnect('github')}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnectGithub}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Connect GitHub
            </button>
          )}
        </div>

        {/* LinkedIn Card */}
        <div className={`rounded-xl border-2 p-6 ${status?.linkedin.connected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                <p className="text-sm text-gray-500">Import work history & skills</p>
              </div>
            </div>
            {status?.linkedin.connected ? (
              <div className="flex items-center gap-2">
                {status.linkedin.isVerified && (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  Connected
                </span>
              </div>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                Not connected
              </span>
            )}
          </div>

          {status?.linkedin.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <img
                  src={linkedInProfile?.profilePicture || 'https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q'}
                  alt={linkedInProfile?.firstName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {linkedInProfile?.firstName} {linkedInProfile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{linkedInProfile?.headline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{linkedInProfile?.connections || 0}+</p>
                  <p className="text-xs text-gray-500">Connections</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{linkedInProfile?.skills?.length || 0}</p>
                  <p className="text-xs text-gray-500">Skills</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Import Data
                </button>
                <button
                  onClick={() => handleSync('linkedin')}
                  disabled={syncing === 'linkedin'}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {syncing === 'linkedin' ? '...' : 'Sync'}
                </button>
                <button
                  onClick={() => handleDisconnect('linkedin')}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnectLinkedIn}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Connect LinkedIn
            </button>
          )}
        </div>
      </div>

      {/* GitHub Repositories */}
      {status?.github.connected && githubRepos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Your Repositories</h3>
            <span className="text-sm text-gray-500">{githubRepos.length} repos</span>
          </div>
          <div className="divide-y divide-gray-100">
            {githubRepos.slice(0, 6).map(repo => (
              <div key={repo.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {repo.name}
                      </a>
                      {repo.isShowcased && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Showcased
                        </span>
                      )}
                      {repo.isPrivate && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {repo.language && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleShowcase(repo.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      repo.isShowcased
                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                    title={repo.isShowcased ? 'Remove from showcase' : 'Add to showcase'}
                  >
                    <svg className="w-5 h-5" fill={repo.isShowcased ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LinkedIn Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import LinkedIn Data</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select which data you want to import from your LinkedIn profile.
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importWorkHistory}
                  onChange={(e) => setImportOptions({ ...importOptions, importWorkHistory: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">Work History</p>
                  <p className="text-xs text-gray-500">{linkedInProfile?.positions?.length || 0} positions</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importEducation}
                  onChange={(e) => setImportOptions({ ...importOptions, importEducation: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">Education</p>
                  <p className="text-xs text-gray-500">{linkedInProfile?.education?.length || 0} entries</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importSkills}
                  onChange={(e) => setImportOptions({ ...importOptions, importSkills: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">Skills</p>
                  <p className="text-xs text-gray-500">{linkedInProfile?.skills?.length || 0} skills with endorsements</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportLinkedIn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Import Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsHub;
