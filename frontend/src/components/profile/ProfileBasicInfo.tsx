import React, { useState } from 'react';
import { candidateProfileAPI } from '../../services/candidateProfileAPI';
import type { CandidateProfile } from '../../types';

interface ProfileBasicInfoProps {
  profile: CandidateProfile;
  onUpdate: (profile: CandidateProfile) => void;
}

const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    headline: profile.headline || '',
    summary: profile.summary || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    remotePreference: profile.remotePreference || '',
    willingToRelocate: profile.willingToRelocate || false,
    expectedSalary: profile.expectedSalary || '',
    expectedSalaryCurrency: profile.expectedSalaryCurrency || 'USD',
    noticePeriod: profile.noticePeriod || '',
    website: profile.website || '',
    github: profile.github || '',
    linkedin: profile.linkedin || '',
    twitter: profile.twitter || '',
    stackoverflow: profile.stackoverflow || '',
    isPublic: profile.isPublic ?? true,
    allowMessages: profile.allowMessages ?? true,
    showSalaryExpectation: profile.showSalaryExpectation || false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await candidateProfileAPI.updateProfile({
        ...formData,
        expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
      });
      onUpdate(result.profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your professional profile and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Professional Summary Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Professional Summary
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer | React | Node.js"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A brief headline that appears below your name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Summary
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={5}
              placeholder="Write a compelling summary about your professional background, skills, and what you're looking for..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="California"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Preference
              </label>
              <select
                name="remotePreference"
                value={formData.remotePreference}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select preference</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                name="willingToRelocate"
                checked={formData.willingToRelocate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Willing to relocate for the right opportunity
              </label>
            </div>
          </div>
        </div>

        {/* Career Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Career Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Salary
              </label>
              <div className="flex">
                <select
                  name="expectedSalaryCurrency"
                  value={formData.expectedSalaryCurrency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
                <input
                  type="number"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  placeholder="150000"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notice Period
              </label>
              <select
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select notice period</option>
                <option value="immediate">Immediate</option>
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </span>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow recruiters to discover your profile
                </p>
              </div>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Allow Messages</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Let recruiters contact you directly
                </p>
              </div>
              <input
                type="checkbox"
                name="allowMessages"
                checked={formData.allowMessages}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show Salary Expectation</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display your salary expectations on your public profile
                </p>
              </div>
              <input
                type="checkbox"
                name="showSalaryExpectation"
                checked={formData.showSalaryExpectation}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileBasicInfo;
