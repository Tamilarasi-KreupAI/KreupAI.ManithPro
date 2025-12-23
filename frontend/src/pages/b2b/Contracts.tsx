import React, { useEffect, useState } from 'react';
import {
  getAllContracts,
  viewContract,
  downloadContract,
  createDraftContract,
} from '../../services/b2b.service';

interface Contract {
  id: string;
  partner: string;
  candidate: string;
  role: string;
  startDate: string;
  duration: string;
  rate: string;
  status: string;
  signedAt: string | null;
}

const Contracts: React.FC = () => {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftForm, setDraftForm] = useState({
    partnerName: '',
    role: '',
    vendorId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      setContracts(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      setSubmitting(true);
      await createDraftContract(draftForm);
      setShowDraftModal(false);
      setDraftForm({ partnerName: '', role: '', vendorId: '' });
      loadContracts(); // refresh list
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id: string) => {
    const data = await viewContract(id);
    setSelectedContract(data);
  };
  const handleDownload = async (id: string) => {
    const blob = await downloadContract(id);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) {
    return <p className="text-gray-500">Loading contracts...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contracts & Agreements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your contracts, NDAs, and service agreements securely.
          </p>
        </div>

        <button
          onClick={() => setShowDraftModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          + Draft New Contract
        </button>
      </div>

      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Draft New Contract</h2>

            <div className="space-y-4">
              <input
                placeholder="Partner Company Name"
                value={draftForm.partnerName}
                onChange={(e) => setDraftForm({ ...draftForm, partnerName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />

              <input
                placeholder="Role / Position"
                value={draftForm.role}
                onChange={(e) => setDraftForm({ ...draftForm, role: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />

              <input
                placeholder="Vendor User ID"
                value={draftForm.vendorId}
                onChange={(e) => setDraftForm({ ...draftForm, vendorId: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDraftModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleCreateDraft}
                className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Contract ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Partner & Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Terms</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No contracts found
                </td>
              </tr>
            ) : (
              contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">{contract.id}</td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {contract.partner}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{contract.role}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{contract.rate}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contract.duration}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        contract.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {contract.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleView(contract.id)}
                      className="text-primary-600 hover:underline mr-4"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDownload(contract.id)}
                      className="text-gray-600 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
            {selectedContract && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
                  <h2 className="text-lg font-bold mb-4">Contract Preview</h2>
                  <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedContract.content}
                  </pre>
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => setSelectedContract(null)}
                      className="px-4 py-2 bg-primary-600 text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contracts;
