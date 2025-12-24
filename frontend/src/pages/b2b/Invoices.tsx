import React, { useEffect, useState } from 'react';
import {
  getInvoices,
  createInvoice,
  payInvoice,
  downloadInvoice,
} from '../../services/b2b.service';

interface Invoice {
  id: string;
  partner: string;
  amount: string;
  dueDate: string;
  status: 'PAID' | 'UNPAID';
  items: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create invoice modal
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vendorId: '',
    partnerName: '',
    amount: '',
    dueDate: '',
    items: '',
  });

  useEffect(() => {
    loadInvoices();
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

  const handleCreateInvoice = async () => {
    if (!form.vendorId || !form.amount || !form.dueDate) {
      alert('Vendor, amount and due date are required');
      return;
    }

    try {
      setSubmitting(true);
      await createInvoice({
        vendorId: form.vendorId,
        partnerName: form.partnerName,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        items: form.items,
      });

      setShowCreate(false);
      setForm({
        vendorId: '',
        partnerName: '',
        amount: '',
        dueDate: '',
        items: '',
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
              <th className="px-6 py-3 text-left text-xs font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 font-medium text-primary-600">{inv.id}</td>
                <td className="px-6 py-4">
                  <div>{inv.partner}</div>
                  <div className="text-xs text-gray-500">{inv.items}</div>
                </td>
                <td className="px-6 py-4 font-bold">{inv.amount}</td>
                <td className="px-6 py-4">{inv.dueDate}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      inv.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {inv.status === 'UNPAID' && (
                    <button onClick={() => handlePay(inv.id)} className="text-primary-600 mr-4">
                      Pay Now
                    </button>
                  )}
                  <button onClick={() => handleDownload(inv.id)} className="text-gray-600">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Create Invoice</h2>

            <div className="space-y-3">
              <input
                placeholder="Vendor User ID"
                value={form.vendorId}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Partner Name"
                value={form.partnerName}
                onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Invoice Items / Description"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
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
