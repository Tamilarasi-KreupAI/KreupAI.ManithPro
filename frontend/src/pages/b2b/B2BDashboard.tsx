import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const B2BDashboard: React.FC = () => {
    const { user } = useAuth();
    const isVendor = user?.role === 'BUSINESS_VENDOR';

    // Client Stats (Requirements focused)
    const clientStats = [
        { name: 'Active Requirements', value: '12', change: '+2', changeType: 'increase', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Proposals Received', value: '45', change: '+12', changeType: 'increase', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Interviews Scheduled', value: '8', change: 'Next: Today 2PM', changeType: 'neutral', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Pending Invoices', value: '$12,450', change: 'Due in 5 days', changeType: 'warning', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    // Vendor Stats (Supply focused)
    const vendorStats = [
        { name: 'Active Consultants', value: '48', change: '+3', changeType: 'increase', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Pending Placements', value: '5', change: 'Action Required', changeType: 'warning', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Interviews', value: '12', change: '+4 this week', changeType: 'increase', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Revenue (MTD)', value: '$45,200', change: '+8% vs last month', changeType: 'increase', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    const stats = isVendor ? vendorStats : clientStats;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isVendor ? 'Vendor Dashboard' : 'Client Dashboard'}
                </h1>
                <div className="flex space-x-3">
                    {!isVendor && (
                        <Link
                            to="/b2b/requirements/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Post Requirement
                        </Link>
                    )}
                    {isVendor && (
                        <Link
                            to="/b2b/supply/upload"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload Profiles
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900 dark:text-white">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                            <div className="text-sm">
                                <span
                                    className={`font-medium ${item.changeType === 'increase'
                                        ? 'text-green-600'
                                        : item.changeType === 'warning'
                                            ? 'text-yellow-600'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    {item.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Requirements / Placements */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {isVendor ? 'Recent Placements' : 'Recent Requirements'}
                        </h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[
                            { title: 'Senior Java Developers', count: 5, status: 'Active', applicants: 12 },
                            { title: 'DevOps Engineers', count: 2, status: 'Active', applicants: 8 },
                            { title: 'React Frontend Lead', count: 1, status: 'Draft', applicants: 0 },
                        ].map((req, idx) => (
                            <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-primary-600 truncate">{req.title}</div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            {isVendor ? `Placed: ${req.count}` : `Required: ${req.count}`}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                        <p>{req.applicants} {isVendor ? 'Candidates Submitted' : 'Candidates Proposed'}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6 rounded-b-lg">
                        <div className="text-sm">
                            <Link to="/b2b/requirements" className="font-medium text-primary-600 hover:text-primary-500">
                                View all {isVendor ? 'placements' : 'requirements'} <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pending Contracts */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Pending Contracts</h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[
                            { partner: isVendor ? 'Client A' : 'TechSolutions Inc.', role: 'Java Developer', status: 'Waiting for Signature', date: '2023-10-25' },
                            { partner: isVendor ? 'Client B' : 'InnovateSoft', role: 'DevOps Engineer', status: 'In Negotiation', date: '2023-10-24' },
                        ].map((contract, idx) => (
                            <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{contract.partner}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{contract.date}</div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{contract.role}</div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === 'Waiting for Signature' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {contract.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6 rounded-b-lg">
                        <div className="text-sm">
                            <Link to="/b2b/contracts" className="font-medium text-primary-600 hover:text-primary-500">
                                View all contracts <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default B2BDashboard;
