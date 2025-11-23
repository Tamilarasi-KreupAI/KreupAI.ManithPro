import React, { useState } from 'react';

const Contracts: React.FC = () => {
    const [contracts] = useState([
        {
            id: 'CNT-2023-001',
            partner: 'TechSolutions Inc.',
            candidate: 'John Doe',
            role: 'Senior Java Developer',
            startDate: '2023-11-01',
            duration: '12 Months',
            rate: '$75/hr',
            status: 'Active',
            signedAt: '2023-10-25',
        },
        {
            id: 'CNT-2023-002',
            partner: 'InnovateSoft',
            candidate: 'Jane Smith',
            role: 'DevOps Specialist',
            startDate: '2023-11-15',
            duration: '6 Months',
            rate: '$85/hr',
            status: 'Pending Signature',
            signedAt: null,
        },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contracts & Agreements</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your contracts, NDAs, and service agreements securely.
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Draft New Contract
                </button>
            </div>

            {/* Contracts Table */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Contract ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Partner & Candidate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Terms
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {contracts.map((contract) => (
                            <tr key={contract.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                    {contract.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{contract.partner}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{contract.candidate} ({contract.role})</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{contract.rate}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{contract.duration} • Starts {contract.startDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {contract.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 mr-4">View</button>
                                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contracts;
