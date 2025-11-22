import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from "../services/api";
import { interviewAPI } from '../services/interviewAPI';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    profileComplete: 0,
  });

  useEffect(() => {
    fetchAchievementData();
  }, []);

  const fetchAchievementData = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const { applications } = await applicationAPI.getAll();
      const interviews = await interviewAPI.getAll();

      // Calculate profile completeness
      let profileFields = 0;
      const totalFields = 10;
      if (user?.firstName) profileFields++;
      if (user?.lastName) profileFields++;
      if (user?.email) profileFields++;
      if (user?.phone) profileFields++;
      if (user?.bio) profileFields++;
      if (user?.skills && user.skills.length > 0) profileFields++;
      if (user?.experience) profileFields++;
      if (user?.education) profileFields++;
      if (user?.location) profileFields++;
      if (user?.linkedIn) profileFields++;

      const profileCompleteness = Math.round((profileFields / totalFields) * 100);

      setStats({
        applications: applications.length,
        interviews: interviews.length,
        profileComplete: profileCompleteness,
      });

      // Define achievements
      const achievementList: Achievement[] = [
        {
          id: 'first-application',
          title: 'Getting Started',
          description: 'Submit your first job application',
          icon: '🚀',
          color: 'bg-blue-500',
          unlocked: applications.length >= 1,
          progress: Math.min(applications.length, 1),
          maxProgress: 1,
        },
        {
          id: 'five-applications',
          title: 'Job Hunter',
          description: 'Submit 5 job applications',
          icon: '🎯',
          color: 'bg-green-500',
          unlocked: applications.length >= 5,
          progress: Math.min(applications.length, 5),
          maxProgress: 5,
        },
        {
          id: 'ten-applications',
          title: 'Go-Getter',
          description: 'Submit 10 job applications',
          icon: '💪',
          color: 'bg-purple-500',
          unlocked: applications.length >= 10,
          progress: Math.min(applications.length, 10),
          maxProgress: 10,
        },
        {
          id: 'twenty-applications',
          title: 'Persistent',
          description: 'Submit 20 job applications',
          icon: '🔥',
          color: 'bg-orange-500',
          unlocked: applications.length >= 20,
          progress: Math.min(applications.length, 20),
          maxProgress: 20,
        },
        {
          id: 'profile-complete',
          title: 'Profile Perfect',
          description: 'Complete 100% of your profile',
          icon: '⭐',
          color: 'bg-yellow-500',
          unlocked: profileCompleteness === 100,
          progress: profileCompleteness,
          maxProgress: 100,
        },
        {
          id: 'first-interview',
          title: 'Interview Ready',
          description: 'Get your first interview scheduled',
          icon: '🎤',
          color: 'bg-pink-500',
          unlocked: interviews.length >= 1,
          progress: Math.min(interviews.length, 1),
          maxProgress: 1,
        },
        {
          id: 'five-interviews',
          title: 'Interview Pro',
          description: 'Complete 5 interviews',
          icon: '🏆',
          color: 'bg-indigo-500',
          unlocked: interviews.length >= 5,
          progress: Math.min(interviews.length, 5),
          maxProgress: 5,
        },
        {
          id: 'weekly-streak',
          title: 'Consistency is Key',
          description: 'Apply to jobs 3 days in a row',
          icon: '📅',
          color: 'bg-teal-500',
          unlocked: false, // Would need more complex logic to track streaks
          progress: 0,
          maxProgress: 3,
        },
        {
          id: 'early-bird',
          title: 'Early Bird',
          description: 'Apply within 24 hours of job posting',
          icon: '⏰',
          color: 'bg-cyan-500',
          unlocked: false, // Would need to check application time vs job post time
          progress: 0,
          maxProgress: 1,
        },
        {
          id: 'skill-master',
          title: 'Skill Master',
          description: 'Add 10+ skills to your profile',
          icon: '🎓',
          color: 'bg-emerald-500',
          unlocked: (user?.skills?.length || 0) >= 10,
          progress: Math.min(user?.skills?.length || 0, 10),
          maxProgress: 10,
        },
      ];

      setAchievements(achievementList);
    } catch (error) {
      console.error('Failed to fetch achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <div className="text-sm text-gray-600">
            {unlockedCount} / {totalCount} Unlocked
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{completionPercentage}% Complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-lg p-4 border-2 transition-all ${achievement.unlocked
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
          >
            {achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-12 h-12 ${achievement.color} rounded-lg flex items-center justify-center text-2xl`}
              >
                {achievement.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>

                {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {achievement.progress} / {achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${achievement.color} h-2 rounded-full transition-all`}
                        style={{
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {achievement.unlocked && (
                  <span className="inline-block text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    Unlocked! ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-3">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.applications}</p>
            <p className="text-sm text-gray-600">Applications</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.profileComplete}%</p>
            <p className="text-sm text-gray-600">Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
