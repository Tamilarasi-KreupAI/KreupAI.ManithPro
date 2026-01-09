import React, { useEffect, useState } from 'react';
import {
  getInvoices,
  createInvoice,
  payInvoice,
  downloadInvoice,
  getVendors,
  getAllContracts,
} from '../../services/b2b.service';

interface Invoice {
  id: string;
  invoiceNo: string;
  partner: string;
  amount: string;
  dueDate: string;
  status: 'PAID' | 'PENDING';
  contractId: string | null;
  contractName: string;
  isClient: boolean;
  isVendor: boolean;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface Contract {
  id: string;
  partner: string;
  role: string;
  status: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create invoice modal
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vendorId: '',
    amount: '',
    dueDate: '',
    contractId: '',
  });

  useEffect(() => {
    loadInvoices();
    loadVendors();
    loadContracts();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
    }
  };

  const loadContracts = async () => {
    try {
      const data = await getAllContracts();
      // Only show ACTIVE contracts for invoicing
      setContracts(data.filter((c: Contract) => c.status === 'ACTIVE'));
    } catch (err: any) {
      console.error('Failed to load contracts:', err);
    }
  };

  const handleCreateInvoice = async () => {
    if (!form.vendorId || !form.amount || !form.dueDate) {
      alert('Vendor, amount and due date are required');
      return;
    }

    try {
      setSubmitting(true);
      await createInvoice({
        vendorId: form.vendorId,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        contractId: form.contractId || undefined,
      });

      setShowCreate(false);
      setForm({
        vendorId: '',
        amount: '',
        dueDate: '',
        contractId: '',
      });

      loadInvoices();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (id: string) => {
    await payInvoice(id);
    loadInvoices();
  };

  const handleDownload = async (id: string) => {
    const blob = await downloadInvoice(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.txt`;
    a.click();
    a.remove();
  };

  if (loading) return <p className="text-gray-500">Loading invoices...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Payments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your outgoing and incoming payments.
          </p>
        </div>

        {/* CREATE INVOICE BUTTON (UNCHANGED) */}
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          + Create Invoice
        </button>
      </div>

      {/* TABLE (UNCHANGED STRUCTURE) */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Contract</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 font-medium text-primary-600">{inv.invoiceNo || inv.id}</td>
                  <td className="px-6 py-4">
                    <div>{inv.partner}</div>
                    <div className="text-xs text-gray-500">
                      {inv.isClient ? 'Billed to Vendor' : 'Received from Client'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.contractName}</td>
                  <td className="px-6 py-4 font-bold">{inv.amount}</td>
                  <td className="px-6 py-4">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        inv.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Vendor can pay pending invoices */}
                    {inv.isVendor && inv.status === 'PENDING' && (
                      <button onClick={() => handlePay(inv.id)} className="text-green-600 hover:underline">
                        Pay Now
                      </button>
                    )}
                    <button onClick={() => handleDownload(inv.id)} className="text-gray-600 hover:underline">
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Create Invoice</h2>

            <div className="space-y-3">
              <select
                value={form.vendorId}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
              >
                <option value="">Select Vendor *</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>

              <select
                value={form.contractId}
                onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
              >
                <option value="">Select Contract (Optional)</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.partner} - {contract.role}
                  </option>
                ))}
              </select>

              <input
                placeholder="Amount *"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />

              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleCreateInvoice}
                className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
