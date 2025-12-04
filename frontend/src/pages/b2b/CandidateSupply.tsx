import React, { useState } from 'react';

const CandidateSupply: React.FC = () => {
    const [candidates] = useState([
        {
            id: 1,
            name: 'John Doe',
            title: 'Senior Java Developer',
            experience: '8 Years',
            skills: ['Java', 'Spring Boot', 'AWS'],
            status: 'Available',
            rate: '$75/hr',
            location: 'Remote',
        },
        {
            id: 2,
            name: 'Jane Smith',
            title: 'DevOps Specialist',
            experience: '6 Years',
            skills: ['Docker', 'Kubernetes', 'CI/CD'],
            status: 'Placed',
            rate: '$85/hr',
            location: 'New York, USA',
        },
        {
            id: 3,
            name: 'Mike Johnson',
            title: 'Frontend Developer',
            experience: '5 Years',
            skills: ['React', 'TypeScript', 'Tailwind'],
            status: 'Interviewing',
            rate: '$65/hr',
            location: 'London, UK',
        },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Pool</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your available consultants and track their status.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Bulk Upload
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Candidate
                    </button>
                </div>
            </div>

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                    <div key={candidate.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.title}</p>
                                    </div>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'Available' ? 'bg-green-100 text-green-800' :
                                        candidate.status === 'Placed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {candidate.status}
                                </span>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{candidate.experience}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{candidate.rate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{candidate.location}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map((skill) => (
                                        <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 rounded-b-lg flex justify-between items-center">
                            <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">View Profile</button>
                            <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Download CV</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateSupply;
