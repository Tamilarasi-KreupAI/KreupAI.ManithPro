// ============================================================
// SLACK SERVICE - Slack integration for team notifications
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  SlackMessage,
  SlackBlock,
  SlackAttachment,
  SlackSendResult,
} from '../types';

// ============================================
// Slack Channel Types
// ============================================
export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isMember: boolean;
}

export interface SlackUser {
  id: string;
  name: string;
  realName: string;
  email?: string;
  avatar?: string;
}

// ============================================
// Slack Service
// ============================================
export class SlackService extends BaseIntegrationService {
  private accessToken: string | null = null;
  private teamId: string | null = null;
  private defaultChannel: string | null = null;

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and updates to Slack channels',
      icon: 'slack',
      category: 'communication',
      ...config,
    });
  }

  async connect(): Promise<void> {
    try {
      const response = await this.request<{
        accessToken: string;
        teamId: string;
        teamName: string;
      }>('/communication/slack/connect', { method: 'POST' });

      this.accessToken = response.accessToken;
      this.teamId = response.teamId;
      this.setStatus('connected');
      this.config.connectedAt = new Date();
      this.config.metadata = { teamName: response.teamName };

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
    await this.request('/communication/slack/disconnect', { method: 'POST' });
    this.accessToken = null;
    this.teamId = null;
    this.setStatus('disconnected');

    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected' && this.accessToken !== null;
  }

  async refresh(): Promise<void> {
    const response = await this.request<{ accessToken: string }>(
      '/communication/slack/refresh',
      { method: 'POST' }
    );
    this.accessToken = response.accessToken;
  }

  // ============================================
  // Channel Management
  // ============================================

  async getChannels(): Promise<SlackChannel[]> {
    const response = await this.request<{
      channels: Array<{
        id: string;
        name: string;
        is_private: boolean;
        is_member: boolean;
      }>;
    }>('/communication/slack/channels');

    return response.channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
      isMember: ch.is_member,
    }));
  }

  async joinChannel(channelId: string): Promise<void> {
    await this.request(`/communication/slack/channels/${channelId}/join`, {
      method: 'POST',
    });
  }

  setDefaultChannel(channelId: string): void {
    this.defaultChannel = channelId;
  }

  // ============================================
  // User Management
  // ============================================

  async getUsers(): Promise<SlackUser[]> {
    const response = await this.request<{
      members: Array<{
        id: string;
        name: string;
        real_name: string;
        profile: { email?: string; image_72?: string };
      }>;
    }>('/communication/slack/users');

    return response.members.map((user) => ({
      id: user.id,
      name: user.name,
      realName: user.real_name,
      email: user.profile.email,
      avatar: user.profile.image_72,
    }));
  }

  async getUserByEmail(email: string): Promise<SlackUser | null> {
    try {
      const response = await this.request<{
        user: {
          id: string;
          name: string;
          real_name: string;
          profile: { email?: string; image_72?: string };
        };
      }>(`/communication/slack/users/email/${encodeURIComponent(email)}`);

      return {
        id: response.user.id,
        name: response.user.name,
        realName: response.user.real_name,
        email: response.user.profile.email,
        avatar: response.user.profile.image_72,
      };
    } catch {
      return null;
    }
  }

  // ============================================
  // Messaging
  // ============================================

  async sendMessage(message: SlackMessage): Promise<SlackSendResult> {
    const channel = message.channel || this.defaultChannel;

    if (!channel) {
      throw this.createError(
        'NO_CHANNEL',
        'No channel specified and no default channel set',
        false
      );
    }

    const response = await this.request<{
      ok: boolean;
      channel: string;
      ts: string;
      error?: string;
    }>('/communication/slack/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...message,
        channel,
      }),
    });

    return {
      ok: response.ok,
      channel: response.channel,
      ts: response.ts,
      error: response.error,
    };
  }

  async sendDirectMessage(
    userId: string,
    text: string,
    blocks?: SlackBlock[]
  ): Promise<SlackSendResult> {
    // Open DM channel first
    const dmResponse = await this.request<{ channel: { id: string } }>(
      '/communication/slack/conversations/open',
      {
        method: 'POST',
        body: JSON.stringify({ users: userId }),
      }
    );

    return this.sendMessage({
      channel: dmResponse.channel.id,
      text,
      blocks,
    });
  }

  async updateMessage(
    channel: string,
    ts: string,
    text: string,
    blocks?: SlackBlock[]
  ): Promise<SlackSendResult> {
    const response = await this.request<{
      ok: boolean;
      channel: string;
      ts: string;
      error?: string;
    }>('/communication/slack/messages/update', {
      method: 'POST',
      body: JSON.stringify({ channel, ts, text, blocks }),
    });

    return {
      ok: response.ok,
      channel: response.channel,
      ts: response.ts,
      error: response.error,
    };
  }

  async deleteMessage(channel: string, ts: string): Promise<void> {
    await this.request('/communication/slack/messages/delete', {
      method: 'POST',
      body: JSON.stringify({ channel, ts }),
    });
  }

  async addReaction(
    channel: string,
    ts: string,
    emoji: string
  ): Promise<void> {
    await this.request('/communication/slack/reactions/add', {
      method: 'POST',
      body: JSON.stringify({ channel, timestamp: ts, name: emoji }),
    });
  }

  // ============================================
  // Block Building Helpers
  // ============================================

  static createHeaderBlock(text: string): SlackBlock {
    return {
      type: 'header',
      text: { type: 'plain_text', text },
    };
  }

  static createSectionBlock(text: string, markdown = true): SlackBlock {
    return {
      type: 'section',
      text: { type: markdown ? 'mrkdwn' : 'plain_text', text },
    };
  }

  static createDividerBlock(): SlackBlock {
    return { type: 'divider' };
  }

  static createContextBlock(elements: string[]): SlackBlock {
    return {
      type: 'context',
      elements: elements.map((text) => ({ type: 'mrkdwn', text })),
    };
  }

  static createActionsBlock(
    buttons: Array<{
      text: string;
      actionId: string;
      style?: 'primary' | 'danger';
      url?: string;
    }>
  ): SlackBlock {
    return {
      type: 'actions',
      elements: buttons.map((btn) => ({
        type: btn.url ? 'button' : 'button',
        text: { type: 'plain_text', text: btn.text },
        action_id: btn.actionId,
        style: btn.style,
        url: btn.url,
      })),
    };
  }

  // ============================================
  // Recruitment-Specific Notifications
  // ============================================

  async notifyNewApplication(
    channel: string,
    application: {
      candidateName: string;
      candidateEmail: string;
      jobTitle: string;
      appliedAt: Date;
      resumeUrl?: string;
    },
    viewUrl: string
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('New Application Received'),
      SlackService.createSectionBlock(
        `*${application.candidateName}* applied for *${application.jobTitle}*`
      ),
      SlackService.createContextBlock([
        `Email: ${application.candidateEmail}`,
        `Applied: ${application.appliedAt.toLocaleString()}`,
      ]),
      SlackService.createDividerBlock(),
      SlackService.createActionsBlock([
        { text: 'View Application', actionId: 'view_application', style: 'primary', url: viewUrl },
        ...(application.resumeUrl
          ? [{ text: 'View Resume', actionId: 'view_resume', url: application.resumeUrl }]
          : []),
      ]),
    ];

    return this.sendMessage({
      channel,
      text: `New application from ${application.candidateName} for ${application.jobTitle}`,
      blocks,
    });
  }

  async notifyInterviewScheduled(
    channel: string,
    interview: {
      candidateName: string;
      jobTitle: string;
      interviewerName: string;
      dateTime: Date;
      type: string;
      meetingLink?: string;
    },
    viewUrl: string
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('Interview Scheduled'),
      SlackService.createSectionBlock(
        `Interview with *${interview.candidateName}* for *${interview.jobTitle}*`
      ),
      SlackService.createContextBlock([
        `Type: ${interview.type}`,
        `Date: ${interview.dateTime.toLocaleString()}`,
        `Interviewer: ${interview.interviewerName}`,
      ]),
      SlackService.createDividerBlock(),
      SlackService.createActionsBlock([
        { text: 'View Details', actionId: 'view_interview', style: 'primary', url: viewUrl },
        ...(interview.meetingLink
          ? [{ text: 'Join Meeting', actionId: 'join_meeting', url: interview.meetingLink }]
          : []),
      ]),
    ];

    return this.sendMessage({
      channel,
      text: `Interview scheduled: ${interview.candidateName} for ${interview.jobTitle}`,
      blocks,
    });
  }

  async notifyInterviewFeedbackNeeded(
    userId: string,
    interview: {
      candidateName: string;
      jobTitle: string;
      dateTime: Date;
    },
    feedbackUrl: string
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('Interview Feedback Needed'),
      SlackService.createSectionBlock(
        `Please submit feedback for your interview with *${interview.candidateName}* for *${interview.jobTitle}*`
      ),
      SlackService.createContextBlock([
        `Interview date: ${interview.dateTime.toLocaleString()}`,
      ]),
      SlackService.createActionsBlock([
        { text: 'Submit Feedback', actionId: 'submit_feedback', style: 'primary', url: feedbackUrl },
      ]),
    ];

    return this.sendDirectMessage(
      userId,
      `Feedback needed: Interview with ${interview.candidateName}`,
      blocks
    );
  }

  async notifyOfferExtended(
    channel: string,
    offer: {
      candidateName: string;
      jobTitle: string;
      expiresAt: Date;
    },
    viewUrl: string
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('Offer Extended'),
      SlackService.createSectionBlock(
        `Offer sent to *${offer.candidateName}* for *${offer.jobTitle}*`
      ),
      SlackService.createContextBlock([
        `Expires: ${offer.expiresAt.toLocaleDateString()}`,
      ]),
      SlackService.createActionsBlock([
        { text: 'View Offer', actionId: 'view_offer', style: 'primary', url: viewUrl },
      ]),
    ];

    return this.sendMessage({
      channel,
      text: `Offer extended to ${offer.candidateName} for ${offer.jobTitle}`,
      blocks,
    });
  }

  async notifyOfferAccepted(
    channel: string,
    offer: {
      candidateName: string;
      jobTitle: string;
      startDate: Date;
    }
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('Offer Accepted!'),
      SlackService.createSectionBlock(
        `*${offer.candidateName}* has accepted the offer for *${offer.jobTitle}*`
      ),
      SlackService.createContextBlock([
        `Start date: ${offer.startDate.toLocaleDateString()}`,
      ]),
    ];

    return this.sendMessage({
      channel,
      text: `${offer.candidateName} accepted offer for ${offer.jobTitle}`,
      blocks,
    });
  }

  async notifyDailyDigest(
    channel: string,
    digest: {
      newApplications: number;
      scheduledInterviews: number;
      pendingFeedback: number;
      activeJobs: number;
    },
    dashboardUrl: string
  ): Promise<SlackSendResult> {
    const blocks: SlackBlock[] = [
      SlackService.createHeaderBlock('Daily Recruitment Digest'),
      SlackService.createSectionBlock(
        `*Today's Overview:*\n` +
          `• New Applications: ${digest.newApplications}\n` +
          `• Scheduled Interviews: ${digest.scheduledInterviews}\n` +
          `• Pending Feedback: ${digest.pendingFeedback}\n` +
          `• Active Jobs: ${digest.activeJobs}`
      ),
      SlackService.createActionsBlock([
        { text: 'View Dashboard', actionId: 'view_dashboard', style: 'primary', url: dashboardUrl },
      ]),
    ];

    return this.sendMessage({
      channel,
      text: 'Daily Recruitment Digest',
      blocks,
    });
  }
}

export default SlackService;
