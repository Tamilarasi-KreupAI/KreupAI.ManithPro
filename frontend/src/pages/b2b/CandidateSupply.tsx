import React, { useEffect, useState } from 'react';
import {
  getVendorCandidates,
  addCandidate,
  downloadCandidateResume,
  getCandidateProfile,
} from '../../services/b2b.service';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  experience: number | null;
  skills: string[];
  status: 'AVAILABLE' | 'INTERVIEWING' | 'PLACED';
  resumeUrl?: string;
}

const CandidateSupply: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add candidate modal
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getVendorCandidates();
      setCandidates(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      setProfileLoading(true);
      const data = await getCandidateProfile(id);
      setSelectedCandidate(data);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    const blob = await downloadCandidateResume(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-${id}-resume.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleAddCandidate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      alert('First name, last name, and email are required');
      return;
    }
    try {
      setSubmitting(true);
      await addCandidate({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      });
      setShowAdd(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        experience: '',
        skills: '',
      });
      loadCandidates();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add candidate');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading candidates...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Pool</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your available consultants and track their status.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          + Add Candidate
        </button>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">Candidate Profile</h2>

            {profileLoading ? (
              <p className="text-gray-500">Loading profile...</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Name:</strong> {selectedCandidate.firstName} {selectedCandidate.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedCandidate.email}
                </div>
                {selectedCandidate.phone && (
                  <div>
                    <strong>Phone:</strong> {selectedCandidate.phone}
                  </div>
                )}
                <div>
                  <strong>Experience:</strong> {selectedCandidate.experience ?? 'N/A'} years
                </div>
                <div>
                  <strong>Status:</strong> {selectedCandidate.status}
                </div>

                <div>
                  <strong>Skills:</strong>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{c.firstName} {c.lastName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.email}</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    c.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-800'
                      : c.status === 'PLACED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-4 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <div>Experience: {c.experience ?? 'N/A'} years</div>
                {c.phone && <div>Phone: {c.phone}</div>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {c.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-between">
              <button
                onClick={() => handleViewProfile(c.id)}
                className="text-sm text-primary-600 hover:underline"
              >
                View Profile
              </button>
              <button
                onClick={() => handleDownload(c.id)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
              >
                Download CV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Candidate Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Add Candidate</h2>

            <div className="space-y-3">
              <input
                placeholder="First Name *"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Last Name *"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Experience (years)"
                type="number"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Skills (comma separated)"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleAddCandidate}
                className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSupply;
