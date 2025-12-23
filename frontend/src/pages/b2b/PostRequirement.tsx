import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequirement } from '../../services/b2b.service';

const PostRequirement: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workMode: 'Remote',
    location: '',
    employmentType: 'Contract',
    duration: '',
    primarySkills: '',
    secondarySkills: '',
    minExperience: '',
    maxExperience: '',
    qualification: '',
    budget: '',
    currency: 'USD',
    frequency: 'Hourly',
    noticePeriod: 'Immediate',
    count: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createRequirement(formData);
      navigate('/b2b/requirements');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to post requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post New Requirement</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a detailed job requirement to find the best candidates.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Details */}
            <section>
              <h3 className="text-lg font-medium border-b pb-2 mb-4 text-gray-900 dark:text-white">
                Job Details
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option>Contract</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Work Mode</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="input"
                  >
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Duration</label>
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium">Job Description *</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </section>

            {/* Candidate Requirements */}
            <section>
              <h3 className="text-lg font-medium border-b pb-2 mb-4 text-gray-900 dark:text-white">
                Candidate Requirements
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium">Primary Skills *</label>
                  <input
                    name="primarySkills"
                    required
                    value={formData.primarySkills}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Qualification</label>
                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium">Secondary Skills</label>
                  <input
                    name="secondarySkills"
                    value={formData.secondarySkills}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Min Experience</label>
                  <input
                    type="number"
                    name="minExperience"
                    value={formData.minExperience}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Max Experience</label>
                  <input
                    type="number"
                    name="maxExperience"
                    value={formData.maxExperience}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </section>

            {/* Compensation */}
            <section>
              <h3 className="text-lg font-medium border-b pb-2 mb-4 text-gray-900 dark:text-white">
                Compensation & Terms
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  name="budget"
                  placeholder="Budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="input"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                >
                  <option>USD</option>
                  <option>INR</option>
                  <option>EUR</option>
                </select>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="input"
                >
                  <option>Hourly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
                <select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleChange}
                  className="input"
                >
                  <option>Immediate</option>
                  <option>30 Days</option>
                  <option>Any</option>
                </select>
                <input
                  type="number"
                  name="count"
                  min={1}
                  value={formData.count}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </section>

            {/* Error */}
            {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/b2b/requirements')}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? 'Posting...' : 'Post Requirement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostRequirement;
