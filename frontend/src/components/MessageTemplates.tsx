import React, { useState } from 'react';

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'greeting' | 'followup' | 'interview' | 'offer' | 'rejection' | 'custom';
  createdAt: string;
  usageCount?: number;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
  userRole: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({ onSelectTemplate, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTemplates, setCustomTemplates] = useState<MessageTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', category: 'custom' as const });

  // Default templates based on role
  const defaultTemplates: MessageTemplate[] = userRole === 'RECRUITER' ? [
    {
      id: '1',
      title: 'Initial Contact',
      content: 'Hi {name},\n\nI came across your profile and was impressed by your experience in {skill}. We have an exciting opportunity for a {position} role that I think would be a great fit for your background.\n\nWould you be interested in learning more?\n\nBest regards,\n{recruiter_name}',
      category: 'greeting',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Interview Invitation',
      content: 'Hi {name},\n\nThank you for your application for the {position} role. We were impressed with your qualifications and would like to invite you for an interview.\n\nPlease let me know your availability for next week.\n\nLooking forward to speaking with you!\n\nBest regards,\n{recruiter_name}',
      category: 'interview',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Follow-up After Interview',
      content: 'Hi {name},\n\nThank you for taking the time to interview with us for the {position} role. We really enjoyed our conversation and learning more about your experience.\n\nWe\'ll be in touch within {timeline} with next steps.\n\nBest regards,\n{recruiter_name}',
      category: 'followup',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Job Offer',
      content: 'Hi {name},\n\nCongratulations! We are pleased to extend you an offer for the {position} role at {company}.\n\nPlease find the detailed offer letter attached. We\'d love to have you join our team!\n\nLet me know if you have any questions.\n\nBest regards,\n{recruiter_name}',
      category: 'offer',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Application Status Update',
      content: 'Hi {name},\n\nThank you for your interest in the {position} role. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate the time you took to apply and wish you the best in your job search.\n\nBest regards,\n{recruiter_name}',
      category: 'rejection',
      createdAt: new Date().toISOString(),
    },
  ] : [
    {
      id: '1',
      title: 'Express Interest',
      content: 'Hi,\n\nI\'m very interested in the {position} role at your company. My experience in {skill} aligns well with the requirements, and I\'d love to discuss how I can contribute to your team.\n\nCould we schedule a time to chat?\n\nBest regards,\n{name}',
      category: 'greeting',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Thank You After Interview',
      content: 'Hi {recruiter_name},\n\nThank you for the opportunity to interview for the {position} role. I really enjoyed our conversation and learning more about the team and company culture.\n\nI\'m very excited about the possibility of joining your team. Please let me know if you need any additional information.\n\nBest regards,\n{name}',
      category: 'followup',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Request Interview Reschedule',
      content: 'Hi {recruiter_name},\n\nI apologize, but I need to request a reschedule for our interview on {date}. Would it be possible to find an alternative time?\n\nI remain very interested in the {position} role and look forward to speaking with you.\n\nThank you for your understanding.\n\nBest regards,\n{name}',
      category: 'interview',
      createdAt: new Date().toISOString(),
    },
  ];

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📋' },
    { value: 'greeting', label: 'Greetings', icon: '👋' },
    { value: 'interview', label: 'Interviews', icon: '📅' },
    { value: 'followup', label: 'Follow-ups', icon: '📧' },
    { value: 'offer', label: 'Offers', icon: '🎉' },
    { value: 'rejection', label: 'Rejections', icon: '📄' },
    { value: 'custom', label: 'Custom', icon: '✏️' },
  ];

  const handleAddTemplate = () => {
    if (newTemplate.title && newTemplate.content) {
      const template: MessageTemplate = {
        id: Date.now().toString(),
        title: newTemplate.title,
        content: newTemplate.content,
        category: newTemplate.category,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      setCustomTemplates([...customTemplates, template]);
      setNewTemplate({ title: '', content: '', category: 'custom' });
      setShowAddModal(false);
    }
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    onSelectTemplate(template.content);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Open message templates"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Templates
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Message Templates</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Template
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close templates"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-700"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                    <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                    {template.content}
                  </p>
                  {template.usageCount !== undefined && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Used {template.usageCount} times
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Custom Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Title</label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Quick Response"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="custom">Custom</option>
                  <option value="greeting">Greeting</option>
                  <option value="followup">Follow-up</option>
                  <option value="interview">Interview</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  rows={6}
                  placeholder="Enter your template text here..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tip: Use placeholders like {'{name}'}, {'{position}'}, {'{company}'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTemplate}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Template
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
