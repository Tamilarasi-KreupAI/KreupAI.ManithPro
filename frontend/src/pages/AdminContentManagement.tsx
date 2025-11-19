import React, { useState, useEffect } from 'react';
import {
  // FAQ Management
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
  // Email Templates
  getAllEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  // Notification Templates
  getAllNotificationTemplatesContent,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  // Static Pages
  getAllStaticPages,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  // Help Articles
  getAllHelpArticles,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  reorderHelpArticles,
  // Stats
  getContentStats,
} from '../services/admin.service';

type TabType = 'faqs' | 'email-templates' | 'notification-templates' | 'static-pages' | 'help-articles';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  variables: string[];
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published: boolean;
}

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  order: number;
  published: boolean;
}

interface ContentStats {
  faqs: { total: number; published: number; draft: number };
  emailTemplates: { total: number };
  notificationTemplates: { total: number };
  staticPages: { total: number; published: number; draft: number };
  helpArticles: { total: number; published: number; draft: number };
}

const AdminContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('faqs');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ContentStats | null>(null);

  // FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showFAQModal, setShowFAQModal] = useState(false);

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);

  // Notification Templates
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [editingNotificationTemplate, setEditingNotificationTemplate] = useState<NotificationTemplate | null>(null);
  const [showNotificationTemplateModal, setShowNotificationTemplateModal] = useState(false);

  // Static Pages
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [editingStaticPage, setEditingStaticPage] = useState<StaticPage | null>(null);
  const [showStaticPageModal, setShowStaticPageModal] = useState(false);

  // Help Articles
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [editingHelpArticle, setEditingHelpArticle] = useState<HelpArticle | null>(null);
  const [showHelpArticleModal, setShowHelpArticleModal] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await getContentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'faqs':
          const faqData = await getAllFAQs({});
          setFaqs(faqData.faqs);
          break;
        case 'email-templates':
          const emailData = await getAllEmailTemplates({});
          setEmailTemplates(emailData.templates);
          break;
        case 'notification-templates':
          const notifData = await getAllNotificationTemplatesContent({});
          setNotificationTemplates(notifData.templates);
          break;
        case 'static-pages':
          const pageData = await getAllStaticPages({});
          setStaticPages(pageData.pages);
          break;
        case 'help-articles':
          const articleData = await getAllHelpArticles({});
          setHelpArticles(articleData.articles);
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  // FAQ Functions
  const handleCreateFAQ = () => {
    setEditingFAQ({
      id: '',
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      published: false,
    });
    setShowFAQModal(true);
  };

  const handleSaveFAQ = async () => {
    if (!editingFAQ) return;

    try {
      if (editingFAQ.id) {
        await updateFAQ(editingFAQ.id, editingFAQ);
      } else {
        await createFAQ(editingFAQ);
      }
      setShowFAQModal(false);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteFAQ(id);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  // Email Template Functions
  const handleCreateEmailTemplate = () => {
    setEditingEmailTemplate({
      id: '',
      name: '',
      type: 'notification',
      subject: '',
      body: '',
      variables: [],
    });
    setShowEmailTemplateModal(true);
  };

  const handleSaveEmailTemplate = async () => {
    if (!editingEmailTemplate) return;

    try {
      if (editingEmailTemplate.id) {
        await updateEmailTemplate(editingEmailTemplate.id, editingEmailTemplate);
      } else {
        await createEmailTemplate(editingEmailTemplate);
      }
      setShowEmailTemplateModal(false);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error saving email template:', error);
      alert('Failed to save email template');
    }
  };

  const handleDeleteEmailTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteEmailTemplate(id);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  // Notification Template Functions
  const handleCreateNotificationTemplate = () => {
    setEditingNotificationTemplate({
      id: '',
      name: '',
      type: 'info',
      title: '',
      message: '',
      actionUrl: '',
      variables: [],
    });
    setShowNotificationTemplateModal(true);
  };

  const handleSaveNotificationTemplate = async () => {
    if (!editingNotificationTemplate) return;

    try {
      if (editingNotificationTemplate.id) {
        await updateNotificationTemplate(editingNotificationTemplate.id, editingNotificationTemplate);
      } else {
        await createNotificationTemplate(editingNotificationTemplate);
      }
      setShowNotificationTemplateModal(false);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error saving notification template:', error);
      alert('Failed to save notification template');
    }
  };

  const handleDeleteNotificationTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteNotificationTemplate(id);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  // Static Page Functions
  const handleCreateStaticPage = () => {
    setEditingStaticPage({
      id: '',
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      published: false,
    });
    setShowStaticPageModal(true);
  };

  const handleSaveStaticPage = async () => {
    if (!editingStaticPage) return;

    try {
      if (editingStaticPage.id) {
        await updateStaticPage(editingStaticPage.id, editingStaticPage);
      } else {
        await createStaticPage(editingStaticPage);
      }
      setShowStaticPageModal(false);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page');
    }
  };

  const handleDeleteStaticPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await deleteStaticPage(id);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  // Help Article Functions
  const handleCreateHelpArticle = () => {
    setEditingHelpArticle({
      id: '',
      title: '',
      slug: '',
      content: '',
      category: 'General',
      order: 0,
      published: false,
    });
    setShowHelpArticleModal(true);
  };

  const handleSaveHelpArticle = async () => {
    if (!editingHelpArticle) return;

    try {
      if (editingHelpArticle.id) {
        await updateHelpArticle(editingHelpArticle.id, editingHelpArticle);
      } else {
        await createHelpArticle(editingHelpArticle);
      }
      setShowHelpArticleModal(false);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    }
  };

  const handleDeleteHelpArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await deleteHelpArticle(id);
      loadContent();
      loadStats();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">FAQs</div>
            <div className="text-2xl font-bold">{stats.faqs.total}</div>
            <div className="text-xs text-gray-500">{stats.faqs.published} published</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Email Templates</div>
            <div className="text-2xl font-bold">{stats.emailTemplates.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Notification Templates</div>
            <div className="text-2xl font-bold">{stats.notificationTemplates.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Static Pages</div>
            <div className="text-2xl font-bold">{stats.staticPages.total}</div>
            <div className="text-xs text-gray-500">{stats.staticPages.published} published</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Help Articles</div>
            <div className="text-2xl font-bold">{stats.helpArticles.total}</div>
            <div className="text-xs text-gray-500">{stats.helpArticles.published} published</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <div className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'faqs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('email-templates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'email-templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Email Templates
            </button>
            <button
              onClick={() => setActiveTab('notification-templates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'notification-templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notification Templates
            </button>
            <button
              onClick={() => setActiveTab('static-pages')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'static-pages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Static Pages
            </button>
            <button
              onClick={() => setActiveTab('help-articles')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'help-articles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Help Articles
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              {/* FAQs Tab */}
              {activeTab === 'faqs' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    <button
                      onClick={handleCreateFAQ}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border rounded p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{faq.question}</div>
                            <div className="text-sm text-gray-600 mb-2">{faq.answer.substring(0, 150)}...</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-gray-100 px-2 py-1 rounded">{faq.category}</span>
                              <span className={`px-2 py-1 rounded ${faq.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {faq.published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingFAQ(faq);
                                setShowFAQModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Templates Tab */}
              {activeTab === 'email-templates' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Email Templates</h2>
                    <button
                      onClick={handleCreateEmailTemplate}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Template
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="border rounded p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{template.name}</div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{template.type}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Subject: {template.subject}</div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingEmailTemplate(template);
                              setShowEmailTemplateModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmailTemplate(template.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Templates Tab */}
              {activeTab === 'notification-templates' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Notification Templates</h2>
                    <button
                      onClick={handleCreateNotificationTemplate}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Template
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notificationTemplates.map((template) => (
                      <div key={template.id} className="border rounded p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{template.name}</div>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{template.type}</span>
                        </div>
                        <div className="text-sm font-medium mb-1">{template.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{template.message.substring(0, 100)}...</div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingNotificationTemplate(template);
                              setShowNotificationTemplateModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNotificationTemplate(template.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Static Pages Tab */}
              {activeTab === 'static-pages' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Static Pages</h2>
                    <button
                      onClick={handleCreateStaticPage}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Page
                    </button>
                  </div>
                  <div className="space-y-3">
                    {staticPages.map((page) => (
                      <div key={page.id} className="border rounded p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{page.title}</div>
                            <div className="text-sm text-gray-600 mb-2">Slug: /{page.slug}</div>
                            <span className={`px-2 py-1 rounded text-xs ${page.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {page.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingStaticPage(page);
                                setShowStaticPageModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStaticPage(page.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Articles Tab */}
              {activeTab === 'help-articles' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Help Articles</h2>
                    <button
                      onClick={handleCreateHelpArticle}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Article
                    </button>
                  </div>
                  <div className="space-y-3">
                    {helpArticles.map((article) => (
                      <div key={article.id} className="border rounded p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{article.title}</div>
                            <div className="text-sm text-gray-600 mb-2">Slug: /{article.slug}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-gray-100 px-2 py-1 rounded">{article.category}</span>
                              <span className={`px-2 py-1 rounded ${article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {article.published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingHelpArticle(article);
                                setShowHelpArticleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteHelpArticle(article.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQModal && editingFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingFAQ.id ? 'Edit FAQ' : 'Add FAQ'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <input
                  type="text"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <textarea
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={editingFAQ.category}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Published</label>
                  <input
                    type="checkbox"
                    checked={editingFAQ.published}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, published: e.target.checked })}
                    className="mt-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowFAQModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFAQ}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar modals for other content types would go here */}
      {/* Due to length constraints, I'll include placeholder comments */}
      {/* Email Template Modal, Notification Template Modal, Static Page Modal, Help Article Modal */}
    </div>
  );
};

export default AdminContentManagement;
