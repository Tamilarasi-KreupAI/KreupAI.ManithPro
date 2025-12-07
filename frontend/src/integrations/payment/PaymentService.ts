// ============================================================
// PAYMENT SERVICE - Stripe payment integration
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  PaymentCustomer,
  PaymentSubscription,
  PaymentPlan,
  PaymentInvoice,
  PaymentMethod,
  PaymentIntent,
  SubscriptionStatus,
} from '../types';

// ============================================
// Pricing Plan Types
// ============================================
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  limits: {
    activeJobs: number;
    teamMembers: number;
    candidatesPerMonth: number;
    storage: string;
    integrations: boolean;
    analytics: 'basic' | 'advanced' | 'enterprise';
    support: 'email' | 'priority' | 'dedicated';
  };
  popular?: boolean;
  enterpriseOnly?: boolean;
}

// ============================================
// Default Pricing Tiers
// ============================================
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams just getting started',
    monthlyPrice: 49,
    yearlyPrice: 470,
    currency: 'USD',
    features: [
      'Up to 5 active job postings',
      '3 team members',
      '100 candidates/month',
      '5GB storage',
      'Email support',
      'Basic analytics',
    ],
    limits: {
      activeJobs: 5,
      teamMembers: 3,
      candidatesPerMonth: 100,
      storage: '5GB',
      integrations: false,
      analytics: 'basic',
      support: 'email',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams with advanced needs',
    monthlyPrice: 149,
    yearlyPrice: 1430,
    currency: 'USD',
    features: [
      'Up to 25 active job postings',
      '10 team members',
      '500 candidates/month',
      '25GB storage',
      'Priority support',
      'Advanced analytics',
      'Calendar integrations',
      'Job board syndication',
    ],
    limits: {
      activeJobs: 25,
      teamMembers: 10,
      candidatesPerMonth: 500,
      storage: '25GB',
      integrations: true,
      analytics: 'advanced',
      support: 'priority',
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom requirements',
    monthlyPrice: 499,
    yearlyPrice: 4790,
    currency: 'USD',
    features: [
      'Unlimited job postings',
      'Unlimited team members',
      'Unlimited candidates',
      'Unlimited storage',
      'Dedicated support',
      'Enterprise analytics',
      'All integrations',
      'Custom workflows',
      'API access',
      'SSO/SAML',
      'Custom branding',
    ],
    limits: {
      activeJobs: -1, // Unlimited
      teamMembers: -1,
      candidatesPerMonth: -1,
      storage: 'Unlimited',
      integrations: true,
      analytics: 'enterprise',
      support: 'dedicated',
    },
  },
];

// ============================================
// Payment Service
// ============================================
export class PaymentService extends BaseIntegrationService {
  private stripePublicKey: string;
  private customerId: string | null = null;

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'payment',
      name: 'Payment Service',
      description: 'Manage subscriptions and billing via Stripe',
      icon: 'credit-card',
      category: 'payment',
      ...config,
    });

    this.stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  }

  async connect(): Promise<void> {
    try {
      const response = await this.request<{ customerId: string }>(
        '/payment/connect',
        { method: 'POST' }
      );

      this.customerId = response.customerId;
      this.setStatus('connected');
      this.config.connectedAt = new Date();

      integrationEvents.emit('connected', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.customerId = null;
    this.setStatus('disconnected');

    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected' && this.customerId !== null;
  }

  async refresh(): Promise<void> {
    await this.connect();
  }

  // ============================================
  // Customer Methods
  // ============================================

  async getCustomer(): Promise<PaymentCustomer | null> {
    if (!this.customerId) return null;

    const response = await this.request<PaymentCustomer>(
      `/payment/customers/${this.customerId}`
    );
    return response;
  }

  async updateCustomer(data: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentCustomer> {
    const response = await this.request<PaymentCustomer>(
      `/payment/customers/${this.customerId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  }

  // ============================================
  // Subscription Methods
  // ============================================

  async getSubscription(): Promise<PaymentSubscription | null> {
    try {
      const response = await this.request<PaymentSubscription>(
        '/payment/subscription'
      );
      return response;
    } catch {
      return null;
    }
  }

  async createSubscription(
    planId: string,
    interval: 'month' | 'year'
  ): Promise<{ subscription: PaymentSubscription; clientSecret?: string }> {
    const response = await this.request<{
      subscription: PaymentSubscription;
      clientSecret?: string;
    }>('/payment/subscription', {
      method: 'POST',
      body: JSON.stringify({ planId, interval }),
    });
    return response;
  }

  async updateSubscription(
    planId: string,
    options?: {
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    }
  ): Promise<PaymentSubscription> {
    const response = await this.request<PaymentSubscription>(
      '/payment/subscription',
      {
        method: 'PATCH',
        body: JSON.stringify({ planId, ...options }),
      }
    );
    return response;
  }

  async cancelSubscription(
    options?: { cancelAtPeriodEnd?: boolean; reason?: string }
  ): Promise<PaymentSubscription> {
    const response = await this.request<PaymentSubscription>(
      '/payment/subscription/cancel',
      {
        method: 'POST',
        body: JSON.stringify(options || { cancelAtPeriodEnd: true }),
      }
    );
    return response;
  }

  async reactivateSubscription(): Promise<PaymentSubscription> {
    const response = await this.request<PaymentSubscription>(
      '/payment/subscription/reactivate',
      { method: 'POST' }
    );
    return response;
  }

  async pauseSubscription(
    resumeAt?: Date
  ): Promise<PaymentSubscription> {
    const response = await this.request<PaymentSubscription>(
      '/payment/subscription/pause',
      {
        method: 'POST',
        body: JSON.stringify({ resumeAt: resumeAt?.toISOString() }),
      }
    );
    return response;
  }

  async resumeSubscription(): Promise<PaymentSubscription> {
    const response = await this.request<PaymentSubscription>(
      '/payment/subscription/resume',
      { method: 'POST' }
    );
    return response;
  }

  // ============================================
  // Plan Methods
  // ============================================

  getPlans(): PaymentPlan[] {
    return PRICING_TIERS.map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      amount: tier.monthlyPrice * 100, // Convert to cents
      currency: tier.currency,
      interval: 'month' as const,
      intervalCount: 1,
      features: tier.features,
      metadata: { limits: JSON.stringify(tier.limits) },
    }));
  }

  getPricingTiers(): PricingTier[] {
    return PRICING_TIERS;
  }

  getPricingTier(planId: string): PricingTier | undefined {
    return PRICING_TIERS.find((t) => t.id === planId);
  }

  // ============================================
  // Payment Method Methods
  // ============================================

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.request<{ data: PaymentMethod[] }>(
      '/payment/methods'
    );
    return response.data;
  }

  async addPaymentMethod(
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    const response = await this.request<PaymentMethod>('/payment/methods', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
    return response;
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.request(`/payment/methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.request(`/payment/methods/${paymentMethodId}/default`, {
      method: 'POST',
    });
  }

  async createSetupIntent(): Promise<{ clientSecret: string }> {
    const response = await this.request<{ clientSecret: string }>(
      '/payment/setup-intent',
      { method: 'POST' }
    );
    return response;
  }

  // ============================================
  // Invoice Methods
  // ============================================

  async getInvoices(options?: {
    limit?: number;
    startingAfter?: string;
  }): Promise<PaymentInvoice[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.startingAfter) params.set('starting_after', options.startingAfter);

    const response = await this.request<{ data: PaymentInvoice[] }>(
      `/payment/invoices?${params}`
    );
    return response.data;
  }

  async getInvoice(invoiceId: string): Promise<PaymentInvoice> {
    const response = await this.request<PaymentInvoice>(
      `/payment/invoices/${invoiceId}`
    );
    return response;
  }

  async downloadInvoice(invoiceId: string): Promise<string> {
    const response = await this.request<{ url: string }>(
      `/payment/invoices/${invoiceId}/download`
    );
    return response.url;
  }

  async getUpcomingInvoice(): Promise<PaymentInvoice | null> {
    try {
      const response = await this.request<PaymentInvoice>(
        '/payment/invoices/upcoming'
      );
      return response;
    } catch {
      return null;
    }
  }

  // ============================================
  // Payment Intent Methods
  // ============================================

  async createPaymentIntent(
    amount: number,
    currency: string,
    options?: {
      metadata?: Record<string, string>;
      description?: string;
    }
  ): Promise<PaymentIntent> {
    const response = await this.request<PaymentIntent>(
      '/payment/payment-intent',
      {
        method: 'POST',
        body: JSON.stringify({ amount, currency, ...options }),
      }
    );
    return response;
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    const response = await this.request<PaymentIntent>(
      `/payment/payment-intent/${paymentIntentId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId }),
      }
    );
    return response;
  }

  // ============================================
  // Usage & Billing Portal
  // ============================================

  async getUsage(): Promise<{
    activeJobs: number;
    teamMembers: number;
    candidatesThisMonth: number;
    storageUsed: string;
    limits: PricingTier['limits'];
  }> {
    const response = await this.request<{
      activeJobs: number;
      teamMembers: number;
      candidatesThisMonth: number;
      storageUsed: string;
      planId: string;
    }>('/payment/usage');

    const tier = this.getPricingTier(response.planId);

    return {
      ...response,
      limits: tier?.limits || PRICING_TIERS[0].limits,
    };
  }

  async createBillingPortalSession(
    returnUrl?: string
  ): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>(
      '/payment/billing-portal',
      {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: returnUrl || window.location.href,
        }),
      }
    );
    return response;
  }

  async openBillingPortal(returnUrl?: string): Promise<void> {
    const { url } = await this.createBillingPortalSession(returnUrl);
    window.location.href = url;
  }

  // ============================================
  // Checkout Session
  // ============================================

  async createCheckoutSession(
    planId: string,
    interval: 'month' | 'year',
    options?: {
      successUrl?: string;
      cancelUrl?: string;
      trialDays?: number;
    }
  ): Promise<{ sessionId: string; url: string }> {
    const response = await this.request<{ sessionId: string; url: string }>(
      '/payment/checkout-session',
      {
        method: 'POST',
        body: JSON.stringify({
          planId,
          interval,
          successUrl: options?.successUrl || `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: options?.cancelUrl || `${window.location.origin}/settings/billing?canceled=true`,
          trialDays: options?.trialDays,
        }),
      }
    );
    return response;
  }

  async redirectToCheckout(
    planId: string,
    interval: 'month' | 'year',
    options?: {
      successUrl?: string;
      cancelUrl?: string;
      trialDays?: number;
    }
  ): Promise<void> {
    const { url } = await this.createCheckoutSession(planId, interval, options);
    window.location.href = url;
  }

  // ============================================
  // Helper Methods
  // ============================================

  formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  getSubscriptionStatusLabel(status: SubscriptionStatus): string {
    const labels: Record<SubscriptionStatus, string> = {
      active: 'Active',
      canceled: 'Canceled',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      past_due: 'Past Due',
      trialing: 'Trial',
      unpaid: 'Unpaid',
      paused: 'Paused',
    };
    return labels[status] || status;
  }

  getSubscriptionStatusColor(status: SubscriptionStatus): string {
    const colors: Record<SubscriptionStatus, string> = {
      active: 'green',
      canceled: 'gray',
      incomplete: 'yellow',
      incomplete_expired: 'red',
      past_due: 'red',
      trialing: 'blue',
      unpaid: 'red',
      paused: 'yellow',
    };
    return colors[status] || 'gray';
  }

  calculateSavings(monthlyPrice: number, yearlyPrice: number): {
    amount: number;
    percentage: number;
  } {
    const yearlyFromMonthly = monthlyPrice * 12;
    const savings = yearlyFromMonthly - yearlyPrice;
    const percentage = Math.round((savings / yearlyFromMonthly) * 100);

    return { amount: savings, percentage };
  }
}

export default PaymentService;
