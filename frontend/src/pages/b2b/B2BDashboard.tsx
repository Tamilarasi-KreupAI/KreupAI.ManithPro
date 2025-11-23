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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {isVendor ? 'Vendor Dashboard' : 'Client Dashboard'}
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your {isVendor ? 'consultants and placements' : 'requirements and contracts'}</p>
                </div>
                <div className="flex space-x-3">
                    {!isVendor && (
                        <Link
                            to="/b2b/requirements/new"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
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
                            className="inline-flex items-center px-6 py-3 border border-slate-200 text-sm font-medium rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-all hover:-translate-y-0.5"
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-100">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                            <div className="text-sm">
                                <span
                                    className={`font-medium ${item.changeType === 'increase'
                                        ? 'text-green-600'
                                        : item.changeType === 'warning'
                                            ? 'text-yellow-600'
                                            : 'text-slate-500'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Requirements / Placements */}
                <div className="bg-white shadow-sm rounded-xl border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-lg leading-6 font-bold text-slate-900">
                            {isVendor ? 'Recent Placements' : 'Recent Requirements'}
                        </h3>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {[
                            { title: 'Senior Java Developers', count: 5, status: 'Active', applicants: 12 },
                            { title: 'DevOps Engineers', count: 2, status: 'Active', applicants: 8 },
                            { title: 'React Frontend Lead', count: 1, status: 'Draft', applicants: 0 },
                        ].map((req, idx) => (
                            <li key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-blue-600 truncate">{req.title}</div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${req.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-slate-500">
                                            {isVendor ? `Placed: ${req.count}` : `Required: ${req.count}`}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                                        <p>{req.applicants} {isVendor ? 'Candidates Submitted' : 'Candidates Proposed'}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-slate-50 px-6 py-4 rounded-b-xl border-t border-slate-100">
                        <div className="text-sm">
                            <Link to="/b2b/requirements" className="font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                View all {isVendor ? 'placements' : 'requirements'} <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pending Contracts */}
                <div className="bg-white shadow-sm rounded-xl border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-lg leading-6 font-bold text-slate-900">Pending Contracts</h3>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {[
                            { partner: isVendor ? 'Client A' : 'TechSolutions Inc.', role: 'Java Developer', status: 'Waiting for Signature', date: '2023-10-25' },
                            { partner: isVendor ? 'Client B' : 'InnovateSoft', role: 'DevOps Engineer', status: 'In Negotiation', date: '2023-10-24' },
                        ].map((contract, idx) => (
                            <li key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-900">{contract.partner}</div>
                                    <div className="text-sm text-slate-500">{contract.date}</div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="text-sm text-slate-500">{contract.role}</div>
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${contract.status === 'Waiting for Signature' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                        {contract.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-slate-50 px-6 py-4 rounded-b-xl border-t border-slate-100">
                        <div className="text-sm">
                            <Link to="/b2b/contracts" className="font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                View all contracts <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default B2BDashboard;
