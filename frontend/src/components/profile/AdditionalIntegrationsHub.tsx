import React, { useState, useEffect } from 'react';
import { additionalIntegrationsAPI } from '../../services/additionalIntegrationsAPI';
import type {
  StackOverflowProfile,
  NotionPortfolio,
  GitLabProfile,
  DesignPortfolio,
  BlogPlatform,
  AllIntegrationsStatusResponse,
  DesignPlatformType,
  BlogPlatformType,
} from '../../types';

type IntegrationTab = 'stackoverflow' | 'notion' | 'gitlab' | 'design' | 'blog';

const AdditionalIntegrationsHub: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<IntegrationTab>('stackoverflow');
  const [status, setStatus] = useState<AllIntegrationsStatusResponse | null>(null);

  // Integration data
  const [stackOverflowProfile, setStackOverflowProfile] = useState<StackOverflowProfile | null>(null);
  const [notionPortfolio, setNotionPortfolio] = useState<NotionPortfolio | null>(null);
  const [gitLabProfile, setGitLabProfile] = useState<GitLabProfile | null>(null);
  const [designPortfolios, setDesignPortfolios] = useState<DesignPortfolio[]>([]);
  const [blogPlatforms, setBlogPlatforms] = useState<BlogPlatform[]>([]);

  // Modal states
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadAllIntegrations();
  }, []);

  const loadAllIntegrations = async () => {
    try {
      setLoading(true);
      const [statusData, soProfile, notion, gitlab, design, blogs] = await Promise.all([
        additionalIntegrationsAPI.getAllIntegrationsStatus(),
        additionalIntegrationsAPI.getStackOverflowProfile().catch(() => null),
        additionalIntegrationsAPI.getNotionPortfolio().catch(() => null),
        additionalIntegrationsAPI.getGitLabProfile().catch(() => null),
        additionalIntegrationsAPI.getDesignPortfolios().catch(() => ({ portfolios: [] })),
        additionalIntegrationsAPI.getBlogPlatforms().catch(() => ({ platforms: [] })),
      ]);

      setStatus(statusData);
      setStackOverflowProfile(soProfile);
      setNotionPortfolio(notion);
      setGitLabProfile(gitlab);
      setDesignPortfolios(design.portfolios);
      setBlogPlatforms(blogs.platforms);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string, username?: string) => {
    try {
      setConnecting(true);

      switch (platform) {
        case 'stackoverflow':
          await additionalIntegrationsAPI.connectStackOverflow(username || connectUsername);
          break;
        case 'notion':
          await additionalIntegrationsAPI.connectNotion('mock_code');
          break;
        case 'gitlab':
          await additionalIntegrationsAPI.connectGitLab('mock_code');
          break;
        case 'behance':
        case 'dribbble':
          await additionalIntegrationsAPI.connectDesignPlatform(platform as DesignPlatformType, username || connectUsername);
          break;
        case 'medium':
        case 'devto':
        case 'hashnode':
          await additionalIntegrationsAPI.connectBlogPlatform(platform as BlogPlatformType, username || connectUsername);
          break;
      }

      setShowConnectModal(null);
      setConnectUsername('');
      loadAllIntegrations();
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      switch (platform) {
        case 'stackoverflow':
          await additionalIntegrationsAPI.disconnectStackOverflow();
          setStackOverflowProfile(null);
          break;
        case 'notion':
          await additionalIntegrationsAPI.disconnectNotion();
          setNotionPortfolio(null);
          break;
        case 'gitlab':
          await additionalIntegrationsAPI.disconnectGitLab();
          setGitLabProfile(null);
          break;
        case 'behance':
        case 'dribbble':
          await additionalIntegrationsAPI.disconnectDesignPlatform(platform as DesignPlatformType);
          break;
        case 'medium':
        case 'devto':
        case 'hashnode':
          await additionalIntegrationsAPI.disconnectBlogPlatform(platform as BlogPlatformType);
          break;
      }
      loadAllIntegrations();
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'stackoverflow', label: 'Stack Overflow', icon: 'SO', color: 'orange' },
    { id: 'notion', label: 'Notion', icon: 'N', color: 'gray' },
    { id: 'gitlab', label: 'GitLab', icon: 'GL', color: 'orange' },
    { id: 'design', label: 'Design', icon: 'D', color: 'pink' },
    { id: 'blog', label: 'Blog', icon: 'B', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Additional Integrations</h2>
        <p className="text-sm text-gray-500">Connect more platforms to showcase your work</p>
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

      {/* Stack Overflow Tab */}
      {activeTab === 'stackoverflow' && (
        <div className="space-y-6">
          <div className={`rounded-xl border-2 p-6 ${status?.stackoverflow?.connected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 21h-10v-2h10v2zm6-11.665l-1.621-9.335-1.993.346 1.62 9.335 1.994-.346zm-5.964 6.937l-9.746-.975-.186 2.016 9.755.879.177-1.92zm.538-2.587l-9.276-2.608-.526 1.954 9.306 2.5.496-1.846zm1.204-2.413l-8.297-4.864-1.029 1.743 8.298 4.865 1.028-1.744zm1.866-1.467l-5.339-7.829-1.672 1.14 5.339 7.829 1.672-1.14zm-2.644 4.195v8h-12v-8h-2v10h16v-10h-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Stack Overflow</h3>
                  <p className="text-sm text-gray-500">Showcase your Q&A contributions</p>
                </div>
              </div>
              {status?.stackoverflow?.connected ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                  Not connected
                </span>
              )}
            </div>

            {stackOverflowProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <img
                    src={stackOverflowProfile.avatarUrl || 'https://www.gravatar.com/avatar/placeholder'}
                    alt={stackOverflowProfile.displayName}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{stackOverflowProfile.displayName}</p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(stackOverflowProfile.reputation)} reputation
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{formatNumber(stackOverflowProfile.reputation)}</p>
                    <p className="text-xs text-gray-500">Reputation</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{stackOverflowProfile.answerCount}</p>
                    <p className="text-xs text-gray-500">Answers</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{stackOverflowProfile.acceptedAnswerCount}</p>
                    <p className="text-xs text-gray-500">Accepted</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{stackOverflowProfile.questionCount}</p>
                    <p className="text-xs text-gray-500">Questions</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Badges:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
                    <span className="text-sm font-medium">{stackOverflowProfile.badges.gold}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
                    <span className="text-sm font-medium">{stackOverflowProfile.badges.silver}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-amber-600 rounded-full"></span>
                    <span className="text-sm font-medium">{stackOverflowProfile.badges.bronze}</span>
                  </div>
                </div>

                {/* Top Tags */}
                {stackOverflowProfile.topTags && stackOverflowProfile.topTags.length > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {stackOverflowProfile.topTags.slice(0, 5).map((tag) => (
                        <span key={tag.name} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                          {tag.name} ({tag.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleDisconnect('stackoverflow')}
                  className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConnectModal('stackoverflow')}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Connect Stack Overflow
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notion Tab */}
      {activeTab === 'notion' && (
        <div className="space-y-6">
          <div className={`rounded-xl border-2 p-6 ${status?.notion?.connected ? 'border-gray-800 bg-gray-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notion</h3>
                  <p className="text-sm text-gray-500">Import portfolio pages</p>
                </div>
              </div>
              {status?.notion?.connected ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                  Not connected
                </span>
              )}
            </div>

            {notionPortfolio ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{notionPortfolio.workspaceIcon || 'N'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notionPortfolio.workspaceName}</p>
                    <p className="text-xs text-gray-500">
                      {notionPortfolio.pages.length} pages available
                    </p>
                  </div>
                </div>

                {/* Pages */}
                {notionPortfolio.pages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Portfolio Pages</p>
                    {notionPortfolio.pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{page.icon || 'P'}</span>
                          <div>
                            <p className="font-medium text-gray-900">{page.title}</p>
                            <p className="text-xs text-gray-500">Last edited: {formatDate(page.lastEditedAt)}</p>
                          </div>
                        </div>
                        {page.isImported ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Imported as {page.importedAsType}
                          </span>
                        ) : (
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                            Import
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleDisconnect('notion')}
                  className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('notion')}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Connect Notion
              </button>
            )}
          </div>
        </div>
      )}

      {/* GitLab Tab */}
      {activeTab === 'gitlab' && (
        <div className="space-y-6">
          <div className={`rounded-xl border-2 p-6 ${status?.gitlab?.connected ? 'border-orange-600 bg-orange-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">GitLab</h3>
                  <p className="text-sm text-gray-500">Import projects & contributions</p>
                </div>
              </div>
              {status?.gitlab?.connected ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                  Not connected
                </span>
              )}
            </div>

            {gitLabProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <img
                    src={gitLabProfile.avatarUrl || 'https://gitlab.com/uploads/user/avatar/placeholder.png'}
                    alt={gitLabProfile.username}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">@{gitLabProfile.username}</p>
                    <p className="text-xs text-gray-500">{gitLabProfile.displayName}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{gitLabProfile.publicRepos}</p>
                    <p className="text-xs text-gray-500">Projects</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{formatNumber(gitLabProfile.totalStars)}</p>
                    <p className="text-xs text-gray-500">Stars</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{gitLabProfile.totalMergeRequests}</p>
                    <p className="text-xs text-gray-500">MRs</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg font-bold text-gray-900">{formatNumber(gitLabProfile.followers)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                </div>

                {/* Top Languages */}
                {gitLabProfile.topLanguages && gitLabProfile.topLanguages.length > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Languages</p>
                    <div className="space-y-2">
                      {gitLabProfile.topLanguages.slice(0, 5).map((lang) => (
                        <div key={lang.name} className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${lang.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-24">{lang.name}</span>
                          <span className="text-sm text-gray-500 w-12 text-right">{lang.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {gitLabProfile.projects && gitLabProfile.projects.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Featured Projects</p>
                    {gitLabProfile.projects.filter(p => p.isShowcased).slice(0, 3).map((project) => (
                      <div key={project.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <a href={project.webUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-600 hover:underline">
                              {project.name}
                            </a>
                            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{project.stars} stars</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleDisconnect('gitlab')}
                  className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('gitlab')}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Connect GitLab
              </button>
            )}
          </div>
        </div>
      )}

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Behance Card */}
            <div className={`rounded-xl border-2 p-6 ${designPortfolios.find(p => p.platform === 'behance') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Be</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Behance</h3>
                    <p className="text-sm text-gray-500">Design portfolio</p>
                  </div>
                </div>
              </div>

              {designPortfolios.find(p => p.platform === 'behance') ? (
                <DesignPortfolioCard
                  portfolio={designPortfolios.find(p => p.platform === 'behance')!}
                  onDisconnect={() => handleDisconnect('behance')}
                  formatNumber={formatNumber}
                />
              ) : (
                <button
                  onClick={() => setShowConnectModal('behance')}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Connect Behance
                </button>
              )}
            </div>

            {/* Dribbble Card */}
            <div className={`rounded-xl border-2 p-6 ${designPortfolios.find(p => p.platform === 'dribbble') ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dribbble</h3>
                    <p className="text-sm text-gray-500">Design shots</p>
                  </div>
                </div>
              </div>

              {designPortfolios.find(p => p.platform === 'dribbble') ? (
                <DesignPortfolioCard
                  portfolio={designPortfolios.find(p => p.platform === 'dribbble')!}
                  onDisconnect={() => handleDisconnect('dribbble')}
                  formatNumber={formatNumber}
                />
              ) : (
                <button
                  onClick={() => setShowConnectModal('dribbble')}
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
                  Connect Dribbble
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medium Card */}
            <BlogPlatformCard
              platform="medium"
              platformData={blogPlatforms.find(p => p.platform === 'medium') || null}
              status={status?.blog?.medium}
              onConnect={() => setShowConnectModal('medium')}
              onDisconnect={() => handleDisconnect('medium')}
              formatNumber={formatNumber}
              color="gray"
              icon={
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              }
            />

            {/* Dev.to Card */}
            <BlogPlatformCard
              platform="devto"
              platformData={blogPlatforms.find(p => p.platform === 'devto') || null}
              status={status?.blog?.devto}
              onConnect={() => setShowConnectModal('devto')}
              onDisconnect={() => handleDisconnect('devto')}
              formatNumber={formatNumber}
              color="gray"
              icon={
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.83-.23.18-.15.27-.42.27-.83v-2.24c0-.42-.09-.69-.26-.83zm4.82 3.25c0-.23-.01-.49-.03-.77l-.02-.42-.03-.42c-.05-.57-.17-.98-.38-1.24-.2-.25-.52-.38-.94-.38-.43 0-.76.12-.97.38-.21.25-.33.67-.38 1.24l-.04.42-.02.42c-.02.28-.03.54-.03.77 0 .47.03.88.1 1.23.07.35.19.64.38.87.18.23.42.4.73.5.3.1.68.16 1.12.16.44 0 .82-.05 1.12-.16.31-.1.55-.27.73-.5.19-.23.31-.52.38-.87.07-.35.1-.76.1-1.23zm3.67-2.71c-.2-.16-.47-.24-.83-.24h-.58v4.36h.58c.36 0 .64-.08.83-.23.18-.15.28-.42.28-.83v-2.23c0-.41-.1-.68-.28-.83zM24 0v24H0V0h24zM8.61 15.46c-.15.2-.37.36-.66.48-.29.12-.66.18-1.12.18H5.1v-8.24h1.73c.46 0 .83.06 1.12.18.29.12.51.28.66.48.15.2.26.45.32.74.06.29.09.63.09 1.02v3.4c0 .39-.03.73-.09 1.02-.06.29-.17.54-.32.74zm6.67-.2c-.15.3-.36.55-.63.73-.27.18-.6.31-.98.39-.39.08-.82.12-1.29.12-.48 0-.91-.04-1.29-.12-.38-.08-.71-.21-.98-.39-.27-.18-.48-.43-.63-.73-.15-.3-.26-.68-.32-1.12-.06-.44-.1-.99-.1-1.63 0-.64.04-1.18.1-1.63.06-.44.17-.82.32-1.12.15-.3.36-.55.63-.73.27-.18.6-.31.98-.39.38-.08.81-.12 1.29-.12.47 0 .9.04 1.29.12.38.08.71.21.98.39.27.18.48.43.63.73.15.3.26.68.32 1.12.06.45.1.99.1 1.63 0 .64-.04 1.19-.1 1.63-.06.44-.17.82-.32 1.12zm5.49-.65c-.04.3-.16.56-.35.77-.19.21-.46.38-.82.5-.35.12-.81.18-1.37.18h-1.7V7.88h1.7c.56 0 1.02.06 1.37.18.36.12.63.28.82.5.19.21.31.47.35.77.04.31.06.67.06 1.08v3.6c0 .4-.02.76-.06 1.07z"/>
                </svg>
              }
            />

            {/* Hashnode Card */}
            <BlogPlatformCard
              platform="hashnode"
              platformData={blogPlatforms.find(p => p.platform === 'hashnode') || null}
              status={status?.blog?.hashnode}
              onConnect={() => setShowConnectModal('hashnode')}
              onDisconnect={() => handleDisconnect('hashnode')}
              formatNumber={formatNumber}
              color="blue"
              icon={
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 110-7.906 3.953 3.953 0 010 7.906z"/>
                </svg>
              }
            />
          </div>

          {/* Recent Posts from all platforms */}
          {blogPlatforms.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Posts</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {blogPlatforms
                  .flatMap(p => p.recentPosts.map(post => ({ ...post, platform: p.platform })))
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  .slice(0, 5)
                  .map((post) => (
                    <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-20 h-14 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              post.platform === 'medium' ? 'bg-gray-100 text-gray-700' :
                              post.platform === 'devto' ? 'bg-gray-900 text-white' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {post.platform}
                            </span>
                            <span className="text-xs text-gray-500">{post.readingTime} min read</span>
                          </div>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {post.title}
                          </a>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatNumber(post.reactions)} reactions</span>
                            <span>{formatNumber(post.comments)} comments</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect {showConnectModal.charAt(0).toUpperCase() + showConnectModal.slice(1)}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your username to connect your {showConnectModal} account.
            </p>

            <input
              type="text"
              value={connectUsername}
              onChange={(e) => setConnectUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(null);
                  setConnectUsername('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnect(showConnectModal, connectUsername)}
                disabled={connecting || !connectUsername}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
interface DesignPortfolioCardProps {
  portfolio: DesignPortfolio;
  onDisconnect: () => void;
  formatNumber: (num: number) => string;
}

const DesignPortfolioCard: React.FC<DesignPortfolioCardProps> = ({ portfolio, onDisconnect, formatNumber }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <img
        src={portfolio.avatarUrl || 'https://via.placeholder.com/40'}
        alt={portfolio.username}
        className="w-10 h-10 rounded-lg"
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900">@{portfolio.username}</p>
        <p className="text-xs text-gray-500">{portfolio.displayName}</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="p-2 bg-white rounded-lg border border-gray-200">
        <p className="text-lg font-bold text-gray-900">{portfolio.projectsCount}</p>
        <p className="text-xs text-gray-500">Projects</p>
      </div>
      <div className="p-2 bg-white rounded-lg border border-gray-200">
        <p className="text-lg font-bold text-gray-900">{formatNumber(portfolio.followers)}</p>
        <p className="text-xs text-gray-500">Followers</p>
      </div>
      <div className="p-2 bg-white rounded-lg border border-gray-200">
        <p className="text-lg font-bold text-gray-900">{formatNumber(portfolio.likes || portfolio.appreciations)}</p>
        <p className="text-xs text-gray-500">Likes</p>
      </div>
    </div>

    <button
      onClick={onDisconnect}
      className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
    >
      Disconnect
    </button>
  </div>
);

interface BlogPlatformCardProps {
  platform: string;
  platformData: BlogPlatform | null;
  status?: { connected: boolean; postsCount?: number };
  onConnect: () => void;
  onDisconnect: () => void;
  formatNumber: (num: number) => string;
  color: string;
  icon: React.ReactNode;
}

const BlogPlatformCard: React.FC<BlogPlatformCardProps> = ({
  platform,
  platformData,
  status,
  onConnect,
  onDisconnect,
  formatNumber,
  color,
  icon,
}) => {
  const bgColor = color === 'blue' ? 'bg-blue-500' : 'bg-gray-900';
  const borderColor = platformData ? (color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-gray-800 bg-gray-50') : 'border-gray-200 bg-white';
  const buttonColor = color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-900 hover:bg-gray-800';

  return (
    <div className={`rounded-xl border-2 p-6 ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{platform === 'devto' ? 'Dev.to' : platform}</h3>
            <p className="text-sm text-gray-500">Blog posts</p>
          </div>
        </div>
      </div>

      {platformData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <img
              src={platformData.avatarUrl || 'https://via.placeholder.com/40'}
              alt={platformData.username}
              className="w-10 h-10 rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">@{platformData.username}</p>
              <p className="text-xs text-gray-500">{platformData.postsCount} posts</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{formatNumber(platformData.followersCount)}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{formatNumber(platformData.totalReactions)}</p>
              <p className="text-xs text-gray-500">Reactions</p>
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
          className={`w-full py-3 ${buttonColor} text-white rounded-lg font-medium transition-colors`}
        >
          Connect {platform === 'devto' ? 'Dev.to' : platform.charAt(0).toUpperCase() + platform.slice(1)}
        </button>
      )}
    </div>
  );
};

export default AdditionalIntegrationsHub;
