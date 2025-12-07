// ============================================================
// INTEGRATION TYPES - Shared types for all integrations
// ============================================================

// ============================================
// Base Types
// ============================================
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  requiredScopes?: string[];
  connectedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export type IntegrationCategory =
  | 'calendar'
  | 'communication'
  | 'oauth'
  | 'jobboard'
  | 'ai'
  | 'payment'
  | 'storage'
  | 'analytics';

export interface IntegrationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ============================================
// OAuth Types
// ============================================
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
  tokenType: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  raw?: Record<string, unknown>;
}

export type OAuthProvider = 'google' | 'github' | 'linkedin' | 'microsoft';

// ============================================
// Calendar Types
// ============================================
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  timezone: string;
  location?: string;
  attendees: CalendarAttendee[];
  conferenceLink?: string;
  conferenceType?: 'zoom' | 'meet' | 'teams' | 'other';
  status: CalendarEventStatus;
  recurrence?: CalendarRecurrence;
  reminders?: CalendarReminder[];
  metadata?: Record<string, unknown>;
}

export interface CalendarAttendee {
  email: string;
  name?: string;
  status: 'accepted' | 'declined' | 'tentative' | 'pending';
  required: boolean;
}

export type CalendarEventStatus = 'confirmed' | 'tentative' | 'cancelled';

export interface CalendarRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  until?: Date;
  count?: number;
  byDay?: string[];
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface CalendarAvailability {
  start: Date;
  end: Date;
  busy: boolean;
}

export interface CalendarSyncResult {
  created: number;
  updated: number;
  deleted: number;
  errors: IntegrationError[];
}

export type CalendarProvider = 'google' | 'outlook' | 'apple';

// ============================================
// Communication Types
// ============================================
export interface EmailMessage {
  id?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from: EmailRecipient;
  replyTo?: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, unknown>;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  size?: number;
}

export interface EmailSendResult {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  sentAt?: Date;
  error?: IntegrationError;
}

export interface SMSMessage {
  to: string;
  from?: string;
  body: string;
  mediaUrl?: string[];
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface SMSSendResult {
  id: string;
  status: 'sent' | 'queued' | 'failed' | 'delivered';
  sentAt?: Date;
  error?: IntegrationError;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'actions' | 'context' | 'header' | 'image';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
  };
  accessory?: Record<string, unknown>;
  elements?: Record<string, unknown>[];
}

export interface SlackAttachment {
  color?: string;
  pretext?: string;
  title?: string;
  titleLink?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  ts?: number;
}

export interface SlackSendResult {
  ok: boolean;
  channel: string;
  ts: string;
  error?: string;
}

export type CommunicationProvider = 'sendgrid' | 'ses' | 'twilio' | 'slack';

// ============================================
// AI/ML Types
// ============================================
export interface AICompletionRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  systemPrompt?: string;
}

export interface AICompletionResponse {
  id: string;
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
}

export interface AIEmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface TranscriptionRequest {
  audioUrl?: string;
  audioFile?: File | Blob;
  language?: string;
  punctuate?: boolean;
  diarize?: boolean;
  speakerCount?: number;
}

export interface TranscriptionResponse {
  id: string;
  text: string;
  confidence: number;
  words?: TranscriptionWord[];
  speakers?: TranscriptionSpeaker[];
  duration: number;
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface TranscriptionSpeaker {
  id: number;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export type AIProvider = 'openai' | 'anthropic' | 'cohere';
export type TranscriptionProvider = 'deepgram' | 'assemblyai' | 'whisper';

// ============================================
// Job Board Types
// ============================================
export interface JobBoardPosting {
  id: string;
  jobId: string;
  board: JobBoard;
  externalId?: string;
  status: JobBoardPostingStatus;
  url?: string;
  postedAt?: Date;
  expiresAt?: Date;
  applicationsCount?: number;
  viewsCount?: number;
  error?: IntegrationError;
}

export type JobBoard = 'indeed' | 'linkedin' | 'glassdoor' | 'ziprecruiter' | 'google_jobs';

export type JobBoardPostingStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'paused'
  | 'expired'
  | 'closed'
  | 'error';

export interface JobBoardConfig {
  board: JobBoard;
  apiKey?: string;
  companyId?: string;
  defaultSettings?: Record<string, unknown>;
}

export interface JobBoardSyncResult {
  board: JobBoard;
  synced: number;
  errors: IntegrationError[];
  lastSyncAt: Date;
}

// ============================================
// Payment Types
// ============================================
export interface PaymentCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentSubscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, unknown>;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  trialDays?: number;
  features?: string[];
  metadata?: Record<string, unknown>;
}

export interface PaymentInvoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
  dueDate?: Date;
  invoicePdf?: string;
  lineItems: PaymentLineItem[];
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface PaymentLineItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  clientSecret: string;
  paymentMethodId?: string;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export type PaymentProvider = 'stripe' | 'paypal';

// ============================================
// Webhook Types
// ============================================
export interface WebhookEvent {
  id: string;
  type: string;
  provider: string;
  data: Record<string, unknown>;
  receivedAt: Date;
  processed: boolean;
  processedAt?: Date;
  error?: IntegrationError;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
}
