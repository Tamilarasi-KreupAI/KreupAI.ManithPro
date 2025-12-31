// @ts-nocheck
/**
 * External Integrations Module
 *
 * Central hub for all third-party integrations including:
 * - Email (SendGrid, AWS SES)
 * - Calendar (Google Calendar, Microsoft Outlook)
 * - Payment (Stripe)
 * - Notifications (Slack)
 * - Verification (LinkedIn, Checkr)
 * - Assessment (HackerRank, Codility)
 */

// ==================== EMAIL ====================
export {
  getEmailService,
  EmailService,
  SendGridService,
  SESService,
  EmailTemplates,
  renderTemplate,
  initSendGrid,
  getSendGrid,
  initSES,
  getSES,
  type EmailProvider,
  type UnifiedEmailOptions,
  type EmailResult,
} from './email';

// ==================== CALENDAR ====================
export {
  getCalendarService,
  CalendarService,
  GoogleCalendarService,
  OutlookCalendarService,
  getGoogleCalendar,
  initGoogleCalendar,
  getOutlookCalendar,
  initOutlookCalendar,
  type CalendarProvider,
  type UnifiedCalendarEvent,
  type CalendarEventResult,
  type AvailabilitySlot,
} from './calendar';

// ==================== PAYMENT ====================
export {
  getPaymentService,
  PaymentService,
  StripeService,
  getStripe,
  initStripe,
  SubscriptionStatus,
  type PaymentProvider,
  type PaymentResult,
  type SubscriptionResult,
} from './payment';

// ==================== NOTIFICATIONS ====================
export {
  getNotificationService,
  NotificationService,
  SlackService,
  getSlack,
  initSlack,
  type NotificationChannel,
  type NotificationResult,
  type SlackMessage,
  type SlackBlock,
  type SlackNotificationResult,
} from './notifications';

// ==================== VERIFICATION ====================
export {
  getVerificationService,
  VerificationService,
  LinkedInService,
  CheckrService,
  getLinkedIn,
  initLinkedIn,
  getCheckr,
  initCheckr,
  VerificationStatus,
  VerificationType,
  type VerificationResult,
} from './verification';

// ==================== ASSESSMENT ====================
export {
  getAssessmentService,
  AssessmentService,
  HackerRankService,
  CodilityService,
  getHackerRank,
  initHackerRank,
  getCodility,
  initCodility,
  AssessmentStatus,
  type AssessmentProvider,
  type UnifiedAssessmentResult,
  type CreateAssessmentOptions,
  type InviteCandidateOptions,
} from './assessment';

// ==================== INTEGRATION STATUS ====================

export interface IntegrationStatus {
  name: string;
  provider: string;
  configured: boolean;
  envVars: string[];
}

/**
 * Get status of all integrations
 */
export function getIntegrationsStatus(): IntegrationStatus[] {
  return [
    // Email
    {
      name: 'Email - SendGrid',
      provider: 'sendgrid',
      configured: !!process.env.SENDGRID_API_KEY,
      envVars: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
    },
    {
      name: 'Email - AWS SES',
      provider: 'ses',
      configured: !!(process.env.AWS_SES_REGION || process.env.AWS_REGION),
      envVars: ['AWS_SES_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    },

    // Calendar
    {
      name: 'Calendar - Google',
      provider: 'google',
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    },
    {
      name: 'Calendar - Outlook',
      provider: 'outlook',
      configured: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
      envVars: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_TENANT_ID'],
    },

    // Payment
    {
      name: 'Payment - Stripe',
      provider: 'stripe',
      configured: !!process.env.STRIPE_SECRET_KEY,
      envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    },

    // Notifications
    {
      name: 'Notifications - Slack',
      provider: 'slack',
      configured: !!process.env.SLACK_BOT_TOKEN,
      envVars: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'SLACK_DEFAULT_CHANNEL'],
    },

    // Verification
    {
      name: 'Verification - LinkedIn',
      provider: 'linkedin',
      configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      envVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    },
    {
      name: 'Verification - Checkr',
      provider: 'checkr',
      configured: !!process.env.CHECKR_API_KEY,
      envVars: ['CHECKR_API_KEY'],
    },

    // Assessment
    {
      name: 'Assessment - HackerRank',
      provider: 'hackerrank',
      configured: !!process.env.HACKERRANK_API_KEY,
      envVars: ['HACKERRANK_API_KEY'],
    },
    {
      name: 'Assessment - Codility',
      provider: 'codility',
      configured: !!process.env.CODILITY_API_TOKEN,
      envVars: ['CODILITY_API_TOKEN'],
    },
  ];
}

/**
 * Get configured integrations
 */
export function getConfiguredIntegrations(): string[] {
  return getIntegrationsStatus()
    .filter(i => i.configured)
    .map(i => i.name);
}

/**
 * Check if a specific integration is configured
 */
export function isIntegrationConfigured(provider: string): boolean {
  const status = getIntegrationsStatus().find(
    i => i.provider.toLowerCase() === provider.toLowerCase()
  );
  return status?.configured ?? false;
}
