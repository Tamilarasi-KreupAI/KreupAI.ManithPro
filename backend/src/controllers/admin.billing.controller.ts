import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

/**
 * Get all subscriptions with filtering
 */
export const getAllSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      plan,
      search,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ]);

    res.json({
      subscriptions,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

/**
 * Update subscription
 */
export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, status, price, interval, startDate, endDate } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(plan !== undefined && { plan }),
        ...(status !== undefined && { status }),
        ...(price !== undefined && { price }),
        ...(interval !== undefined && { interval }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      byPlan,
      monthlyRevenue,
      annualRevenue,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'TRIAL' } }),
      prisma.subscription.count({ where: { status: 'CANCELLED' } }),

      // Subscriptions by plan
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
        where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      }),

      // Monthly recurring revenue
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          interval: 'MONTHLY',
        },
        _sum: { price: true },
      }),

      // Annual recurring revenue (monthly subscriptions * 12 + annual subscriptions)
      Promise.all([
        prisma.subscription.aggregate({
          where: {
            status: 'ACTIVE',
            interval: 'MONTHLY',
          },
          _sum: { price: true },
        }),
        prisma.subscription.aggregate({
          where: {
            status: 'ACTIVE',
            interval: 'ANNUAL',
          },
          _sum: { price: true },
        }),
      ]).then(([monthly, annual]) => ({
        _sum: { price: ((monthly._sum.price || 0) * 12) + (annual._sum.price || 0) },
      })),
    ]);

    // Churn rate calculation (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [subscriptionsStartOfPeriod, subscriptionsCancelled] = await Promise.all([
      prisma.subscription.count({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          status: { in: ['ACTIVE', 'CANCELLED'] },
        },
      }),
      prisma.subscription.count({
        where: {
          cancelledAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const churnRate = subscriptionsStartOfPeriod > 0
      ? ((subscriptionsCancelled / subscriptionsStartOfPeriod) * 100).toFixed(2)
      : 0;

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      byPlan: byPlan.map(p => ({ plan: p.plan, count: p._count.plan })),
      revenue: {
        monthlyRecurring: monthlyRevenue._sum.price || 0,
        annualRecurring: annualRevenue._sum.price || 0,
      },
      churnRate: parseFloat(churnRate as string),
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription statistics' });
  }
};

/**
 * Get all payments with filtering
 */
export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      dateFrom,
      dateTo,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '365d') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      totalRevenue,
      averageTransactionValue,
      revenueByDate,
    ] = await Promise.all([
      prisma.payment.count({
        where: { createdAt: { gte: startDate } },
      }),

      prisma.payment.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),

      prisma.payment.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: startDate },
        },
      }),

      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),

      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _avg: { amount: true },
      }),

      // Revenue by date
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(amount) as revenue
        FROM payments
        WHERE status = 'COMPLETED' AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    res.json({
      totalPayments,
      successfulPayments,
      failedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageTransactionValue: averageTransactionValue._avg.amount || 0,
      successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(2) : 0,
      revenueByDate,
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};

/**
 * Get invoices
 */
export const getAllInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      dateFrom,
      dateTo,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      invoices,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

/**
 * Generate invoice
 */
export const generateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subscriptionId, amount, dueDate, items } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        subscriptionId,
        amount,
        dueDate: new Date(dueDate),
        status: 'PENDING',
        items: items || [],
      },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

/**
 * Mark invoice as paid
 */
export const markInvoiceAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentId, paidAmount } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentId,
        paidAmount,
      },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
};

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '365d') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const [
      totalRevenue,
      mrr,
      arr,
      revenueByPlan,
      revenueGrowth,
    ] = await Promise.all([
      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),

      // MRR - Monthly Recurring Revenue
      prisma.subscription.aggregate({
        where: {
          status: 'ACTIVE',
          interval: 'MONTHLY',
        },
        _sum: { price: true },
      }),

      // ARR - Annual Recurring Revenue
      Promise.all([
        prisma.subscription.aggregate({
          where: {
            status: 'ACTIVE',
            interval: 'MONTHLY',
          },
          _sum: { price: true },
        }),
        prisma.subscription.aggregate({
          where: {
            status: 'ACTIVE',
            interval: 'ANNUAL',
          },
          _sum: { price: true },
        }),
      ]).then(([monthly, annual]) => ({
        _sum: { price: ((monthly._sum.price || 0) * 12) + (annual._sum.price || 0) },
      })),

      // Revenue by subscription plan
      prisma.$queryRaw`
        SELECT s.plan, SUM(p.amount) as revenue, COUNT(p.id) as payment_count
        FROM payments p
        JOIN subscriptions s ON p.subscription_id = s.id
        WHERE p.status = 'COMPLETED' AND p.created_at >= ${startDate}
        GROUP BY s.plan
        ORDER BY revenue DESC
      `,

      // Revenue growth (compare with previous period)
      calculateRevenueGrowth(startDate),
    ]);

    res.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRecurringRevenue: mrr._sum.price || 0,
      annualRecurringRevenue: arr._sum.price || 0,
      revenueGrowth,
      byPlan: revenueByPlan,
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

/**
 * Export billing data to CSV
 */
export const exportBillingData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type = 'payments', dateFrom, dateTo } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    let data: any[] = [];
    let filename = 'billing-export.csv';

    if (type === 'payments') {
      data = await prisma.payment.findMany({
        where,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      filename = 'payments-export.csv';
    } else if (type === 'subscriptions') {
      data = await prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      filename = 'subscriptions-export.csv';
    } else if (type === 'invoices') {
      data = await prisma.invoice.findMany({
        where,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      filename = 'invoices-export.csv';
    }

    // Generate CSV
    if (data.length === 0) {
      res.status(404).json({ error: 'No data to export' });
      return;
    }

    const headers = Object.keys(data[0]).filter(key => !key.startsWith('_') && typeof data[0][key] !== 'object');
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting billing data:', error);
    res.status(500).json({ error: 'Failed to export billing data' });
  }
};

// Helper function to calculate revenue growth
async function calculateRevenueGrowth(currentPeriodStart: Date): Promise<number> {
  const periodLength = Date.now() - currentPeriodStart.getTime();
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodLength);

  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: currentPeriodStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: currentPeriodStart,
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const current = currentRevenue._sum.amount || 0;
  const previous = previousRevenue._sum.amount || 0;

  if (previous === 0) return current > 0 ? 100 : 0;

  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}
