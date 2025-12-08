/**
 * Payment Integration Module
 *
 * Unified payment service with Stripe integration
 * Handles subscriptions, one-time payments, and billing management
 */

import StripeService, { getStripe, initStripe } from './stripe';

// Re-export types
export * from './stripe';

export type PaymentProvider = 'stripe';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  transactionId?: string;
  status?: string;
  error?: string;
  clientSecret?: string;
  redirectUrl?: string;
}

export interface SubscriptionResult {
  success: boolean;
  provider: PaymentProvider;
  subscriptionId?: string;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  error?: string;
}

/**
 * Unified Payment Service
 */
class PaymentService {
  /**
   * Create a customer for billing
   */
  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const stripe = getStripe();
      const customer = await stripe.createCustomer(data);
      return { success: true, customerId: customer.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get or create customer by email
   */
  async getOrCreateCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; customerId?: string; isNew?: boolean; error?: string }> {
    try {
      const stripe = getStripe();

      // Try to find existing customer
      const existing = await stripe.getCustomerByEmail(data.email);
      if (existing) {
        return { success: true, customerId: existing.id, isNew: false };
      }

      // Create new customer
      const customer = await stripe.createCustomer(data);
      return { success: true, customerId: customer.id, isNew: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(data: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    trialDays?: number;
    couponCode?: string;
    metadata?: Record<string, string>;
  }): Promise<SubscriptionResult> {
    try {
      const stripe = getStripe();

      // Validate coupon if provided
      let couponId: string | undefined;
      if (data.couponCode) {
        const promoCode = await stripe.validatePromotionCode(data.couponCode);
        if (promoCode) {
          couponId = promoCode.coupon.id;
        }
      }

      const subscription = await stripe.createSubscription({
        customerId: data.customerId,
        priceId: data.priceId,
        paymentMethodId: data.paymentMethodId,
        trialPeriodDays: data.trialDays,
        couponId,
        metadata: data.metadata,
      });

      return {
        success: true,
        provider: 'stripe',
        subscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<SubscriptionResult> {
    try {
      const stripe = getStripe();
      const subscription = await stripe.cancelSubscription(subscriptionId, immediately);

      return {
        success: true,
        provider: 'stripe',
        subscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Resume a canceled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    try {
      const stripe = getStripe();
      const subscription = await stripe.resumeSubscription(subscriptionId);

      return {
        success: true,
        provider: 'stripe',
        subscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string
  ): Promise<SubscriptionResult> {
    try {
      const stripe = getStripe();
      const subscription = await stripe.updateSubscription(subscriptionId, {
        priceId: newPriceId,
      });

      return {
        success: true,
        provider: 'stripe',
        subscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Create a one-time payment
   */
  async createPayment(data: {
    amount: number; // in cents
    currency: string;
    customerId?: string;
    description?: string;
    metadata?: Record<string, string>;
    receiptEmail?: string;
  }): Promise<PaymentResult> {
    try {
      const stripe = getStripe();
      const paymentIntent = await stripe.createPaymentIntent({
        amount: data.amount,
        currency: data.currency,
        customerId: data.customerId,
        description: data.description,
        metadata: data.metadata,
        receiptEmail: data.receiptEmail,
      });

      return {
        success: true,
        provider: 'stripe',
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Create checkout session for payment
   */
  async createCheckoutSession(data: {
    customerId?: string;
    customerEmail?: string;
    priceId?: string;
    lineItems?: Array<{ price: string; quantity: number }>;
    mode: 'payment' | 'subscription' | 'setup';
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    allowPromotionCodes?: boolean;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult> {
    try {
      const stripe = getStripe();
      const session = await stripe.createCheckoutSession({
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        priceId: data.priceId,
        lineItems: data.lineItems,
        mode: data.mode,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        trialPeriodDays: data.trialDays,
        allowPromotionCodes: data.allowPromotionCodes,
        metadata: data.metadata,
      });

      return {
        success: true,
        provider: 'stripe',
        transactionId: session.id,
        redirectUrl: session.url || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'stripe',
        error: error.message,
      };
    }
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const stripe = getStripe();
      const session = await stripe.createBillingPortalSession(customerId, returnUrl);
      return { success: true, url: session.url };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    invoices?: Array<{
      id: string;
      number: string | null;
      amount: number;
      currency: string;
      status: string | null;
      paidAt: Date | null;
      pdfUrl: string | null;
    }>;
    error?: string;
  }> {
    try {
      const stripe = getStripe();
      const invoices = await stripe.listInvoices(customerId, limit);

      return {
        success: true,
        invoices: invoices.map(inv => ({
          id: inv.id,
          number: inv.number,
          amount: inv.amount_due,
          currency: inv.currency,
          status: inv.status,
          paidAt: inv.status_transitions?.paid_at
            ? new Date(inv.status_transitions.paid_at * 1000)
            : null,
          pdfUrl: inv.invoice_pdf,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Stripe webhook event
   */
  handleWebhook(
    payload: string | Buffer,
    signature: string
  ): { success: boolean; event?: any; error?: string } {
    try {
      const stripe = getStripe();
      const event = stripe.constructWebhookEvent(payload, signature);
      return { success: true, event };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
let paymentService: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!paymentService) {
    paymentService = new PaymentService();
  }
  return paymentService;
}

// Re-exports
export { StripeService };
export { getStripe, initStripe } from './stripe';

export default PaymentService;
