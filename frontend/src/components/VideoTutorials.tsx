import React, { useState } from 'react';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3:45"
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  thumbnail: string;
  views?: number;
  tags: string[];
}

const VideoTutorials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Tutorials', icon: '📚' },
    { id: 'getting_started', name: 'Getting Started', icon: '🚀' },
    { id: 'profile', name: 'Profile Setup', icon: '👤' },
    { id: 'job_search', name: 'Job Search', icon: '🔍' },
    { id: 'applications', name: 'Applications', icon: '📝' },
    { id: 'messaging', name: 'Messaging', icon: '💬' },
    { id: 'interviews', name: 'Interviews', icon: '📹' },
    { id: 'advanced', name: 'Advanced Tips', icon: '⚡' },
  ];

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Welcome to the Platform - Quick Start Guide',
      description: 'Learn the basics of navigating the platform and setting up your account in under 5 minutes.',
      duration: '4:32',
      category: 'getting_started',
      difficulty: 'beginner',
      videoUrl: 'https://example.com/video1',
      thumbnail: '/tutorials/welcome.jpg',
      views: 1542,
      tags: ['welcome', 'basics', 'setup'],
    },
    {
      id: '2',
      title: 'Creating the Perfect Profile',
      description: 'Optimize your profile to attract recruiters. Learn what information to include and how to stand out.',
      duration: '6:15',
      category: 'profile',
      difficulty: 'beginner',
      videoUrl: 'https://example.com/video2',
      thumbnail: '/tutorials/profile.jpg',
      views: 2103,
      tags: ['profile', 'optimization', 'visibility'],
    },
    {
      id: '3',
      title: 'Advanced Job Search Filters',
      description: 'Master the search filters to find jobs that perfectly match your skills and preferences.',
      duration: '5:48',
      category: 'job_search',
      difficulty: 'intermediate',
      videoUrl: 'https://example.com/video3',
      thumbnail: '/tutorials/search.jpg',
      views: 1876,
      tags: ['search', 'filters', 'matching'],
    },
    {
      id: '4',
      title: 'Writing Winning Applications',
      description: 'Learn how to craft compelling cover letters and tailor your resume for each application.',
      duration: '8:20',
      category: 'applications',
      difficulty: 'intermediate',
      videoUrl: 'https://example.com/video4',
      thumbnail: '/tutorials/applications.jpg',
      views: 3214,
      tags: ['resume', 'cover letter', 'application'],
    },
    {
      id: '5',
      title: 'Using Message Templates & Code Sharing',
      description: 'Discover how to save time with templates and share code snippets with syntax highlighting.',
      duration: '4:05',
      category: 'messaging',
      difficulty: 'beginner',
      videoUrl: 'https://example.com/video5',
      thumbnail: '/tutorials/messaging.jpg',
      views: 987,
      tags: ['templates', 'code', 'communication'],
    },
    {
      id: '6',
      title: 'Acing Your Video Interviews',
      description: 'Prepare for success with tips on setup, presentation, and common interview questions.',
      duration: '9:30',
      category: 'interviews',
      difficulty: 'intermediate',
      videoUrl: 'https://example.com/video6',
      thumbnail: '/tutorials/interviews.jpg',
      views: 4521,
      tags: ['interview', 'video', 'preparation'],
    },
    {
      id: '7',
      title: 'Building Trust with Verification',
      description: 'Learn how to verify your credentials and build a strong trust score to increase your chances.',
      duration: '3:42',
      category: 'profile',
      difficulty: 'beginner',
      videoUrl: 'https://example.com/video7',
      thumbnail: '/tutorials/verification.jpg',
      views: 1654,
      tags: ['verification', 'trust', 'credibility'],
    },
    {
      id: '8',
      title: 'Pro Tips: Standing Out to Recruiters',
      description: 'Advanced strategies used by successful candidates to get noticed and land interviews faster.',
      duration: '12:15',
      category: 'advanced',
      difficulty: 'advanced',
      videoUrl: 'https://example.com/video8',
      thumbnail: '/tutorials/pro-tips.jpg',
      views: 2897,
      tags: ['advanced', 'strategy', 'success'],
    },
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Video Tutorials
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Step-by-step guides to help you succeed
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials..."
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
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedTutorial && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTutorial(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <p className="text-sm text-gray-400">Video Player Placeholder</p>
                <p className="text-xs text-gray-500 mt-1">{selectedTutorial.videoUrl}</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedTutorial.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTutorial.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedTutorial.duration}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {selectedTutorial.views} views
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(selectedTutorial.difficulty)}`}>
                  {selectedTutorial.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Grid */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              onClick={() => setSelectedTutorial(tutorial)}
              className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center relative">
                <svg className="w-16 h-16 text-white opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                  {tutorial.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                    {tutorial.title}
                  </h3>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getDifficultyBadge(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {tutorial.views} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No tutorials found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoTutorials;
