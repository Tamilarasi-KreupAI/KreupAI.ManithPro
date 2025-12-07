/**
 * AWS SES Email Integration
 *
 * Production-ready email service using AWS Simple Email Service
 * Supports templates, bulk sending, and delivery tracking
 */

import {
  SESClient,
  SendEmailCommand,
  SendBulkTemplatedEmailCommand,
  SendTemplatedEmailCommand,
  CreateTemplateCommand,
  UpdateTemplateCommand,
  DeleteTemplateCommand,
  GetSendQuotaCommand,
  GetSendStatisticsCommand,
} from '@aws-sdk/client-ses';

// Types
export interface SESConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  configurationSetName?: string;
}

export interface SendTemplatedEmailOptions {
  to: string | string[];
  templateName: string;
  templateData: Record<string, any>;
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
}

export interface BulkEmailDestination {
  email: string;
  templateData: Record<string, any>;
}

export interface SESResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  text?: string;
  html?: string;
}

class SESService {
  private client: SESClient;
  private fromEmail: string;
  private fromName: string;

  constructor(config: SESConfig) {
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'ManithPro';

    const clientConfig: any = {
      region: config.region,
    };

    // Only set credentials if explicitly provided (otherwise uses IAM role)
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new SESClient(clientConfig);
  }

  /**
   * Get formatted sender address
   */
  private getSourceAddress(): string {
    return this.fromName ? `${this.fromName} <${this.fromEmail}>` : this.fromEmail;
  }

  /**
   * Send a single email
   */
  async sendEmail(options: SendEmailOptions): Promise<SESResponse> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      const command = new SendEmailCommand({
        Source: this.getSourceAddress(),
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: options.cc,
          BccAddresses: options.bcc,
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            ...(options.text && {
              Text: {
                Data: options.text,
                Charset: 'UTF-8',
              },
            }),
            ...(options.html && {
              Html: {
                Data: options.html,
                Charset: 'UTF-8',
              },
            }),
          },
        },
        ReplyToAddresses: options.replyTo,
        ConfigurationSetName: options.configurationSetName,
      });

      const response = await this.client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      console.error('SES error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<SESResponse> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      const command = new SendTemplatedEmailCommand({
        Source: this.getSourceAddress(),
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: options.cc,
          BccAddresses: options.bcc,
        },
        Template: options.templateName,
        TemplateData: JSON.stringify(options.templateData),
        ReplyToAddresses: options.replyTo,
      });

      const response = await this.client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      console.error('SES templated email error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send bulk templated emails (up to 50 destinations per request)
   */
  async sendBulkTemplatedEmail(
    templateName: string,
    destinations: BulkEmailDestination[],
    defaultTemplateData?: Record<string, any>
  ): Promise<SESResponse> {
    try {
      // SES allows up to 50 destinations per bulk send
      const batches = this.chunkArray(destinations, 50);
      const results: SESResponse[] = [];

      for (const batch of batches) {
        const command = new SendBulkTemplatedEmailCommand({
          Source: this.getSourceAddress(),
          Template: templateName,
          DefaultTemplateData: JSON.stringify(defaultTemplateData || {}),
          Destinations: batch.map(dest => ({
            Destination: {
              ToAddresses: [dest.email],
            },
            ReplacementTemplateData: JSON.stringify(dest.templateData),
          })),
        });

        const response = await this.client.send(command);
        const allSucceeded = response.Status?.every(s => s.Status === 'Success');

        results.push({
          success: allSucceeded || false,
          error: allSucceeded ? undefined : 'Some emails failed',
        });
      }

      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        error: allSuccessful ? undefined : 'Some batches failed',
      };
    } catch (error: any) {
      console.error('SES bulk email error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create an email template
   */
  async createTemplate(template: EmailTemplate): Promise<SESResponse> {
    try {
      const command = new CreateTemplateCommand({
        Template: {
          TemplateName: template.name,
          SubjectPart: template.subject,
          TextPart: template.text,
          HtmlPart: template.html,
        },
      });

      await this.client.send(command);

      return { success: true };
    } catch (error: any) {
      console.error('SES create template error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update an email template
   */
  async updateTemplate(template: EmailTemplate): Promise<SESResponse> {
    try {
      const command = new UpdateTemplateCommand({
        Template: {
          TemplateName: template.name,
          SubjectPart: template.subject,
          TextPart: template.text,
          HtmlPart: template.html,
        },
      });

      await this.client.send(command);

      return { success: true };
    } catch (error: any) {
      console.error('SES update template error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete an email template
   */
  async deleteTemplate(templateName: string): Promise<SESResponse> {
    try {
      const command = new DeleteTemplateCommand({
        TemplateName: templateName,
      });

      await this.client.send(command);

      return { success: true };
    } catch (error: any) {
      console.error('SES delete template error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get sending quota information
   */
  async getSendQuota(): Promise<{
    max24HourSend: number;
    maxSendRate: number;
    sentLast24Hours: number;
  } | null> {
    try {
      const command = new GetSendQuotaCommand({});
      const response = await this.client.send(command);

      return {
        max24HourSend: response.Max24HourSend || 0,
        maxSendRate: response.MaxSendRate || 0,
        sentLast24Hours: response.SentLast24Hours || 0,
      };
    } catch (error: any) {
      console.error('SES get quota error:', error.message);
      return null;
    }
  }

  /**
   * Get sending statistics
   */
  async getSendStatistics(): Promise<any[]> {
    try {
      const command = new GetSendStatisticsCommand({});
      const response = await this.client.send(command);

      return response.SendDataPoints || [];
    } catch (error: any) {
      console.error('SES get statistics error:', error.message);
      return [];
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
let sesInstance: SESService | null = null;

export function initSES(config: SESConfig): SESService {
  sesInstance = new SESService(config);
  return sesInstance;
}

export function getSES(): SESService {
  if (!sesInstance) {
    // Auto-initialize from environment variables
    const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || 'us-east-1';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@manithpro.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'ManithPro';

    sesInstance = new SESService({
      region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      fromEmail,
      fromName,
    });
  }
  return sesInstance;
}

export default SESService;
