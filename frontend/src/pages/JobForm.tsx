import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI, recruiterProfileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { JobType, JobStatus } from '../types';

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEdit = !!id;
  const isRecruiter = user?.role === 'RECRUITER';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    location: '',
    type: 'FULL_TIME' as JobType,
    salary: '',
    salaryMin: '',
    salaryMax: '',
    benefits: [] as string[],
    skills: [] as string[],
    experience: '',
    education: '',
    status: 'OPEN' as JobStatus,
    positions: 1,
    deadline: '',
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyLogo: '',
    companySize: '',
    companyIndustry: '',
  });

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load recruiter profile first to pre-fill company info
      if (isRecruiter) {
        await loadRecruiterProfile();
      }

      // If editing, load job details (will override company info with job-specific data)
      if (isEdit) {
        await loadJob();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecruiterProfile = async () => {
    try {
      const profile = await recruiterProfileAPI.getProfile();
      // Pre-fill company information from recruiter profile
      setFormData((prev) => ({
        ...prev,
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companySize: profile.companySize || '',
        companyIndustry: profile.industry || '',
        companyDescription: profile.companyDescription || '',
      }));
    } catch (error) {
      console.error('Failed to load recruiter profile:', error);
      // Non-critical error, continue with empty company fields
    }
  };

  const loadJob = async () => {
    try {
      const job = await jobAPI.getById(id!);
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        location: job.location,
        type: job.type,
        salary: job.salary || '',
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        benefits: job.benefits || [],
        skills: job.skills || [],
        experience: job.experience || '',
        education: job.education || '',
        status: job.status,
        positions: job.positions,
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        companyName: job.companyName,
        companyDescription: job.companyDescription || '',
        companyWebsite: job.companyWebsite || '',
        companyLogo: job.companyLogo || '',
        companySize: job.companySize || '',
        companyIndustry: job.companyIndustry || '',
      });
    } catch (error) {
      console.error('Failed to load job:', error);
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'positions' ? parseInt(value) || 1 : value,
    }));
  };

  const handleAddItem = (field: 'skills' | 'requirements' | 'responsibilities' | 'benefits', value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      return true;
    }
    return false;
  };

  const handleRemoveItem = (field: 'skills' | 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.location || !formData.companyName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        deadline: formData.deadline || undefined,
      };

      if (isEdit) {
        await jobAPI.update(id!, payload);
        toast.success('Job updated successfully!');
      } else {
        await jobAPI.create(payload);
        toast.success('Job posted successfully!');
      }
      navigate('/jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'post'} job`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900  transition-colors relative overflow-hidden pt-20">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-800 dark:to-transparent -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Job Posting' : 'Post a New Job'}</h1>
          <p className="mt-2 text-slate-500 dark:text-gray-400">
            Create a compelling job post to attract the best talent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📝</span> Job Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Senior React Developer"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe the role, team, and what makes this opportunity great..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., New York, NY or Remote"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Job Type *
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-gray-500">▼</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 3-5 years"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor's Degree"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Number of Positions
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-gray-500">▼</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span> Salary & Compensation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Salary Range (Text)
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $120,000"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Min Salary ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="80000"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Max Salary ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="120000"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Required Skills
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddItem('skills', skillInput)) {
                      setSkillInput('');
                    }
                  }
                }}
                placeholder="Add a skill (e.g. React, TypeScript)..."
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('skills', skillInput)) {
                    setSkillInput('');
                  }
                }}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('skills', index)}
                    className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-slate-400 dark:text-gray-500 text-sm italic">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span> Requirements
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddItem('requirements', requirementInput)) {
                      setRequirementInput('');
                    }
                  }
                }}
                placeholder="Add a requirement..."
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('requirements', requirementInput)) {
                    setRequirementInput('');
                  }
                }}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Add
              </button>
            </div>
            <ul className="space-y-3">
              {formData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-gray-700/50 p-4 rounded-xl border border-slate-100 dark:border-gray-600 group">
                  <span className="flex-1 text-slate-700 dark:text-gray-300">{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('requirements', index)}
                    className="text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {formData.requirements.length === 0 && (
                <p className="text-slate-400 dark:text-gray-500 text-sm italic">No requirements added yet</p>
              )}
            </ul>
          </div>

          {/* Responsibilities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Responsibilities
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddItem('responsibilities', responsibilityInput)) {
                      setResponsibilityInput('');
                    }
                  }
                }}
                placeholder="Add a responsibility..."
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('responsibilities', responsibilityInput)) {
                    setResponsibilityInput('');
                  }
                }}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Add
              </button>
            </div>
            <ul className="space-y-3">
              {formData.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-gray-700/50 p-4 rounded-xl border border-slate-100 dark:border-gray-600 group">
                  <span className="flex-1 text-slate-700 dark:text-gray-300">{resp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('responsibilities', index)}
                    className="text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {formData.responsibilities.length === 0 && (
                <p className="text-slate-400 dark:text-gray-500 text-sm italic">No responsibilities added yet</p>
              )}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎁</span> Benefits & Perks
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (handleAddItem('benefits', benefitInput)) {
                      setBenefitInput('');
                    }
                  }
                }}
                placeholder="Add a benefit..."
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('benefits', benefitInput)) {
                    setBenefitInput('');
                  }
                }}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-100 dark:border-green-800 flex items-center gap-2"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('benefits', index)}
                    className="text-green-400 dark:text-green-500 hover:text-green-600 dark:hover:text-green-300 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.benefits.length === 0 && (
                <p className="text-slate-400 dark:text-gray-500 text-sm italic">No benefits added yet</p>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🏢</span> Company Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., TechCorp Inc."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell candidates about your company, culture, and mission..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                    Company Size
                  </label>
                  <div className="relative">
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-gray-500">▼</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    name="companyIndustry"
                    value={formData.companyIndustry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Job Posting' : 'Post Job Now'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-8 py-4 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-600 font-bold text-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
