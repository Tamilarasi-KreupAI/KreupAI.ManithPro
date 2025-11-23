import React from 'react';
import { useNavigate } from 'react-router-dom';
import Achievements from '../components/Achievements';

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Your Journey</h1>
          <p className="mt-2 text-gray-600">Track your progress and unlock achievements</p>
        </div>

        <Achievements />

        {/* Motivational Section */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Keep Going! 🚀</h2>
          <p className="text-lg mb-6">
            Every application brings you one step closer to your dream job. Stay consistent, keep improving your profile, and success will follow!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
              <p className="text-sm">Complete your profile to 100% to stand out to recruiters</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📈 Next Goal</h3>
              <p className="text-sm">Apply to 5 more jobs to unlock "Job Hunter" badge</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Daily Challenge</h3>
              <p className="text-sm">Apply to at least one job today to build momentum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
