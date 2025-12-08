import { useEffect, useState } from 'react';
import {
  getAllSubscriptions,
  cancelSubscription,
  getSubscriptionStats,
  getAllPayments,
  getPaymentStats,
  getAllInvoices,
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

      const params: any = {
        format: format as 'csv' | 'xlsx' | 'pdf',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };
      await exportBillingData(params);
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
      ACTIVE: 'bg-green-100 text-green-700 border-green-200',
      TRIAL: 'bg-blue-100 text-blue-700 border-blue-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      EXPIRED: 'bg-slate-100 text-slate-700 border-slate-200',
      SUSPENDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      FAILED: 'bg-red-100 text-red-700 border-red-200',
      REFUNDED: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Billing & Subscriptions</h1>
            <p className="text-slate-500 mt-2">Manage subscriptions, payments, and invoices</p>
          </div>
          <button
            onClick={handleExportBillingData}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            Export Data
          </button>
        </div>

        {/* Stats Overview */}
        {subscriptionStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Subscriptions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{subscriptionStats.total}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">{subscriptionStats.active} active</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">This Month Revenue</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {formatCurrency(subscriptionStats.revenueThisMonth)}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    vs {formatCurrency(subscriptionStats.revenueLastMonth)} last month
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Trial Subscriptions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{subscriptionStats.trial}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Potential conversions</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>

            {paymentStats && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{paymentStats.successRate}%</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      Avg: {formatCurrency(paymentStats.avgTransactionValue)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="border-b border-slate-100">
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
                  className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <h4 className="font-bold text-slate-900 mb-4">Recent Subscriptions</h4>
                      <div className="space-y-4">
                        {subscriptions.slice(0, 5).map((sub) => (
                          <div key={sub.id} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                            <div>
                              <p className="font-bold text-slate-900">{sub.plan}</p>
                              <p className="text-sm text-slate-500">{formatDate(sub.startDate)}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-slate-700">{formatCurrency(sub.price)}/{sub.billingCycle}</span>
                              {getStatusBadge(sub.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                      <h4 className="font-bold text-slate-900 mb-4">Recent Payments</h4>
                      <div className="space-y-4">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                            <div>
                              <p className="font-bold text-slate-900">{payment.method}</p>
                              <p className="text-sm text-slate-500">{formatDate(payment.createdAt)}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-bold text-slate-900">{formatCurrency(payment.amount, payment.currency)}</span>
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">All Subscriptions</h3>
                  <div className="relative">
                    <select
                      value={subscriptionStatus}
                      onChange={(e) => setSubscriptionStatus(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="TRIAL">Trial</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Cycle</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{sub.plan}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatCurrency(sub.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{sub.billingCycle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(sub.startDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {sub.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleCancelSubscription(sub.id)}
                                  className="text-red-600 hover:text-red-800 font-bold"
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
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSubscriptionPage(Math.max(1, subscriptionPage - 1))}
                    disabled={subscriptionPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">Page {subscriptionPage}</span>
                  <button
                    onClick={() => setSubscriptionPage(subscriptionPage + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
                  <h3 className="text-xl font-bold text-slate-900">All Payments</h3>
                  <div className="relative">
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block">
                                {payment.transactionId || payment.id.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                              {formatCurrency(payment.amount, payment.currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{payment.method}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(payment.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setPaymentPage(Math.max(1, paymentPage - 1))}
                    disabled={paymentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">Page {paymentPage}</span>
                  <button
                    onClick={() => setPaymentPage(paymentPage + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
                  <h3 className="text-xl font-bold text-slate-900">All Invoices</h3>
                  <div className="relative">
                    <select
                      value={invoiceStatus}
                      onChange={(e) => setInvoiceStatus(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Paid</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tax</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block">
                                {invoice.invoiceNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatCurrency(invoice.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatCurrency(invoice.tax)}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{formatCurrency(invoice.total)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                              {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {invoice.status === 'PENDING' && (
                                <button
                                  onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                                  className="text-blue-600 hover:text-blue-800 font-bold"
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
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setInvoicePage(Math.max(1, invoicePage - 1))}
                    disabled={invoicePage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">Page {invoicePage}</span>
                  <button
                    onClick={() => setInvoicePage(invoicePage + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Revenue Analytics</h3>
                  <div className="relative">
                    <select
                      value={analyticsPeriod}
                      onChange={(e) => setAnalyticsPeriod(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                  </div>
                </div>

                {revenueAnalytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-6">Revenue by Plan</h4>
                      <div className="space-y-4">
                        {revenueAnalytics.byPlan?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-medium text-slate-700">{item.plan}</span>
                            <span className="text-lg font-bold text-slate-900">{formatCurrency(item.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-6">Subscription Status Distribution</h4>
                      <div className="space-y-4">
                        {revenueAnalytics.byStatus?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-medium text-slate-700">{item.status}</span>
                            <span className="font-bold text-slate-900">{item.count}</span>
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
