import React, { useState, useEffect } from 'react';
import { batch4IntegrationsAPI } from '../../services/batch4IntegrationsAPI';
import type {
  KaggleProfile,
  CodingPlatformProfile,
  CodingPlatformType,
  OnlineCourseProfile,
  OnlineCoursePlatform,
  AcademicProfile,
  AcademicPlatform,
  CustomPortfolioLink,
  Batch4IntegrationsStatus,
  PortfolioLinkType,
} from '../../types';

type IntegrationTab = 'kaggle' | 'coding' | 'courses' | 'academic' | 'portfolio';

const Batch4IntegrationsHub: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<IntegrationTab>('kaggle');
  const [status, setStatus] = useState<Batch4IntegrationsStatus | null>(null);

  // Integration data
  const [kaggleProfile, setKaggleProfile] = useState<KaggleProfile | null>(null);
  const [codingPlatforms, setCodingPlatforms] = useState<CodingPlatformProfile[]>([]);
  const [courseProfiles, setCourseProfiles] = useState<OnlineCourseProfile[]>([]);
  const [academicProfiles, setAcademicProfiles] = useState<AcademicProfile[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<CustomPortfolioLink[]>([]);

  // Modal states
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState('');
  const [connectUrl, setConnectUrl] = useState('');
  const [connecting, setConnecting] = useState(false);

  // Portfolio link form
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    linkType: 'portfolio' as PortfolioLinkType,
    tags: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadAllIntegrations();
  }, []);

  const loadAllIntegrations = async () => {
    try {
      setLoading(true);
      const [statusData, kaggle, coding, courses, academic, links] = await Promise.all([
        batch4IntegrationsAPI.getStatus(),
        batch4IntegrationsAPI.getKaggleProfile().catch(() => null),
        batch4IntegrationsAPI.getCodingPlatforms().catch(() => ({ platforms: [] })),
        batch4IntegrationsAPI.getOnlineCourseProfiles().catch(() => ({ profiles: [] })),
        batch4IntegrationsAPI.getAcademicProfiles().catch(() => ({ profiles: [] })),
        batch4IntegrationsAPI.getPortfolioLinks().catch(() => ({ links: [] })),
      ]);

      setStatus(statusData);
      setKaggleProfile(kaggle);
      setCodingPlatforms(coding.platforms);
      setCourseProfiles(courses.profiles);
      setAcademicProfiles(academic.profiles);
      setPortfolioLinks(links.links);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      setConnecting(true);

      switch (platform) {
        case 'kaggle':
          await batch4IntegrationsAPI.connectKaggle(connectUsername);
          break;
        case 'leetcode':
        case 'hackerrank':
        case 'codeforces':
        case 'codechef':
          await batch4IntegrationsAPI.connectCodingPlatform(platform as CodingPlatformType, connectUsername);
          break;
        case 'coursera':
        case 'udemy':
        case 'edx':
        case 'pluralsight':
          await batch4IntegrationsAPI.connectOnlineCourses(platform as OnlineCoursePlatform, connectUsername);
          break;
        case 'google_scholar':
        case 'researchgate':
        case 'orcid':
          await batch4IntegrationsAPI.connectAcademicProfile(platform as AcademicPlatform, connectUrl, connectUsername);
          break;
      }

      setShowConnectModal(null);
      setConnectUsername('');
      setConnectUrl('');
      loadAllIntegrations();
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (type: string, platform?: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform || type}?`)) return;

    try {
      switch (type) {
        case 'kaggle':
          await batch4IntegrationsAPI.disconnectKaggle();
          setKaggleProfile(null);
          break;
        case 'coding':
          if (platform) {
            await batch4IntegrationsAPI.disconnectCodingPlatform(platform as CodingPlatformType);
          }
          break;
        case 'courses':
          if (platform) {
            await batch4IntegrationsAPI.disconnectOnlineCourses(platform as OnlineCoursePlatform);
          }
          break;
        case 'academic':
          if (platform) {
            await batch4IntegrationsAPI.disconnectAcademicProfile(platform as AcademicPlatform);
          }
          break;
      }
      loadAllIntegrations();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleAddPortfolioLink = async () => {
    try {
      await batch4IntegrationsAPI.addPortfolioLink({
        ...newLink,
        tags: newLink.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowAddLinkModal(false);
      setNewLink({ title: '', url: '', description: '', linkType: 'portfolio', tags: '', isFeatured: false });
      loadAllIntegrations();
    } catch (error) {
      console.error('Error adding portfolio link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Delete this portfolio link?')) return;
    try {
      await batch4IntegrationsAPI.deletePortfolioLink(linkId);
      loadAllIntegrations();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'kaggle', label: 'Kaggle', icon: 'K', color: 'cyan' },
    { id: 'coding', label: 'Coding', icon: 'LC', color: 'yellow' },
    { id: 'courses', label: 'Courses', icon: 'C', color: 'blue' },
    { id: 'academic', label: 'Academic', icon: 'A', color: 'purple' },
    { id: 'portfolio', label: 'Portfolio Links', icon: 'P', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Developer & Academic Integrations</h2>
        <p className="text-sm text-gray-500">Connect coding platforms, courses, and academic profiles</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as IntegrationTab)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kaggle Tab */}
      {activeTab === 'kaggle' && (
        <div className={`rounded-xl border-2 p-6 ${kaggleProfile ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Kaggle</h3>
                <p className="text-sm text-gray-500">Data science competitions & notebooks</p>
              </div>
            </div>
            {kaggleProfile && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                Connected
              </span>
            )}
          </div>

          {kaggleProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <img
                  src={kaggleProfile.avatarUrl || 'https://www.kaggle.com/static/images/user-avatar.png'}
                  alt={kaggleProfile.username}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{kaggleProfile.displayName}</p>
                  <p className="text-xs text-gray-500">@{kaggleProfile.username} | {kaggleProfile.tier}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{kaggleProfile.competitionCount}</p>
                  <p className="text-xs text-gray-500">Competitions</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{kaggleProfile.notebookCount}</p>
                  <p className="text-xs text-gray-500">Notebooks</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{kaggleProfile.datasetCount}</p>
                  <p className="text-xs text-gray-500">Datasets</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{kaggleProfile.totalMedals}</p>
                  <p className="text-xs text-gray-500">Medals</p>
                </div>
              </div>

              {/* Medals */}
              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Medals:</span>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
                  <span className="text-sm font-medium">{kaggleProfile.goldMedals}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
                  <span className="text-sm font-medium">{kaggleProfile.silverMedals}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-amber-600 rounded-full"></span>
                  <span className="text-sm font-medium">{kaggleProfile.bronzeMedals}</span>
                </div>
              </div>

              <button
                onClick={() => handleDisconnect('kaggle')}
                className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal('kaggle')}
              className="w-full py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
            >
              Connect Kaggle
            </button>
          )}
        </div>
      )}

      {/* Coding Platforms Tab */}
      {activeTab === 'coding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LeetCode */}
          <CodingPlatformCard
            platform="leetcode"
            label="LeetCode"
            color="yellow"
            data={codingPlatforms.find(p => p.platform === 'leetcode')}
            onConnect={() => setShowConnectModal('leetcode')}
            onDisconnect={() => handleDisconnect('coding', 'leetcode')}
            formatNumber={formatNumber}
          />

          {/* HackerRank */}
          <CodingPlatformCard
            platform="hackerrank"
            label="HackerRank"
            color="green"
            data={codingPlatforms.find(p => p.platform === 'hackerrank')}
            onConnect={() => setShowConnectModal('hackerrank')}
            onDisconnect={() => handleDisconnect('coding', 'hackerrank')}
            formatNumber={formatNumber}
          />

          {/* Codeforces */}
          <CodingPlatformCard
            platform="codeforces"
            label="Codeforces"
            color="blue"
            data={codingPlatforms.find(p => p.platform === 'codeforces')}
            onConnect={() => setShowConnectModal('codeforces')}
            onDisconnect={() => handleDisconnect('coding', 'codeforces')}
            formatNumber={formatNumber}
          />

          {/* CodeChef */}
          <CodingPlatformCard
            platform="codechef"
            label="CodeChef"
            color="amber"
            data={codingPlatforms.find(p => p.platform === 'codechef')}
            onConnect={() => setShowConnectModal('codechef')}
            onDisconnect={() => handleDisconnect('coding', 'codechef')}
            formatNumber={formatNumber}
          />
        </div>
      )}

      {/* Online Courses Tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoursesPlatformCard
            platform="coursera"
            label="Coursera"
            color="blue"
            data={courseProfiles.find(p => p.platform === 'coursera')}
            onConnect={() => setShowConnectModal('coursera')}
            onDisconnect={() => handleDisconnect('courses', 'coursera')}
          />

          <CoursesPlatformCard
            platform="udemy"
            label="Udemy"
            color="purple"
            data={courseProfiles.find(p => p.platform === 'udemy')}
            onConnect={() => setShowConnectModal('udemy')}
            onDisconnect={() => handleDisconnect('courses', 'udemy')}
          />

          <CoursesPlatformCard
            platform="edx"
            label="edX"
            color="red"
            data={courseProfiles.find(p => p.platform === 'edx')}
            onConnect={() => setShowConnectModal('edx')}
            onDisconnect={() => handleDisconnect('courses', 'edx')}
          />

          <CoursesPlatformCard
            platform="pluralsight"
            label="Pluralsight"
            color="pink"
            data={courseProfiles.find(p => p.platform === 'pluralsight')}
            onConnect={() => setShowConnectModal('pluralsight')}
            onDisconnect={() => handleDisconnect('courses', 'pluralsight')}
          />
        </div>
      )}

      {/* Academic Tab */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AcademicPlatformCard
            platform="google_scholar"
            label="Google Scholar"
            color="blue"
            data={academicProfiles.find(p => p.platform === 'google_scholar')}
            onConnect={() => setShowConnectModal('google_scholar')}
            onDisconnect={() => handleDisconnect('academic', 'google_scholar')}
            formatNumber={formatNumber}
          />

          <AcademicPlatformCard
            platform="researchgate"
            label="ResearchGate"
            color="teal"
            data={academicProfiles.find(p => p.platform === 'researchgate')}
            onConnect={() => setShowConnectModal('researchgate')}
            onDisconnect={() => handleDisconnect('academic', 'researchgate')}
            formatNumber={formatNumber}
          />

          <AcademicPlatformCard
            platform="orcid"
            label="ORCID"
            color="green"
            data={academicProfiles.find(p => p.platform === 'orcid')}
            onConnect={() => setShowConnectModal('orcid')}
            onDisconnect={() => handleDisconnect('academic', 'orcid')}
            formatNumber={formatNumber}
          />
        </div>
      )}

      {/* Portfolio Links Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Custom Portfolio Links</h3>
              <p className="text-sm text-gray-500">Add links to your work anywhere on the web</p>
            </div>
            <button
              onClick={() => setShowAddLinkModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Link
            </button>
          </div>

          {portfolioLinks.length > 0 ? (
            <div className="space-y-4">
              {portfolioLinks.map((link) => (
                <div
                  key={link.id}
                  className={`p-4 rounded-lg border-2 ${link.isFeatured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {link.favicon && (
                        <img src={link.favicon} alt="" className="w-8 h-8 rounded" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {link.title}
                          </a>
                          {link.isFeatured && (
                            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {link.platform && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {link.platform}
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                        )}
                        {link.tags && link.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {link.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No portfolio links added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add links to your personal website, demos, or other work</p>
            </div>
          )}
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect {showConnectModal.charAt(0).toUpperCase() + showConnectModal.slice(1).replace('_', ' ')}
            </h3>

            {['google_scholar', 'researchgate', 'orcid'].includes(showConnectModal) ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Enter your profile URL and display name.</p>
                <input
                  type="text"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  placeholder="Display name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <input
                  type="url"
                  value={connectUrl}
                  onChange={(e) => setConnectUrl(e.target.value)}
                  placeholder="Profile URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Enter your username to connect.</p>
                <input
                  type="text"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(null);
                  setConnectUsername('');
                  setConnectUrl('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnect(showConnectModal)}
                disabled={connecting || !connectUsername}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Portfolio Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Portfolio Link</h3>

            <div className="space-y-4">
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newLink.linkType}
                onChange={(e) => setNewLink({ ...newLink, linkType: e.target.value as PortfolioLinkType })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="portfolio">Portfolio</option>
                <option value="project">Project</option>
                <option value="blog">Blog</option>
                <option value="video">Video</option>
                <option value="social">Social</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={newLink.tags}
                onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                placeholder="Tags (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newLink.isFeatured}
                  onChange={(e) => setNewLink({ ...newLink, isFeatured: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Feature this link</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPortfolioLink}
                disabled={!newLink.title || !newLink.url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
interface CodingPlatformCardProps {
  platform: string;
  label: string;
  color: string;
  data?: CodingPlatformProfile;
  onConnect: () => void;
  onDisconnect: () => void;
  formatNumber: (num: number) => string;
}

const CodingPlatformCard: React.FC<CodingPlatformCardProps> = ({
  platform,
  label,
  color,
  data,
  onConnect,
  onDisconnect,
  formatNumber,
}) => {
  const bgColors: Record<string, string> = {
    yellow: 'bg-yellow-500',
    green: 'bg-green-600',
    blue: 'bg-blue-500',
    amber: 'bg-amber-600',
  };

  const borderColors: Record<string, string> = {
    yellow: 'border-yellow-500 bg-yellow-50',
    green: 'border-green-600 bg-green-50',
    blue: 'border-blue-500 bg-blue-50',
    amber: 'border-amber-600 bg-amber-50',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${data ? borderColors[color] : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{label.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">Coding challenges</p>
          </div>
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-gray-900">@{data.username}</p>
              {data.rating && <p className="text-xs text-gray-500">Rating: {data.rating}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.totalSolved}</p>
              <p className="text-xs text-gray-500">Solved</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.contestsAttended}</p>
              <p className="text-xs text-gray-500">Contests</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.currentStreak}</p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className={`w-full py-3 ${bgColors[color]} text-white rounded-lg font-medium hover:opacity-90 transition-colors`}
        >
          Connect {label}
        </button>
      )}
    </div>
  );
};

interface CoursesPlatformCardProps {
  platform: string;
  label: string;
  color: string;
  data?: OnlineCourseProfile;
  onConnect: () => void;
  onDisconnect: () => void;
}

const CoursesPlatformCard: React.FC<CoursesPlatformCardProps> = ({
  platform,
  label,
  color,
  data,
  onConnect,
  onDisconnect,
}) => {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    pink: 'bg-pink-600',
  };

  const borderColors: Record<string, string> = {
    blue: 'border-blue-600 bg-blue-50',
    purple: 'border-purple-600 bg-purple-50',
    red: 'border-red-600 bg-red-50',
    pink: 'border-pink-600 bg-pink-50',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${data ? borderColors[color] : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{label.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">Online courses</p>
          </div>
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.completedCourses}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.certificationsEarned}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </div>

          {data.totalHours && (
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-lg font-bold text-gray-900">{data.totalHours}h</p>
              <p className="text-xs text-gray-500">Learning Hours</p>
            </div>
          )}

          <button
            onClick={onDisconnect}
            className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className={`w-full py-3 ${bgColors[color]} text-white rounded-lg font-medium hover:opacity-90 transition-colors`}
        >
          Connect {label}
        </button>
      )}
    </div>
  );
};

interface AcademicPlatformCardProps {
  platform: string;
  label: string;
  color: string;
  data?: AcademicProfile;
  onConnect: () => void;
  onDisconnect: () => void;
  formatNumber: (num: number) => string;
}

const AcademicPlatformCard: React.FC<AcademicPlatformCardProps> = ({
  platform,
  label,
  color,
  data,
  onConnect,
  onDisconnect,
  formatNumber,
}) => {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-600',
    teal: 'bg-teal-600',
    green: 'bg-green-600',
  };

  const borderColors: Record<string, string> = {
    blue: 'border-blue-600 bg-blue-50',
    teal: 'border-teal-600 bg-teal-50',
    green: 'border-green-600 bg-green-50',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${data ? borderColors[color] : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{label.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">Research & publications</p>
          </div>
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{data.displayName}</p>
              {data.affiliation && <p className="text-xs text-gray-500">{data.affiliation}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.totalPublications}</p>
              <p className="text-xs text-gray-500">Papers</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{formatNumber(data.totalCitations)}</p>
              <p className="text-xs text-gray-500">Citations</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{data.hIndex || '-'}</p>
              <p className="text-xs text-gray-500">h-index</p>
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className={`w-full py-3 ${bgColors[color]} text-white rounded-lg font-medium hover:opacity-90 transition-colors`}
        >
          Connect {label}
        </button>
      )}
    </div>
  );
};

export default Batch4IntegrationsHub;
