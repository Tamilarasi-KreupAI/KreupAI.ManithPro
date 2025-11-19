import React, { useState } from 'react';
import { faqService, FAQItem, FAQCategory } from '../utils/faqService';

const FAQPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const categories = faqService.getCategories();
  const faqs = searchQuery
    ? faqService.searchFAQs(searchQuery)
    : selectedCategory
    ? faqService.getFAQsByCategory(selectedCategory)
    : faqService.getPopularFAQs(10);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setSearchQuery('');
  };

  const handleFAQClick = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleFeedback = async (faqId: string, helpful: boolean) => {
    await faqService.markHelpful(faqId, helpful);
    setFeedbackGiven(prev => new Set(prev).add(faqId));
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find answers to common questions about our platform
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
            placeholder="Search for answers..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Browse by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCategory === category.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {category.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {searchQuery
            ? `Search Results (${faqs.length})`
            : selectedCategory
            ? `${categories.find(c => c.id === selectedCategory)?.name} (${faqs.length})`
            : 'Popular Questions'}
        </h3>
      </div>

      {/* FAQ List */}
      {faqs.length > 0 ? (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Question */}
              <button
                onClick={() => handleFAQClick(faq.id)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {highlightText(faq.question, searchQuery)}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {faq.helpful !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {faq.helpful} found helpful
                      </span>
                    )}
                    <div className="flex gap-1">
                      {faq.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFAQ === faq.id ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-700">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {highlightText(faq.answer, searchQuery)}
                    </p>
                  </div>

                  {/* Related Articles */}
                  {faq.relatedArticles && faq.relatedArticles.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        Related Articles
                      </h5>
                      <ul className="space-y-1">
                        {faqService.getRelatedFAQs(faq.id).map((related) => (
                          <li key={related.id}>
                            <button
                              onClick={() => handleFAQClick(related.id)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {related.question}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {feedbackGiven.has(faq.id) ? (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Thanks for your feedback!
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Was this helpful?
                        </span>
                        <button
                          onClick={() => handleFeedback(faq.id, true)}
                          className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback(faq.id, false)}
                          className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No results found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or browse categories above
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPanel;
