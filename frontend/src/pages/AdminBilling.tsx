import { useEffect, useState } from 'react';
import {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  getSubscriptionStats,
  getAllPayments,
  getPaymentStats,
  getAllInvoices,
  generateInvoice,
  markInvoiceAsPaid,
  getBillingRevenueAnalytics,
  exportBillingData,
} from '../services/admin.service';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  price: number;
  billingCycle: string;
  userId?: string;
  companyId?: string;
  features?: any;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  subscriptionId: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  subscriptionId: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  cancelled: number;
  expired: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  successRate: number;
  avgTransactionValue: number;
}

interface RevenueAnalytics {
  revenue: Array<{ date: string; amount: number }>;
  byPlan: Array<{ plan: string; revenue: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

const AdminBilling = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [subscriptionPage, setSubscriptionPage] = useState(1);

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [paymentPage, setPaymentPage] = useState(1);

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicePage, setInvoicePage] = useState(1);

  // Analytics
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');

  // Filters
  const [subscriptionStatus, setSubscriptionStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [invoiceStatus, setInvoiceStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab, subscriptionPage, paymentPage, invoicePage, subscriptionStatus, paymentStatus, invoiceStatus]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [analyticsPeriod, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview' || activeTab === 'subscriptions') {
        const statsData = await getSubscriptionStats();
        setSubscriptionStats(statsData);

        const subData = await getAllSubscriptions({
          page: subscriptionPage,
          limit: 10,
          status: subscriptionStatus !== 'all' ? subscriptionStatus : undefined,
        });
        setSubscriptions(subData.subscriptions || subData);
      }

      if (activeTab === 'overview' || activeTab === 'payments') {
        const payStatsData = await getPaymentStats(analyticsPeriod);
        setPaymentStats(payStatsData);

        const payData = await getAllPayments({
          page: paymentPage,
          limit: 10,
          status: paymentStatus !== 'all' ? paymentStatus : undefined,
        });
        setPayments(payData.payments || payData);
      }

      if (activeTab === 'overview' || activeTab === 'invoices') {
        const invData = await getAllInvoices({
          page: invoicePage,
          limit: 10,
          status: invoiceStatus !== 'all' ? invoiceStatus : undefined,
        });
        setInvoices(invData.invoices || invData);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analytics = await getBillingRevenueAnalytics(analyticsPeriod);
      setRevenueAnalytics(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      const reason = prompt('Please provide a cancellation reason:');
      await cancelSubscription(id, reason || undefined);
      alert('Subscription cancelled successfully');
      loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    const paymentId = prompt('Enter payment ID:');
    const amount = prompt('Enter paid amount:');

    if (!paymentId || !amount) return;

    try {
      await markInvoiceAsPaid(invoiceId, paymentId, parseFloat(amount));
      alert('Invoice marked as paid successfully');
      loadData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid');
    }
  };

  const handleExportBillingData = async () => {
    try {
      const format = prompt('Export format (csv/xlsx/pdf):', 'csv');
      if (!format) return;

      await exportBillingData({
        format: format as 'csv' | 'xlsx' | 'pdf',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      alert('Export initiated successfully');
    } catch (error) {
      console.error('Error exporting billing data:', error);
      alert('Failed to export billing data');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIAL: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
            <p className="text-gray-600 mt-2">Manage subscriptions, payments, and invoices</p>
          </div>
          <button
            onClick={handleExportBillingData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export Data
          </button>
        </div>

        {/* Stats Overview */}
        {subscriptionStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptionStats.total}</p>
                  <p className="text-sm text-green-600 mt-1">{subscriptionStats.active} active</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">This Month Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(subscriptionStats.revenueThisMonth)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    vs {formatCurrency(subscriptionStats.revenueLastMonth)} last month
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Trial Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptionStats.trial}</p>
                  <p className="text-sm text-gray-600 mt-1">Potential conversions</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>

            {paymentStats && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{paymentStats.successRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Avg: {formatCurrency(paymentStats.avgTransactionValue)}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
                { id: 'payments', label: 'Payments', icon: '💰' },
                { id: 'invoices', label: 'Invoices', icon: '📄' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Recent Subscriptions</h4>
                      {subscriptions.slice(0, 5).map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{sub.plan}</p>
                            <p className="text-sm text-gray-600">{formatDate(sub.startDate)}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span>{formatCurrency(sub.price)}/{sub.billingCycle}</span>
                            {getStatusBadge(sub.status)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Recent Payments</h4>
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{payment.method}</p>
                            <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span>{formatCurrency(payment.amount, payment.currency)}</span>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">All Subscriptions</h3>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Cycle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{sub.plan}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(sub.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{sub.billingCycle}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(sub.startDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {sub.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleCancelSubscription(sub.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSubscriptionPage(Math.max(1, subscriptionPage - 1))}
                    disabled={subscriptionPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {subscriptionPage}</span>
                  <button
                    onClick={() => setSubscriptionPage(subscriptionPage + 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">All Payments</h3>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{payment.transactionId || payment.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{payment.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPaymentPage(Math.max(1, paymentPage - 1))}
                    disabled={paymentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {paymentPage}</span>
                  <button
                    onClick={() => setPaymentPage(paymentPage + 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">All Invoices</h3>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{invoice.invoiceNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(invoice.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(invoice.tax)}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(invoice.total)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {invoice.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Mark as Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setInvoicePage(Math.max(1, invoicePage - 1))}
                    disabled={invoicePage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {invoicePage}</span>
                  <button
                    onClick={() => setInvoicePage(invoicePage + 1)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                  <select
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>

                {revenueAnalytics && (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Revenue by Plan</h4>
                      <div className="space-y-3">
                        {revenueAnalytics.byPlan?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{item.plan}</span>
                            <span className="text-lg font-bold">{formatCurrency(item.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Subscription Status Distribution</h4>
                      <div className="space-y-3">
                        {revenueAnalytics.byStatus?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{item.status}</span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
