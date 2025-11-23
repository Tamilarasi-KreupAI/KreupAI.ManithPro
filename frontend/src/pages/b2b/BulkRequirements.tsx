import React, { useState } from 'react';

const BulkRequirements: React.FC = () => {
    const [requirements] = useState([
        {
            id: 1,
            title: 'Senior Java Developers',
            skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
            count: 5,
            filled: 2,
            budget: '$60-80/hr',
            duration: '12 Months',
            status: 'Active',
            postedAt: '2023-10-20',
        },
        {
            id: 2,
            title: 'DevOps Engineers',
            skills: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
            count: 2,
            filled: 0,
            budget: '$70-90/hr',
            duration: '6 Months',
            status: 'Active',
            postedAt: '2023-10-22',
        },
        {
            id: 3,
            title: 'React Frontend Lead',
            skills: ['React', 'TypeScript', 'Redux', 'GraphQL'],
            count: 1,
            filled: 0,
            budget: '$80-100/hr',
            duration: 'Permanent',
            status: 'Draft',
            postedAt: '2023-10-25',
        },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Requirements</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your bulk hiring needs and track fulfillment.
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Post New Requirement
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex gap-4 items-center">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search requirements..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <select className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Closed</option>
                </select>
            </div>

            {/* Requirements List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {requirements.map((req) => (
                        <li key={req.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-medium text-primary-600 truncate">{req.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                            <div className="flex flex-wrap gap-2">
                                                {req.skills.map((skill) => (
                                                    <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="sm:flex gap-6">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {req.filled} / {req.count} Filled
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {req.duration}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {req.budget}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Posted on {req.postedAt}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BulkRequirements;
