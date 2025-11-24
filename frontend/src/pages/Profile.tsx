import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import type { User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    skills: [] as string[],
    experience: 0,
    education: '',
    location: '',
    linkedIn: '',
    portfolio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        bio: data.bio || '',
        skills: data.skills || [],
        experience: data.experience || 0,
        education: data.education || '',
        location: data.location || '',
        linkedIn: data.linkedIn || '',
        portfolio: data.portfolio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userAPI.updateProfile(formData);
      setUser(response.user);
      setEditing(false);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
              <p className="text-slate-500">
                {user.email} • {user.role}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-slate-700">{user.firstName} {user.lastName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-slate-600 text-white px-6 py-2.5 rounded-xl hover:bg-slate-700 font-bold transition-all"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 flex items-center gap-2 font-bold transition-all"
                    title="Logout"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 disabled:bg-slate-400 font-bold shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      loadProfile();
                    }}
                    className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded-xl hover:bg-slate-300 font-bold transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900">{user.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Professional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-slate-600">{user.bio || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.experience !== undefined ? `${user.experience} years` : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="e.g., Bachelor's in Computer Science"
                      />
                    ) : (
                      <p className="text-gray-900">{user.education || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  {editing ? (
                    <>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Add a skill..."
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-500/30 transition-all"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600">No skills added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : user.linkedIn ? (
                    <a
                      href={user.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {user.linkedIn}
                    </a>
                  ) : (
                    <p className="text-gray-900">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Website
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://yourportfolio.com"
                    />
                  ) : user.portfolio ? (
                    <a
                      href={user.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {user.portfolio}
                    </a>
                  ) : (
                    <p className="text-gray-900">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings & Preferences
              </h2>

              <div className="space-y-6">
                {/* Theme Settings */}
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Appearance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Choose how you want ManithPro to look
                  </p>
                  <ThemeToggle />
                </div>

                {/* Notification Preferences */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Email notifications for new messages</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Application status updates</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Interview reminders</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Weekly job recommendations</span>
                      <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                  </div>
                </div>

                {/* Language & Region */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Language & Region
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Language</label>
                      <select className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-3 py-2 text-sm">
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Zone</label>
                      <select className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-3 py-2 text-sm">
                        <option>GMT +4:00 (Dubai)</option>
                        <option>GMT +0:00 (London)</option>
                        <option>GMT -5:00 (New York)</option>
                        <option>GMT -8:00 (Los Angeles)</option>
                        <option>GMT +8:00 (Singapore)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Make my profile visible to recruiters</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Show last active status</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Allow anonymous feedback</span>
                      <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                    </label>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                    Permanent actions that cannot be undone
                  </p>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
