import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, notificationPreferenceAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';
import { getAvatarGradient, getUserInitials, getAvatarRingColor } from '../utils/avatarUtils';
import type { User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

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
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailEnabled: true,
    applicationUpdates: true,
    interviewReminders: true,
    messageAlerts: true,
    jobAlerts: false,
    systemAnnouncements: true,
    marketingEmails: false,
  });

  useEffect(() => {
    loadProfile();
    loadNotificationPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile();

      // Redirect recruiters to their specialized profile page
      if (data.role === 'RECRUITER') {
        navigate('/profile/recruiter', { replace: true });
        return;
      }
      setUser(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bio: data.bio || '',
        skills: data.skills || [],
        experience: data.experience || 0,
        education: data.education || '',
        location: data.location || '',
        linkedIn: data.linkedIn || '',
        portfolio: data.portfolio || '',
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error(error.response?.data?.error || 'Failed to load profile');
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

  const loadNotificationPreferences = async () => {
    try {
      const preferences = await notificationPreferenceAPI.get();
      setNotificationPreferences(preferences);
    } catch (error: any) {
      console.error('Failed to load notification preferences:', error);
      // Keep default values if loading fails
    }
  };

  const handleNotificationChange = async (key: keyof typeof notificationPreferences) => {
    const updatedValue = !notificationPreferences[key];

    // Optimistic update
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: updatedValue,
    }));

    try {
      await notificationPreferenceAPI.update({ [key]: updatedValue });
      toast.success('Notification preference updated');
    } catch (error: any) {
      // Revert on error
      setNotificationPreferences((prev) => ({
        ...prev,
        [key]: !updatedValue,
      }));
      toast.error(error.response?.data?.error || 'Failed to update preference');
    }
  };

  useEffect(() => {
    // Load notification preferences from localStorage
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        setNotificationPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notification preferences:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      const response = await userAPI.updateProfile(formData);
      setUser(response.user);
      setEditing(false);
      toast.success('Profile updated successfully!', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const loadingToast = toast.loading('Changing password...');

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!', { id: loadingToast });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password', { id: loadingToast });
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    setDeleting(true);
    const loadingToast = toast.loading('Deleting account...');

    try {
      await userAPI.deleteAccount(deletePassword);
      toast.success('Account deleted successfully', { id: loadingToast });

      // Clear all auth data and redirect to home
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account', { id: loadingToast });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8">
            <svg className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Failed to Load Profile</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-4">Unable to retrieve your profile information.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto relative z-10">
        {/* Enhanced Hero Header Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-gray-700/50 overflow-hidden mb-8">
          {/* Profile Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8 -mt-16">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                {/* Avatar */}
                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getAvatarGradient(user.firstName, user.lastName)} flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white dark:border-gray-800 ring-4 ${getAvatarRingColor(user.firstName, user.lastName)}`}>
                  {getUserInitials(user.firstName, user.lastName)}
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-2">
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                      {user.role}
                    </span>
                    {user.location && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
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
            <div className="border-b border-slate-100 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-gray-100 font-medium">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{user.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-slate-100 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Professional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-gray-400">{user.bio || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100">
                        {user.experience !== undefined ? `${user.experience} years` : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                        placeholder="e.g., Bachelor's in Computer Science"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100">{user.education || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
                  {editing ? (
                    <>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (skillInput.trim()) {
                                handleAddSkill();
                              } else {
                                toast.error('Please enter a skill');
                              }
                            }
                          }}
                          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Add a skill..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              handleAddSkill();
                            } else {
                              toast.error('Please enter a skill');
                            }
                          }}
                          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-500/30 transition-all hover:-translate-y-0.5"
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
                            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600 dark:text-gray-400">No skills added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="border-b border-slate-100 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : user.linkedIn ? (
                    <a
                      href={user.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {user.linkedIn}
                    </a>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio Website
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                      placeholder="https://yourportfolio.com"
                    />
                  ) : user.portfolio ? (
                    <a
                      href={user.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {user.portfolio}
                    </a>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="border-t border-slate-100 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings & Preferences
              </h2>

              <div className="space-y-6">
                {/* Theme Settings */}
                <div className="bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
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
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Enable all email notifications
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.emailEnabled}
                        onChange={() => handleNotificationChange('emailEnabled')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Application status updates
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.applicationUpdates}
                        onChange={() => handleNotificationChange('applicationUpdates')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Interview reminders
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.interviewReminders}
                        onChange={() => handleNotificationChange('interviewReminders')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Message alerts
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.messageAlerts}
                        onChange={() => handleNotificationChange('messageAlerts')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Job alerts & recommendations
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.jobAlerts}
                        onChange={() => handleNotificationChange('jobAlerts')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        System announcements
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.systemAnnouncements}
                        onChange={() => handleNotificationChange('systemAnnouncements')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Marketing emails & newsletters
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationPreferences.marketingEmails}
                        onChange={() => handleNotificationChange('marketingEmails')}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
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
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  className="w-full border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2"
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h2>
              <p className="text-slate-600 dark:text-gray-400 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  ⚠️ Warning: All your data including applications, saved jobs, and profile information will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  disabled={deleting}
                  className="flex-1 bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-300 font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Profile;
