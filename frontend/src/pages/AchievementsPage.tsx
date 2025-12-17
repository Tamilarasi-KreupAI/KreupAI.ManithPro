import React from 'react';
import { useNavigate } from 'react-router-dom';
import Achievements from '../components/Achievements';

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6 flex items-center gap-2 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Journey</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your progress and unlock achievements</p>
        </div>

        <Achievements />

        {/* Motivational Section */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Keep Going! 🚀</h2>
          <p className="text-lg mb-6 text-white/95">
            Every application brings you one step closer to your dream job. Stay consistent, keep improving your profile, and success will follow!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-white/20">
              <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-white/90">Complete your profile to 100% to stand out to recruiters</p>
            </div>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-white/20">
              <h3 className="font-semibold mb-2">📈 Next Goal</h3>
              <p className="text-sm text-white/90">Apply to 5 more jobs to unlock "Job Hunter" badge</p>
            </div>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-white/20">
              <h3 className="font-semibold mb-2">🎯 Daily Challenge</h3>
              <p className="text-sm text-white/90">Apply to at least one job today to build momentum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
