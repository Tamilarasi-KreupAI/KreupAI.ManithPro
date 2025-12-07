/**
 * Stripe Payment Integration
 *
 * Production-ready integration with Stripe for payments,
 * subscriptions, and billing management
 */

import Stripe from 'stripe';

// Types
export interface StripeConfig {
  secretKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export interface CreateCustomerData {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  paymentMethodId?: string;
}

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  couponId?: string;
}

export interface CreatePaymentIntentData {
  amount: number; // in cents
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

export interface CreateCheckoutSessionData {
  customerId?: string;
  customerEmail?: string;
  priceId?: string;
  lineItems?: Array<{
    price: string;
    quantity: number;
  }>;
  mode: 'payment' | 'subscription' | 'setup';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  trialPeriodDays?: number;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

class StripeService {
  private stripe: Stripe;
  private webhookSecret?: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: (config.apiVersion as any) || '2023-10-16',
    });
    this.webhookSecret = config.webhookSecret;
  }

  // ==================== CUSTOMERS ====================

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    const customerData: Stripe.CustomerCreateParams = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    };

    if (data.paymentMethodId) {
      customerData.payment_method = data.paymentMethodId;
      customerData.invoice_settings = {
        default_payment_method: data.paymentMethodId,
      };
    }

    return this.stripe.customers.create(customerData);
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer.deleted ? null : customer as Stripe.Customer;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    data: Partial<CreateCustomerData>
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, {
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    });
  }

  /**
   * Delete customer
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await this.stripe.customers.del(customerId);
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    const customers = await this.stripe.customers.list({
      email,
      limit: 1,
    });
    return customers.data[0] || null;
  }

  // ==================== PAYMENT METHODS ====================

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(
    customerId: string,
    type: Stripe.PaymentMethodListParams.Type = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    const methods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return methods.data;
  }

  /**
   * Detach payment method
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Create subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: data.customerId,
      items: [{ price: data.priceId }],
      metadata: data.metadata,
      expand: ['latest_invoice.payment_intent'],
    };

    if (data.paymentMethodId) {
      subscriptionData.default_payment_method = data.paymentMethodId;
    }

    if (data.trialPeriodDays) {
      subscriptionData.trial_period_days = data.trialPeriodDays;
    }

    if (data.couponId) {
      subscriptionData.coupon = data.couponId;
    }

    return this.stripe.subscriptions.create(subscriptionData);
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    data: {
      priceId?: string;
      quantity?: number;
      metadata?: Record<string, string>;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<Stripe.Subscription> {
    const updateData: Stripe.SubscriptionUpdateParams = {
      metadata: data.metadata,
      cancel_at_period_end: data.cancelAtPeriodEnd,
    };

    if (data.priceId) {
      // Get current subscription to find the item ID
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      updateData.items = [{
        id: subscription.items.data[0].id,
        price: data.priceId,
        quantity: data.quantity,
      }];
    }

    return this.stripe.subscriptions.update(subscriptionId, updateData);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    if (immediately) {
      return this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      return this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * List customer subscriptions
   */
  async listSubscriptions(
    customerId: string,
    status?: Stripe.SubscriptionListParams.Status
  ): Promise<Stripe.Subscription[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status,
    });
    return subscriptions.data;
  }

  // ==================== PAYMENT INTENTS ====================

  /**
   * Create payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      description: data.description,
      metadata: data.metadata,
      receipt_email: data.receiptEmail,
      setup_future_usage: data.setupFutureUsage,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  // ==================== CHECKOUT SESSIONS ====================

  /**
   * Create checkout session
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<Stripe.Checkout.Session> {
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      mode: data.mode,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: data.metadata,
      allow_promotion_codes: data.allowPromotionCodes,
    };

    if (data.customerId) {
      sessionData.customer = data.customerId;
    } else if (data.customerEmail) {
      sessionData.customer_email = data.customerEmail;
    }

    if (data.priceId) {
      sessionData.line_items = [{
        price: data.priceId,
        quantity: 1,
      }];
    } else if (data.lineItems) {
      sessionData.line_items = data.lineItems;
    }

    if (data.mode === 'subscription' && data.trialPeriodDays) {
      sessionData.subscription_data = {
        trial_period_days: data.trialPeriodDays,
      };
    }

    return this.stripe.checkout.sessions.create(sessionData);
  }

  /**
   * Get checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'subscription', 'payment_intent'],
      });
    } catch (error) {
      return null;
    }
  }

  // ==================== INVOICES ====================

  /**
   * List customer invoices
   */
  async listInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(customerId: string): Promise<Stripe.UpcomingInvoice | null> {
    try {
      return await this.stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error) {
      return null;
    }
  }

  // ==================== PRODUCTS & PRICES ====================

  /**
   * List products
   */
  async listProducts(active: boolean = true): Promise<Stripe.Product[]> {
    const products = await this.stripe.products.list({
      active,
      expand: ['data.default_price'],
    });
    return products.data;
  }

  /**
   * List prices for a product
   */
  async listPrices(productId: string, active: boolean = true): Promise<Stripe.Price[]> {
    const prices = await this.stripe.prices.list({
      product: productId,
      active,
    });
    return prices.data;
  }

  // ==================== WEBHOOKS ====================

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    try {
      this.constructWebhookEvent(payload, signature);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== BILLING PORTAL ====================

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  // ==================== COUPONS ====================

  /**
   * Get coupon
   */
  async getCoupon(couponId: string): Promise<Stripe.Coupon | null> {
    try {
      return await this.stripe.coupons.retrieve(couponId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate promotion code
   */
  async validatePromotionCode(code: string): Promise<Stripe.PromotionCode | null> {
    try {
      const promotionCodes = await this.stripe.promotionCodes.list({
        code,
        active: true,
        limit: 1,
      });
      return promotionCodes.data[0] || null;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance
let stripeInstance: StripeService | null = null;

export function initStripe(config: StripeConfig): StripeService {
  stripeInstance = new StripeService(config);
  return stripeInstance;
}

export function getStripe(): StripeService {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    stripeInstance = new StripeService({
      secretKey,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }
  return stripeInstance;
}

export default StripeService;
