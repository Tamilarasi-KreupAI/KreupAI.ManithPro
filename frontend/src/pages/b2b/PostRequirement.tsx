import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting requirement:', formData);
        // Simulate success
        setTimeout(() => {
            navigate('/b2b/requirements');
        }, 500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                    Post New Requirement
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create a detailed job requirement to find the best candidates.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Job Details */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                                Job Details
                            </h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="sm:col-span-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Job Title *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Employment Type
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="employmentType"
                                            name="employmentType"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.employmentType}
                                            onChange={handleChange}
                                        >
                                            <option>Contract</option>
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Freelance</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="workMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Work Mode
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="workMode"
                                            name="workMode"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.workMode}
                                            onChange={handleChange}
                                        >
                                            <option>Remote</option>
                                            <option>Hybrid</option>
                                            <option>Onsite</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Location
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="location"
                                            id="location"
                                            placeholder="e.g. New York, NY"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Duration (if Contract)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="duration"
                                            id="duration"
                                            placeholder="e.g. 6 months"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.duration}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Job Description *
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            required
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Candidate Requirements */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                                Candidate Requirements
                            </h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="sm:col-span-3 lg:col-span-2">
                                    <label htmlFor="primarySkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Primary Skills * (comma separated)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="primarySkills"
                                            id="primarySkills"
                                            required
                                            placeholder="e.g. React, Node.js, AWS"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.primarySkills}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3 lg:col-span-1">
                                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Qualification
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="qualification"
                                            id="qualification"
                                            placeholder="e.g. B.Tech, MCA"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="secondarySkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Secondary Skills (Good to have)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="secondarySkills"
                                            id="secondarySkills"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.secondarySkills}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="minExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Min Experience (Years)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="minExperience"
                                            id="minExperience"
                                            min="0"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.minExperience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="maxExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Max Experience (Years)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="maxExperience"
                                            id="maxExperience"
                                            min="0"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.maxExperience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Compensation & Terms */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                                Compensation & Terms
                            </h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Budget / Rate
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="budget"
                                            id="budget"
                                            placeholder="e.g. 50-60"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.budget}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Currency
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="currency"
                                            name="currency"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.currency}
                                            onChange={handleChange}
                                        >
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                            <option>INR</option>
                                            <option>AUD</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Frequency
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="frequency"
                                            name="frequency"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.frequency}
                                            onChange={handleChange}
                                        >
                                            <option>Hourly</option>
                                            <option>Daily</option>
                                            <option>Monthly</option>
                                            <option>Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notice Period Preference
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="noticePeriod"
                                            name="noticePeriod"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.noticePeriod}
                                            onChange={handleChange}
                                        >
                                            <option>Immediate</option>
                                            <option>Less than 15 days</option>
                                            <option>Less than 30 days</option>
                                            <option>30-60 days</option>
                                            <option>Any</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Number of Positions
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="count"
                                            id="count"
                                            min="1"
                                            required
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.count}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5">
                            <button
                                type="button"
                                onClick={() => navigate('/b2b/requirements')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Post Requirement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostRequirement;
