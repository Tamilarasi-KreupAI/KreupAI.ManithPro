import React, { useState, useEffect } from 'react';
import { educationAPI, certificationAPI, candidateProfileAPI } from '../../services/candidateProfileAPI';
import type { Education, Certification, CandidateProfile } from '../../types';

interface EducationHubProps {
  onUpdate: () => void;
}

type TabType = 'education' | 'certifications';

const EducationHub: React.FC<EducationHubProps> = ({ onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('education');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [educationForm, setEducationForm] = useState<Partial<Education>>({
    institutionName: '',
    institutionType: 'university',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isOngoing: false,
    grade: '',
    activities: [],
    achievements: [],
  });

  const [certForm, setCertForm] = useState<Partial<Certification>>({
    name: '',
    issuingOrganization: '',
    credentialId: '',
    credentialUrl: '',
    issueDate: '',
    expirationDate: '',
    doesNotExpire: false,
    skills: [],
  });

  const [newActivity, setNewActivity] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile } = await candidateProfileAPI.getProfile();
      setProfile(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Education handlers
  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEducationId) {
        await educationAPI.update(editingEducationId, educationForm);
      } else {
        await educationAPI.add(educationForm);
      }
      await loadProfile();
      onUpdate();
      resetEducationForm();
    } catch (err) {
      console.error('Failed to save education:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      ...edu,
      startDate: edu.startDate?.split('T')[0] || '',
      endDate: edu.endDate?.split('T')[0] || '',
    });
    setEditingEducationId(edu.id);
    setShowEducationForm(true);
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education?')) return;
    try {
      await educationAPI.delete(id);
      await loadProfile();
      onUpdate();
    } catch (err) {
      console.error('Failed to delete education:', err);
    }
  };

  const resetEducationForm = () => {
    setEducationForm({
      institutionName: '',
      institutionType: 'university',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isOngoing: false,
      grade: '',
      activities: [],
      achievements: [],
    });
    setEditingEducationId(null);
    setShowEducationForm(false);
  };

  // Certification handlers
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCertId) {
        await certificationAPI.update(editingCertId, certForm);
      } else {
        await certificationAPI.add(certForm);
      }
      await loadProfile();
      onUpdate();
      resetCertForm();
    } catch (err) {
      console.error('Failed to save certification:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCert = (cert: Certification) => {
    setCertForm({
      ...cert,
      issueDate: cert.issueDate?.split('T')[0] || '',
      expirationDate: cert.expirationDate?.split('T')[0] || '',
    });
    setEditingCertId(cert.id);
    setShowCertForm(true);
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      await certificationAPI.delete(id);
      await loadProfile();
      onUpdate();
    } catch (err) {
      console.error('Failed to delete certification:', err);
    }
  };

  const resetCertForm = () => {
    setCertForm({
      name: '',
      issuingOrganization: '',
      credentialId: '',
      credentialUrl: '',
      issueDate: '',
      expirationDate: '',
      doesNotExpire: false,
      skills: [],
    });
    setEditingCertId(null);
    setShowCertForm(false);
  };

  // Array helpers
  const addToArray = (
    form: 'education' | 'cert',
    field: string,
    value: string,
    setter: (val: string) => void
  ) => {
    if (!value.trim()) return;
    if (form === 'education') {
      setEducationForm((prev) => ({
        ...prev,
        [field]: [...((prev as any)[field] || []), value.trim()],
      }));
    } else {
      setCertForm((prev) => ({
        ...prev,
        [field]: [...((prev as any)[field] || []), value.trim()],
      }));
    }
    setter('');
  };

  const removeFromArray = (form: 'education' | 'cert', field: string, index: number) => {
    if (form === 'education') {
      setEducationForm((prev) => ({
        ...prev,
        [field]: ((prev as any)[field] || []).filter((_: any, i: number) => i !== index),
      }));
    } else {
      setCertForm((prev) => ({
        ...prev,
        [field]: ((prev as any)[field] || []).filter((_: any, i: number) => i !== index),
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('education')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'education'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                Education ({profile?.educations?.length || 0})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'certifications'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Certifications ({profile?.certifications?.length || 0})
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-end">
            <button
              onClick={() => activeTab === 'education' ? setShowEducationForm(true) : setShowCertForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add {activeTab === 'education' ? 'Education' : 'Certification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Education Tab Content */}
      {activeTab === 'education' && (
        <>
          {/* Education Form */}
          {showEducationForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingEducationId ? 'Edit Education' : 'Add Education'}
              </h3>
              <form onSubmit={handleEducationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      value={educationForm.institutionName}
                      onChange={(e) => setEducationForm({ ...educationForm, institutionName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Institution Type
                    </label>
                    <select
                      value={educationForm.institutionType}
                      onChange={(e) => setEducationForm({ ...educationForm, institutionType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                      <option value="online">Online Course</option>
                      <option value="bootcamp">Bootcamp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      value={educationForm.fieldOfStudy}
                      onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                      placeholder="e.g., Computer Science"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={educationForm.startDate}
                      onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={educationForm.endDate}
                      onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                      disabled={educationForm.isOngoing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      checked={educationForm.isOngoing}
                      onChange={(e) => setEducationForm({ ...educationForm, isOngoing: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Currently studying</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grade/GPA
                  </label>
                  <input
                    type="text"
                    value={educationForm.grade}
                    onChange={(e) => setEducationForm({ ...educationForm, grade: e.target.value })}
                    placeholder="e.g., 3.8/4.0 or First Class Honours"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Activities & Societies
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Add activity..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('education', 'activities', newActivity, setNewActivity))}
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('education', 'activities', newActivity, setNewActivity)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {educationForm.activities?.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                        {item}
                        <button type="button" onClick={() => removeFromArray('education', 'activities', index)} className="ml-2">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={resetEducationForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : editingEducationId ? 'Update' : 'Add Education'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Education List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {profile?.educations && profile.educations.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {profile.educations.map((edu) => (
                  <div key={edu.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{edu.institutionName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {edu.fieldOfStudy} • {formatDate(edu.startDate)} - {edu.isOngoing ? 'Present' : edu.endDate ? formatDate(edu.endDate) : 'N/A'}
                          </p>
                          {edu.grade && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Grade: {edu.grade}</p>}
                          {edu.activities && edu.activities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {edu.activities.map((act, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">{act}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {edu.verificationStatus === 'VERIFIED' && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                        <button onClick={() => handleEditEducation(edu)} className="p-2 text-gray-400 hover:text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteEducation(edu.id)} className="p-2 text-gray-400 hover:text-red-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No education added yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Add your educational background</p>
                <button onClick={() => setShowEducationForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Education
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Certifications Tab Content */}
      {activeTab === 'certifications' && (
        <>
          {/* Certification Form */}
          {showCertForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCertId ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <form onSubmit={handleCertSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Certification Name *
                    </label>
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      value={certForm.issuingOrganization}
                      onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Credential URL
                    </label>
                    <input
                      type="url"
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={certForm.expirationDate}
                      onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })}
                      disabled={certForm.doesNotExpire}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      checked={certForm.doesNotExpire}
                      onChange={(e) => setCertForm({ ...certForm, doesNotExpire: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Does not expire</label>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Related Skills
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('cert', 'skills', newSkill, setNewSkill))}
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('cert', 'skills', newSkill, setNewSkill)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {certForm.skills?.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                        {item}
                        <button type="button" onClick={() => removeFromArray('cert', 'skills', index)} className="ml-2">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={resetCertForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : editingCertId ? 'Update' : 'Add Certification'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Certifications List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {profile?.certifications && profile.certifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{cert.issuingOrganization}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Issued: {formatDate(cert.issueDate)}
                          {cert.doesNotExpire ? ' • No Expiration' : cert.expirationDate ? ` • Expires: ${formatDate(cert.expirationDate)}` : ''}
                        </p>
                        {cert.credentialId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {cert.credentialId}</p>
                        )}
                        {cert.skills && cert.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cert.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 ml-4">
                        {cert.verificationStatus === 'VERIFIED' && (
                          <span className="text-green-600 dark:text-green-400" title="Verified">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        <button onClick={() => handleEditCert(cert)} className="text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteCert(cert.id)} className="text-gray-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Credential
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No certifications added yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Add your professional certifications</p>
                <button onClick={() => setShowCertForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Certification
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EducationHub;
