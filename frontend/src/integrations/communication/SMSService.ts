// ============================================================
// SMS SERVICE - SMS communication service via Twilio
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  SMSMessage,
  SMSSendResult,
  IntegrationError,
} from '../types';

// ============================================
// SMS Template Types
// ============================================
export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: SMSTemplateCategory;
}

export type SMSTemplateCategory =
  | 'interview'
  | 'reminder'
  | 'notification'
  | 'verification';

// ============================================
// Predefined SMS Templates
// ============================================
export const SMS_TEMPLATES: Record<string, SMSTemplate> = {
  INTERVIEW_REMINDER: {
    id: 'interview_reminder',
    name: 'Interview Reminder',
    content:
      'Reminder: Your interview for {{jobTitle}} at {{companyName}} is scheduled for {{dateTime}}. {{meetingInfo}}',
    variables: ['jobTitle', 'companyName', 'dateTime', 'meetingInfo'],
    category: 'interview',
  },

  INTERVIEW_CONFIRMATION: {
    id: 'interview_confirmation',
    name: 'Interview Confirmation',
    content:
      '{{companyName}}: Your interview for {{jobTitle}} is confirmed for {{dateTime}}. Reply YES to confirm or NO to reschedule.',
    variables: ['companyName', 'jobTitle', 'dateTime'],
    category: 'interview',
  },

  APPLICATION_STATUS: {
    id: 'application_status',
    name: 'Application Status Update',
    content:
      '{{companyName}}: Update on your {{jobTitle}} application. {{message}} Check your email for details.',
    variables: ['companyName', 'jobTitle', 'message'],
    category: 'notification',
  },

  VERIFICATION_CODE: {
    id: 'verification_code',
    name: 'Verification Code',
    content: 'Your {{companyName}} verification code is: {{code}}. Valid for {{expiry}} minutes.',
    variables: ['companyName', 'code', 'expiry'],
    category: 'verification',
  },

  OFFER_NOTIFICATION: {
    id: 'offer_notification',
    name: 'Offer Notification',
    content:
      'Congratulations! {{companyName}} has extended an offer for {{jobTitle}}. Check your email for the full offer letter.',
    variables: ['companyName', 'jobTitle'],
    category: 'notification',
  },
};

// ============================================
// SMS Service
// ============================================
export class SMSService extends BaseIntegrationService {
  private fromNumber: string;

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'sms',
      name: 'SMS Service',
      description: 'Send SMS notifications via Twilio',
      icon: 'message-square',
      category: 'communication',
      ...config,
    });

    this.fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';
  }

  async connect(): Promise<void> {
    try {
      await this.request('/communication/sms/verify', { method: 'POST' });
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
    this.setStatus('disconnected');
    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected';
  }

  async refresh(): Promise<void> {
    await this.connect();
  }

  // ============================================
  // SMS Methods
  // ============================================

  async send(message: SMSMessage): Promise<SMSSendResult> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(message.to)) {
      return {
        id: '',
        status: 'failed',
        error: this.createError(
          'INVALID_PHONE',
          'Invalid phone number format',
          false
        ),
      };
    }

    const payload = {
      ...message,
      from: message.from || this.fromNumber,
    };

    try {
      const response = await this.request<{
        sid: string;
        status: string;
        dateCreated: string;
      }>('/communication/sms/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        id: response.sid,
        status: this.mapTwilioStatus(response.status),
        sentAt: new Date(response.dateCreated),
      };
    } catch (error) {
      return {
        id: '',
        status: 'failed',
        error: error as IntegrationError,
      };
    }
  }

  async sendTemplate(
    templateId: string,
    to: string,
    data: Record<string, unknown>,
    options?: { scheduledAt?: Date }
  ): Promise<SMSSendResult> {
    const template = SMS_TEMPLATES[templateId];

    if (!template) {
      throw this.createError(
        'TEMPLATE_NOT_FOUND',
        `Template ${templateId} not found`,
        false
      );
    }

    const body = this.renderTemplate(template.content, data);

    return this.send({
      to,
      body,
      scheduledAt: options?.scheduledAt,
      metadata: { templateId, templateData: data },
    });
  }

  async sendBulk(
    messages: SMSMessage[]
  ): Promise<Array<SMSSendResult>> {
    const results: SMSSendResult[] = [];

    // Send in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((msg) => this.send(msg)));
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // ============================================
  // Status and Delivery
  // ============================================

  async getMessageStatus(messageId: string): Promise<SMSSendResult> {
    const response = await this.request<{
      sid: string;
      status: string;
      dateCreated: string;
      errorCode?: string;
      errorMessage?: string;
    }>(`/communication/sms/status/${messageId}`);

    return {
      id: response.sid,
      status: this.mapTwilioStatus(response.status),
      sentAt: new Date(response.dateCreated),
      error: response.errorCode
        ? this.createError(response.errorCode, response.errorMessage || '', false)
        : undefined,
    };
  }

  // ============================================
  // Template Methods
  // ============================================

  getTemplate(templateId: string): SMSTemplate | null {
    return SMS_TEMPLATES[templateId] || null;
  }

  getTemplates(category?: SMSTemplateCategory): SMSTemplate[] {
    const templates = Object.values(SMS_TEMPLATES);
    if (category) {
      return templates.filter((t) => t.category === category);
    }
    return templates;
  }

  renderTemplate(template: string, data: Record<string, unknown>): string {
    let rendered = template;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value ?? ''));
    });

    return rendered;
  }

  // ============================================
  // Convenience Methods for Recruitment
  // ============================================

  async sendInterviewReminder(
    phoneNumber: string,
    interview: {
      jobTitle: string;
      dateTime: Date;
      meetingLink?: string;
      location?: string;
    },
    company: { name: string }
  ): Promise<SMSSendResult> {
    let meetingInfo = '';
    if (interview.meetingLink) {
      meetingInfo = `Join: ${interview.meetingLink}`;
    } else if (interview.location) {
      meetingInfo = `Location: ${interview.location}`;
    }

    return this.sendTemplate('INTERVIEW_REMINDER', phoneNumber, {
      jobTitle: interview.jobTitle,
      companyName: company.name,
      dateTime: interview.dateTime.toLocaleString(),
      meetingInfo,
    });
  }

  async sendInterviewConfirmation(
    phoneNumber: string,
    interview: {
      jobTitle: string;
      dateTime: Date;
    },
    company: { name: string }
  ): Promise<SMSSendResult> {
    return this.sendTemplate('INTERVIEW_CONFIRMATION', phoneNumber, {
      jobTitle: interview.jobTitle,
      companyName: company.name,
      dateTime: interview.dateTime.toLocaleString(),
    });
  }

  async sendApplicationUpdate(
    phoneNumber: string,
    job: { title: string },
    company: { name: string },
    message: string
  ): Promise<SMSSendResult> {
    return this.sendTemplate('APPLICATION_STATUS', phoneNumber, {
      jobTitle: job.title,
      companyName: company.name,
      message,
    });
  }

  async sendVerificationCode(
    phoneNumber: string,
    code: string,
    company: { name: string },
    expiryMinutes = 10
  ): Promise<SMSSendResult> {
    return this.sendTemplate('VERIFICATION_CODE', phoneNumber, {
      companyName: company.name,
      code,
      expiry: expiryMinutes,
    });
  }

  async sendOfferNotification(
    phoneNumber: string,
    job: { title: string },
    company: { name: string }
  ): Promise<SMSSendResult> {
    return this.sendTemplate('OFFER_NOTIFICATION', phoneNumber, {
      jobTitle: job.title,
      companyName: company.name,
    });
  }

  // ============================================
  // Private Helpers
  // ============================================

  private isValidPhoneNumber(phone: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }

  private mapTwilioStatus(status: string): SMSSendResult['status'] {
    switch (status) {
      case 'delivered':
        return 'delivered';
      case 'sent':
        return 'sent';
      case 'queued':
      case 'accepted':
        return 'queued';
      default:
        return 'failed';
    }
  }
}

export default SMSService;
