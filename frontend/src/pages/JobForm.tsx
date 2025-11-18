import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import type { JobType, JobStatus } from '../types';

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
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
    if (isEdit) {
      loadJob();
    }
  }, [id]);

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
      alert('Failed to load job details');
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
      alert('Please fill in all required fields');
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
        alert('Job updated successfully!');
      } else {
        await jobAPI.create(payload);
        alert('Job posted successfully!');
      }
      navigate('/jobs');
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'post'} job`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Job' : 'Post New Job'}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Senior React Developer"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe the role, team, and what makes this opportunity great..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., New York, NY or Remote"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 3-5 years"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor's Degree"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Positions
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Salary Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Text)
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $120,000"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="80000"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="120000"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
            <div className="flex gap-2 mb-3">
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
                placeholder="Add a skill..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('skills', skillInput)) {
                    setSkillInput('');
                  }
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('skills', index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <div className="flex gap-2 mb-3">
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
                className="flex-1 border border-gray-300 rounded-md px-4 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('requirements', requirementInput)) {
                    setRequirementInput('');
                  }
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {formData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                  <span className="flex-1">{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('requirements', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
            <div className="flex gap-2 mb-3">
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
                className="flex-1 border border-gray-300 rounded-md px-4 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('responsibilities', responsibilityInput)) {
                    setResponsibilityInput('');
                  }
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {formData.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                  <span className="flex-1">{resp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('responsibilities', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Benefits</h2>
            <div className="flex gap-2 mb-3">
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
                className="flex-1 border border-gray-300 rounded-md px-4 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (handleAddItem('benefits', benefitInput)) {
                    setBenefitInput('');
                  }
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('benefits', index)}
                    className="text-green-600 hover:text-green-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., TechCorp Inc."
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell candidates about your company, culture, and mission..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <input
                    type="text"
                    name="companyIndustry"
                    value={formData.companyIndustry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-semibold"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
