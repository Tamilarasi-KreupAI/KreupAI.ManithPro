import React, { useState, useEffect } from 'react';
import { jobService, JobPosting, JobStatus, EmploymentType, ExperienceLevel, WorkLocation } from '../utils/jobService';

interface JobPostingFormProps {
  jobId?: string; // If provided, edit mode
  templateId?: string; // If provided, create from template
  onSuccess?: (job: JobPosting) => void;
  onCancel?: () => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ jobId, templateId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<JobPosting>>({
    title: '',
    department: '',
    status: 'DRAFT',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    workLocation: 'HYBRID',
    location: '',
    description: '',
    responsibilities: [],
    requirements: [],
    niceToHave: [],
    skills: [],
    benefits: [],
    openings: 1,
    recruiterIds: [],
  });

  const [tempInputs, setTempInputs] = useState({
    responsibility: '',
    requirement: '',
    niceToHave: '',
    skill: '',
    benefit: '',
  });

  useEffect(() => {
    if (jobId) {
      loadJob();
    } else if (templateId) {
      loadTemplate();
    }
  }, [jobId, templateId]);

  const loadJob = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const job = await jobService.getJob(jobId);
      if (job) {
        setFormData(job);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    }
    setLoading(false);
  };

  const loadTemplate = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const job = await jobService.createJobFromTemplate(templateId);
      setFormData(job);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (status: JobStatus = 'DRAFT') => {
    // Validation
    if (!formData.title?.trim()) {
      alert('Job title is required');
      return;
    }
    if (!formData.department?.trim()) {
      alert('Department is required');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Job description is required');
      return;
    }
    if ((formData.responsibilities || []).length === 0) {
      alert('At least one responsibility is required');
      return;
    }
    if ((formData.requirements || []).length === 0) {
      alert('At least one requirement is required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = { ...formData, status } as JobPosting;

      let savedJob: JobPosting;
      if (jobId) {
        savedJob = await jobService.updateJob(jobId, dataToSave);
      } else {
        savedJob = await jobService.createJob(dataToSave);
      }

      onSuccess?.(savedJob);
    } catch (error) {
      alert('Failed to save job posting');
    }
    setSaving(false);
  };

  const addArrayItem = (field: 'responsibilities' | 'requirements' | 'niceToHave' | 'skills' | 'benefits', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
  };

  const removeArrayItem = (field: 'responsibilities' | 'requirements' | 'niceToHave' | 'skills' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {jobId ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the details below to {jobId ? 'update' : 'create'} a job posting
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department *
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g., Engineering"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Openings
            </label>
            <input
              type="number"
              min="1"
              value={formData.openings}
              onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employment Type
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Location
            </label>
            <select
              value={formData.workLocation}
              onChange={(e) => setFormData({ ...formData, workLocation: e.target.value as WorkLocation })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location {formData.workLocation !== 'REMOTE' && '*'}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              disabled={formData.workLocation === 'REMOTE'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Salary Range */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Compensation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              value={formData.salaryRange?.min || ''}
              onChange={(e) => setFormData({
                ...formData,
                salaryRange: {
                  ...formData.salaryRange,
                  min: parseInt(e.target.value) || 0,
                  max: formData.salaryRange?.max || 0,
                  currency: formData.salaryRange?.currency || 'USD',
                },
              })}
              placeholder="75000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              value={formData.salaryRange?.max || ''}
              onChange={(e) => setFormData({
                ...formData,
                salaryRange: {
                  ...formData.salaryRange,
                  min: formData.salaryRange?.min || 0,
                  max: parseInt(e.target.value) || 0,
                  currency: formData.salaryRange?.currency || 'USD',
                },
              })}
              placeholder="120000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={formData.salaryRange?.currency || 'USD'}
              onChange={(e) => setFormData({
                ...formData,
                salaryRange: {
                  ...formData.salaryRange,
                  min: formData.salaryRange?.min || 0,
                  max: formData.salaryRange?.max || 0,
                  currency: e.target.value,
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Job Description *
        </h3>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={8}
          placeholder="Describe the role, team, company culture, and what makes this opportunity unique..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Responsibilities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Responsibilities *
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tempInputs.responsibility}
            onChange={(e) => setTempInputs({ ...tempInputs, responsibility: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('responsibilities', tempInputs.responsibility);
                setTempInputs({ ...tempInputs, responsibility: '' });
              }
            }}
            placeholder="Add a responsibility..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              addArrayItem('responsibilities', tempInputs.responsibility);
              setTempInputs({ ...tempInputs, responsibility: '' });
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {formData.responsibilities?.map((item, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="flex-1 text-gray-900 dark:text-white">• {item}</span>
              <button
                onClick={() => removeArrayItem('responsibilities', index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Requirements *
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tempInputs.requirement}
            onChange={(e) => setTempInputs({ ...tempInputs, requirement: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('requirements', tempInputs.requirement);
                setTempInputs({ ...tempInputs, requirement: '' });
              }
            }}
            placeholder="Add a requirement..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              addArrayItem('requirements', tempInputs.requirement);
              setTempInputs({ ...tempInputs, requirement: '' });
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {formData.requirements?.map((item, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="flex-1 text-gray-900 dark:text-white">• {item}</span>
              <button
                onClick={() => removeArrayItem('requirements', index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Nice to Have */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Nice to Have
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tempInputs.niceToHave}
            onChange={(e) => setTempInputs({ ...tempInputs, niceToHave: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('niceToHave', tempInputs.niceToHave);
                setTempInputs({ ...tempInputs, niceToHave: '' });
              }
            }}
            placeholder="Add a nice-to-have qualification..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              addArrayItem('niceToHave', tempInputs.niceToHave);
              setTempInputs({ ...tempInputs, niceToHave: '' });
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {formData.niceToHave?.map((item, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="flex-1 text-gray-900 dark:text-white">• {item}</span>
              <button
                onClick={() => removeArrayItem('niceToHave', index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Required Skills
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tempInputs.skill}
            onChange={(e) => setTempInputs({ ...tempInputs, skill: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('skills', tempInputs.skill);
                setTempInputs({ ...tempInputs, skill: '' });
              }
            }}
            placeholder="Add a skill..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              addArrayItem('skills', tempInputs.skill);
              setTempInputs({ ...tempInputs, skill: '' });
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills?.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
            >
              {skill}
              <button
                onClick={() => removeArrayItem('skills', index)}
                className="hover:text-primary-900 dark:hover:text-primary-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Benefits & Perks
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tempInputs.benefit}
            onChange={(e) => setTempInputs({ ...tempInputs, benefit: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('benefits', tempInputs.benefit);
                setTempInputs({ ...tempInputs, benefit: '' });
              }
            }}
            placeholder="Add a benefit..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              addArrayItem('benefits', tempInputs.benefit);
              setTempInputs({ ...tempInputs, benefit: '' });
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.benefits?.map((benefit, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm"
            >
              {benefit}
              <button
                onClick={() => removeArrayItem('benefits', index)}
                className="hover:text-green-900 dark:hover:text-green-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('ACTIVE')}
            disabled={saving}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              `${jobId ? 'Update &' : ''} Publish Job`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;
