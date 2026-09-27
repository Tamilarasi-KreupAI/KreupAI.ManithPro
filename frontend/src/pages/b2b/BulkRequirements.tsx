import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpenRequirements, getAllRequirements, deleteRequirement } from '../../services/b2b.service';
import { useAuth } from '../../context/AuthContext';
interface Requirement {
  id: string;
  title: string;
  description?: string;
  workMode?: string;
  location?: string;
  employmentType?: string;
  duration?: string;
  skills: string[];
  secondarySkills?: string[];
  minExperience?: number;
  maxExperience?: number;
  qualification?: string;
  budget: string;
  currency?: string;
  frequency?: string;
  noticePeriod?: string;
  count: number;
  filled: number;
  status: string;
  postedAt: string;
}

const BulkRequirements: React.FC = () => {
  const { user } = useAuth();  
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const res = user?.role === 'VENDOR'
        ? await getOpenRequirements()
        : await getAllRequirements();
      const data = Array.isArray(res) ? res : res?.data || [];
      setRequirements(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (req: Requirement) => {
    setSelectedRequirement(req);
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/b2b/requirements/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequirement(id);
      setRequirements(requirements.filter(req => req.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete requirement');
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">{req.title}</h3>
                      {req.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{req.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${req.status === 'OPEN'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : req.status === 'DRAFT'
                              ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {req.filled} / {req.count} Filled
                    </span>
                    {req.duration && <span>{req.duration}</span>}

                    {/* View Details Modal */}
                    {showModal && selectedRequirement && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mt-15">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRequirement.title}</h2>
                              <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Work Mode</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.workMode}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.location}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Employment Type</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.employmentType}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Duration</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.duration}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Experience</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.minExperience} - {selectedRequirement.maxExperience} years</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Qualification</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.qualification}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Budget</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.budget} / {selectedRequirement.frequency}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Notice Period</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.noticePeriod}</p>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Primary Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRequirement.skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {selectedRequirement.secondarySkills && selectedRequirement.secondarySkills.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secondary Skills</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedRequirement.secondarySkills.map((skill, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Positions Required</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.count}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Positions Filled</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedRequirement.filled}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                              <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => {
                                  setShowModal(false);
                                  handleEdit(selectedRequirement.id);
                                }}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                              >
                                Edit Requirement
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete this requirement? This action cannot be undone.
                          </p>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(deleteConfirm)}
                              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <span>{req.budget}</span>
                    {req.location && <span>📍 {req.location}</span>}
                    {req.workMode && <span>💼 {req.workMode}</span>}
                    <span>Posted on {new Date(req.postedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleView(req)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(req.id)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(req.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Delete
                    </button>
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
