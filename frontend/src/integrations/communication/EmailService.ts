// ============================================================
// EMAIL SERVICE - Email communication service
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  EmailMessage,
  EmailSendResult,
  EmailRecipient,
  IntegrationError,
} from '../types';

// ============================================
// Email Template Types
// ============================================
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: EmailTemplateCategory;
}

export type EmailTemplateCategory =
  | 'application'
  | 'interview'
  | 'offer'
  | 'rejection'
  | 'reminder'
  | 'notification'
  | 'onboarding'
  | 'custom';

// ============================================
// Predefined Email Templates
// ============================================
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  APPLICATION_RECEIVED: {
    id: 'application_received',
    name: 'Application Received',
    subject: 'Thank you for applying to {{jobTitle}}',
    htmlContent: `
      <h1>Thank you for your application, {{candidateName}}!</h1>
      <p>We have received your application for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
      <p>Our team will review your application and get back to you within {{responseTime}}.</p>
      <p>Best regards,<br/>{{senderName}}<br/>{{companyName}}</p>
    `,
    textContent: `Thank you for your application, {{candidateName}}!

We have received your application for the {{jobTitle}} position at {{companyName}}.

Our team will review your application and get back to you within {{responseTime}}.

Best regards,
{{senderName}}
{{companyName}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'responseTime', 'senderName'],
    category: 'application',
  },

  INTERVIEW_INVITATION: {
    id: 'interview_invitation',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <h1>Interview Invitation</h1>
      <p>Dear {{candidateName}},</p>
      <p>We are pleased to invite you to an interview for the <strong>{{jobTitle}}</strong> position.</p>
      <h2>Interview Details</h2>
      <ul>
        <li><strong>Date:</strong> {{interviewDate}}</li>
        <li><strong>Time:</strong> {{interviewTime}}</li>
        <li><strong>Duration:</strong> {{duration}} minutes</li>
        <li><strong>Type:</strong> {{interviewType}}</li>
        {{#if meetingLink}}<li><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Meeting</a></li>{{/if}}
        {{#if location}}<li><strong>Location:</strong> {{location}}</li>{{/if}}
      </ul>
      <p>Please confirm your attendance by clicking the button below:</p>
      <a href="{{confirmLink}}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:6px;">Confirm Attendance</a>
      <p>If you need to reschedule, please use this link: <a href="{{rescheduleLink}}">Reschedule</a></p>
      <p>Best regards,<br/>{{senderName}}<br/>{{companyName}}</p>
    `,
    variables: [
      'candidateName',
      'jobTitle',
      'companyName',
      'interviewDate',
      'interviewTime',
      'duration',
      'interviewType',
      'meetingLink',
      'location',
      'confirmLink',
      'rescheduleLink',
      'senderName',
    ],
    category: 'interview',
  },

  INTERVIEW_REMINDER: {
    id: 'interview_reminder',
    name: 'Interview Reminder',
    subject: 'Reminder: Interview Tomorrow for {{jobTitle}}',
    htmlContent: `
      <h1>Interview Reminder</h1>
      <p>Dear {{candidateName}},</p>
      <p>This is a friendly reminder about your upcoming interview for <strong>{{jobTitle}}</strong>.</p>
      <h2>Interview Details</h2>
      <ul>
        <li><strong>Date:</strong> {{interviewDate}}</li>
        <li><strong>Time:</strong> {{interviewTime}}</li>
        {{#if meetingLink}}<li><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Meeting</a></li>{{/if}}
      </ul>
      <p>We look forward to speaking with you!</p>
      <p>Best regards,<br/>{{senderName}}<br/>{{companyName}}</p>
    `,
    variables: [
      'candidateName',
      'jobTitle',
      'interviewDate',
      'interviewTime',
      'meetingLink',
      'senderName',
      'companyName',
    ],
    category: 'reminder',
  },

  OFFER_LETTER: {
    id: 'offer_letter',
    name: 'Offer Letter',
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <h1>Congratulations, {{candidateName}}!</h1>
      <p>We are thrilled to offer you the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p>
      <h2>Offer Details</h2>
      <ul>
        <li><strong>Position:</strong> {{jobTitle}}</li>
        <li><strong>Department:</strong> {{department}}</li>
        <li><strong>Start Date:</strong> {{startDate}}</li>
        <li><strong>Salary:</strong> {{salary}}</li>
        <li><strong>Location:</strong> {{location}}</li>
      </ul>
      <p>Please review the attached offer letter for complete details.</p>
      <p>To accept this offer, please click the button below:</p>
      <a href="{{acceptLink}}" style="display:inline-block;padding:12px 24px;background:#10B981;color:white;text-decoration:none;border-radius:6px;">Accept Offer</a>
      <p>This offer is valid until {{expirationDate}}.</p>
      <p>Best regards,<br/>{{senderName}}<br/>{{companyName}}</p>
    `,
    variables: [
      'candidateName',
      'jobTitle',
      'companyName',
      'department',
      'startDate',
      'salary',
      'location',
      'acceptLink',
      'expirationDate',
      'senderName',
    ],
    category: 'offer',
  },

  REJECTION: {
    id: 'rejection',
    name: 'Application Update',
    subject: 'Update on your application for {{jobTitle}}',
    htmlContent: `
      <p>Dear {{candidateName}},</p>
      <p>Thank you for taking the time to apply for the <strong>{{jobTitle}}</strong> position at {{companyName}} and for your interest in joining our team.</p>
      <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely align with our current needs.</p>
      <p>We encourage you to apply for future positions that match your skills and experience. We will keep your resume on file for potential opportunities.</p>
      <p>We wish you the best in your career journey.</p>
      <p>Best regards,<br/>{{senderName}}<br/>{{companyName}}</p>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'senderName'],
    category: 'rejection',
  },
};

// ============================================
// Email Service
// ============================================
export class EmailService extends BaseIntegrationService {
  private provider: 'sendgrid' | 'ses' | 'smtp';
  private fromEmail: string;
  private fromName: string;

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'email',
      name: 'Email Service',
      description: 'Send transactional emails to candidates and team members',
      icon: 'mail',
      category: 'communication',
      ...config,
    });

    this.provider = 'sendgrid';
    this.fromEmail = import.meta.env.VITE_EMAIL_FROM || 'noreply@example.com';
    this.fromName = import.meta.env.VITE_EMAIL_FROM_NAME || 'ManithPro';
  }

  async connect(): Promise<void> {
    try {
      await this.request('/communication/email/verify', { method: 'POST' });
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
  // Email Methods
  // ============================================

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const payload = {
      ...message,
      from: message.from || { email: this.fromEmail, name: this.fromName },
    };

    try {
      const response = await this.request<{ id: string; status: string }>(
        '/communication/email/send',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      return {
        id: response.id,
        status: response.status === 'sent' ? 'sent' : 'queued',
        sentAt: new Date(),
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
    to: EmailRecipient | EmailRecipient[],
    data: Record<string, unknown>,
    options?: {
      cc?: EmailRecipient[];
      bcc?: EmailRecipient[];
      scheduledAt?: Date;
    }
  ): Promise<EmailSendResult> {
    const template = EMAIL_TEMPLATES[templateId];

    if (!template) {
      throw this.createError('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`, false);
    }

    // Render template with data
    const subject = this.renderTemplate(template.subject, data);
    const html = this.renderTemplate(template.htmlContent, data);
    const text = template.textContent
      ? this.renderTemplate(template.textContent, data)
      : undefined;

    const recipients = Array.isArray(to) ? to : [to];

    return this.send({
      to: recipients,
      from: { email: this.fromEmail, name: this.fromName },
      subject,
      html,
      text,
      cc: options?.cc,
      bcc: options?.bcc,
      scheduledAt: options?.scheduledAt,
      templateId,
      templateData: data,
    });
  }

  async sendBulk(
    messages: EmailMessage[]
  ): Promise<Array<EmailSendResult>> {
    const results: EmailSendResult[] = [];

    // Send in batches of 10
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((msg) => this.send(msg)));
      results.push(...batchResults);
    }

    return results;
  }

  // ============================================
  // Template Methods
  // ============================================

  getTemplate(templateId: string): EmailTemplate | null {
    return EMAIL_TEMPLATES[templateId] || null;
  }

  getTemplates(category?: EmailTemplateCategory): EmailTemplate[] {
    const templates = Object.values(EMAIL_TEMPLATES);
    if (category) {
      return templates.filter((t) => t.category === category);
    }
    return templates;
  }

  renderTemplate(template: string, data: Record<string, unknown>): string {
    let rendered = template;

    // Simple variable replacement {{variable}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value ?? ''));
    });

    // Handle conditionals {{#if variable}}...{{/if}}
    rendered = rendered.replace(
      /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, varName, content) => {
        return data[varName] ? content : '';
      }
    );

    return rendered;
  }

  // ============================================
  // Convenience Methods for Recruitment
  // ============================================

  async sendApplicationReceived(
    candidate: { email: string; name: string },
    job: { title: string },
    company: { name: string },
    options?: { responseTime?: string; senderName?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplate(
      'APPLICATION_RECEIVED',
      { email: candidate.email, name: candidate.name },
      {
        candidateName: candidate.name,
        jobTitle: job.title,
        companyName: company.name,
        responseTime: options?.responseTime || '5-7 business days',
        senderName: options?.senderName || 'Recruiting Team',
      }
    );
  }

  async sendInterviewInvitation(
    candidate: { email: string; name: string },
    interview: {
      jobTitle: string;
      date: Date;
      duration: number;
      type: string;
      meetingLink?: string;
      location?: string;
    },
    company: { name: string },
    links: { confirm: string; reschedule: string },
    options?: { senderName?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplate(
      'INTERVIEW_INVITATION',
      { email: candidate.email, name: candidate.name },
      {
        candidateName: candidate.name,
        jobTitle: interview.jobTitle,
        companyName: company.name,
        interviewDate: interview.date.toLocaleDateString(),
        interviewTime: interview.date.toLocaleTimeString(),
        duration: interview.duration,
        interviewType: interview.type,
        meetingLink: interview.meetingLink,
        location: interview.location,
        confirmLink: links.confirm,
        rescheduleLink: links.reschedule,
        senderName: options?.senderName || 'Recruiting Team',
      }
    );
  }

  async sendInterviewReminder(
    candidate: { email: string; name: string },
    interview: {
      jobTitle: string;
      date: Date;
      meetingLink?: string;
    },
    company: { name: string },
    options?: { senderName?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplate(
      'INTERVIEW_REMINDER',
      { email: candidate.email, name: candidate.name },
      {
        candidateName: candidate.name,
        jobTitle: interview.jobTitle,
        interviewDate: interview.date.toLocaleDateString(),
        interviewTime: interview.date.toLocaleTimeString(),
        meetingLink: interview.meetingLink,
        senderName: options?.senderName || 'Recruiting Team',
        companyName: company.name,
      }
    );
  }

  async sendOfferLetter(
    candidate: { email: string; name: string },
    offer: {
      jobTitle: string;
      department: string;
      startDate: Date;
      salary: string;
      location: string;
      expirationDate: Date;
    },
    company: { name: string },
    acceptLink: string,
    options?: { senderName?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplate(
      'OFFER_LETTER',
      { email: candidate.email, name: candidate.name },
      {
        candidateName: candidate.name,
        jobTitle: offer.jobTitle,
        companyName: company.name,
        department: offer.department,
        startDate: offer.startDate.toLocaleDateString(),
        salary: offer.salary,
        location: offer.location,
        acceptLink,
        expirationDate: offer.expirationDate.toLocaleDateString(),
        senderName: options?.senderName || 'HR Team',
      }
    );
  }

  async sendRejection(
    candidate: { email: string; name: string },
    job: { title: string },
    company: { name: string },
    options?: { senderName?: string }
  ): Promise<EmailSendResult> {
    return this.sendTemplate(
      'REJECTION',
      { email: candidate.email, name: candidate.name },
      {
        candidateName: candidate.name,
        jobTitle: job.title,
        companyName: company.name,
        senderName: options?.senderName || 'Recruiting Team',
      }
    );
  }
}

export default EmailService;
