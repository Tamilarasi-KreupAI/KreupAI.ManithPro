import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRequirements } from '../../services/b2b.service';

interface Requirement {
  id: string;
  title: string;
  skills: string[];
  count: number;
  filled: number;
  budget: string;
  duration: string;
  status: string;
  postedAt: string;
}

const BulkRequirements: React.FC = () => {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await getAllRequirements();
      setRequirements(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <p className="text-gray-500">Loading requirements...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Requirements</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your bulk hiring needs and track fulfillment.
          </p>
        </div>

        <button
          onClick={() => navigate('/b2b/requirements/new')}
          className="inline-flex items-center px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          + Post New Requirement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search requirements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
        >
          <option value="All">All Status</option>
          <option value="OPEN">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredRequirements.length === 0 ? (
            <li className="p-6 text-center text-gray-500">No requirements found</li>
          ) : (
            filteredRequirements.map((req) => (
              <li key={req.id}>
                <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-primary-600">{req.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        req.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-500">
                    <span>
                      {req.filled} / {req.count} Filled
                    </span>
                    <span>{req.duration}</span>
                    <span>{req.budget}</span>
                    <span>Posted on {new Date(req.postedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default BulkRequirements;
