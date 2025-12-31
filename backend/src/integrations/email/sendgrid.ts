// @ts-nocheck
/**
 * SendGrid Email Integration
 *
 * Production-ready email service using SendGrid API
 * Supports templates, attachments, and tracking
 */

import axios, { AxiosInstance } from 'axios';

// Types
export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  categories?: string[];
  customArgs?: Record<string, string>;
  sendAt?: number; // Unix timestamp for scheduled sending
}

export interface SendGridResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SendGridService {
  private client: AxiosInstance;
  private fromEmail: string;
  private fromName: string;

  constructor(config: SendGridConfig) {
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'ManithPro';

    this.client = axios.create({
      baseURL: 'https://api.sendgrid.com/v3',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a single email
   */
  async sendEmail(options: SendEmailOptions): Promise<SendGridResponse> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const payload: any = {
        personalizations: [{
          to: recipients.map(r => ({ email: r.email, name: r.name })),
        }],
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
      };

      // Add CC/BCC
      if (options.cc?.length) {
        payload.personalizations[0].cc = options.cc.map(r => ({ email: r.email, name: r.name }));
      }
      if (options.bcc?.length) {
        payload.personalizations[0].bcc = options.bcc.map(r => ({ email: r.email, name: r.name }));
      }

      // Add dynamic template data
      if (options.templateId) {
        payload.template_id = options.templateId;
        if (options.dynamicTemplateData) {
          payload.personalizations[0].dynamic_template_data = options.dynamicTemplateData;
        }
      } else {
        // Plain text/HTML content
        if (options.text) {
          payload.content = payload.content || [];
          payload.content.push({ type: 'text/plain', value: options.text });
        }
        if (options.html) {
          payload.content = payload.content || [];
          payload.content.push({ type: 'text/html', value: options.html });
        }
      }

      // Add reply-to
      if (options.replyTo) {
        payload.reply_to = { email: options.replyTo.email, name: options.replyTo.name };
      }

      // Add attachments
      if (options.attachments?.length) {
        payload.attachments = options.attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.type,
          disposition: att.disposition || 'attachment',
          content_id: att.contentId,
        }));
      }

      // Add categories for tracking
      if (options.categories?.length) {
        payload.categories = options.categories;
      }

      // Add custom args
      if (options.customArgs) {
        payload.custom_args = options.customArgs;
      }

      // Schedule sending
      if (options.sendAt) {
        payload.send_at = options.sendAt;
      }

      const response = await this.client.post('/mail/send', payload);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error: any) {
      console.error('SendGrid error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
      };
    }
  }

  /**
   * Send bulk emails (up to 1000 recipients per request)
   */
  async sendBulkEmail(
    recipients: EmailRecipient[],
    options: Omit<SendEmailOptions, 'to'>
  ): Promise<SendGridResponse> {
    try {
      // SendGrid allows up to 1000 recipients per personalization
      const batches = this.chunkArray(recipients, 1000);
      const results: SendGridResponse[] = [];

      for (const batch of batches) {
        const result = await this.sendEmail({
          ...options,
          to: batch,
        });
        results.push(result);
      }

      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        error: allSuccessful ? undefined : 'Some emails failed to send',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate email address
   */
  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await this.client.post('/validations/email', { email });
      const result = response.data.result;

      return {
        valid: result.verdict === 'Valid',
        reason: result.verdict !== 'Valid' ? result.verdict : undefined,
      };
    } catch (error: any) {
      // Validation API requires additional permissions
      console.warn('Email validation not available:', error.message);
      return { valid: true }; // Assume valid if we can't check
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Singleton instance
let sendGridInstance: SendGridService | null = null;

export function initSendGrid(config: SendGridConfig): SendGridService {
  sendGridInstance = new SendGridService(config);
  return sendGridInstance;
}

export function getSendGrid(): SendGridService {
  if (!sendGridInstance) {
    // Auto-initialize from environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'noreply@manithpro.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'ManithPro';

    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }

    sendGridInstance = new SendGridService({ apiKey, fromEmail, fromName });
  }
  return sendGridInstance;
}

export default SendGridService;
