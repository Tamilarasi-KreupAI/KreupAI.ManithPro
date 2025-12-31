// @ts-nocheck
/**
 * Microsoft Outlook Calendar Integration
 *
 * Production-ready integration with Microsoft Graph API
 * Supports OAuth, event management, and Teams meeting creation
 */

import axios, { AxiosInstance } from 'axios';
import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';

// Types
export interface OutlookConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export interface OutlookTokens {
  accessToken: string;
  refreshToken?: string;
  expiresOn?: Date;
}

export interface OutlookEvent {
  id?: string;
  subject: string;
  body?: {
    contentType: 'text' | 'html';
    content: string;
  };
  start: Date;
  end: Date;
  timeZone?: string;
  location?: {
    displayName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      countryOrRegion?: string;
    };
  };
  attendees?: Array<{
    email: string;
    name?: string;
    type?: 'required' | 'optional' | 'resource';
    status?: 'none' | 'accepted' | 'declined' | 'tentativelyAccepted';
  }>;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'teamsForBusiness' | 'skypeForBusiness' | 'skypeForConsumer';
  recurrence?: {
    pattern: {
      type: 'daily' | 'weekly' | 'absoluteMonthly' | 'relativeMonthly' | 'absoluteYearly' | 'relativeYearly';
      interval: number;
      daysOfWeek?: string[];
      dayOfMonth?: number;
      month?: number;
    };
    range: {
      type: 'endDate' | 'noEnd' | 'numbered';
      startDate: string;
      endDate?: string;
      numberOfOccurrences?: number;
    };
  };
  reminder?: number; // minutes before
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
  importance?: 'low' | 'normal' | 'high';
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential';
  categories?: string[];
}

export interface OnlineMeetingInfo {
  joinUrl: string;
  conferenceId?: string;
  tollNumber?: string;
  tollFreeNumber?: string;
}

export interface ScheduleInfo {
  scheduleId: string;
  availabilityView: string;
  scheduleItems: Array<{
    status: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
    start: string;
    end: string;
    subject?: string;
    location?: string;
  }>;
  workingHours?: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    timeZone: string;
  };
}

class OutlookCalendarService {
  private msalClient: ConfidentialClientApplication;
  private graphClient: AxiosInstance;
  private config: OutlookConfig;

  constructor(config: OutlookConfig) {
    this.config = config;

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
      },
    });

    this.graphClient = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const defaultScopes = [
      'openid',
      'profile',
      'email',
      'offline_access',
      'Calendars.ReadWrite',
      'OnlineMeetings.ReadWrite',
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: 'query',
      scope: (scopes || defaultScopes).join(' '),
      state,
    });

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OutlookTokens> {
    const tokenRequest = {
      code,
      scopes: ['Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
      redirectUri: this.config.redirectUri,
    };

    const response = await this.msalClient.acquireTokenByCode(tokenRequest);

    return {
      accessToken: response!.accessToken,
      expiresOn: response!.expiresOn || undefined,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(accountIdentifier: string): Promise<OutlookTokens> {
    const account = await this.msalClient.getTokenCache().getAccountByHomeId(accountIdentifier);
    if (!account) {
      throw new Error('Account not found in cache');
    }

    const response = await this.msalClient.acquireTokenSilent({
      account,
      scopes: ['Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
    });

    return {
      accessToken: response!.accessToken,
      expiresOn: response!.expiresOn || undefined,
    };
  }

  /**
   * Set access token for Graph API calls
   */
  setAccessToken(accessToken: string): void {
    this.graphClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  /**
   * List calendars
   */
  async listCalendars(): Promise<Array<{ id: string; name: string; isDefault: boolean }>> {
    const response = await this.graphClient.get('/me/calendars');
    return (response.data.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      isDefault: cal.isDefaultCalendar || false,
    }));
  }

  /**
   * Create calendar event
   */
  async createEvent(
    event: OutlookEvent,
    calendarId?: string
  ): Promise<{ id: string; webLink: string; onlineMeeting?: OnlineMeetingInfo }> {
    const endpoint = calendarId
      ? `/me/calendars/${calendarId}/events`
      : '/me/calendar/events';

    const eventResource: any = {
      subject: event.subject,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timeZone || 'UTC',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timeZone || 'UTC',
      },
    };

    if (event.body) {
      eventResource.body = event.body;
    }

    if (event.location) {
      eventResource.location = {
        displayName: event.location.displayName,
        address: event.location.address,
      };
    }

    if (event.attendees) {
      eventResource.attendees = event.attendees.map(a => ({
        emailAddress: {
          address: a.email,
          name: a.name,
        },
        type: a.type || 'required',
      }));
    }

    if (event.isOnlineMeeting) {
      eventResource.isOnlineMeeting = true;
      eventResource.onlineMeetingProvider = event.onlineMeetingProvider || 'teamsForBusiness';
    }

    if (event.recurrence) {
      eventResource.recurrence = event.recurrence;
    }

    if (event.reminder !== undefined) {
      eventResource.reminderMinutesBeforeStart = event.reminder;
    }

    if (event.showAs) {
      eventResource.showAs = event.showAs;
    }

    if (event.importance) {
      eventResource.importance = event.importance;
    }

    if (event.sensitivity) {
      eventResource.sensitivity = event.sensitivity;
    }

    if (event.categories) {
      eventResource.categories = event.categories;
    }

    const response = await this.graphClient.post(endpoint, eventResource);
    const data = response.data;

    let onlineMeeting: OnlineMeetingInfo | undefined;
    if (data.onlineMeeting) {
      onlineMeeting = {
        joinUrl: data.onlineMeeting.joinUrl,
        conferenceId: data.onlineMeeting.conferenceId,
        tollNumber: data.onlineMeeting.tollNumber,
        tollFreeNumber: data.onlineMeeting.tollFreeNumbers?.[0],
      };
    }

    return {
      id: data.id,
      webLink: data.webLink,
      onlineMeeting,
    };
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<OutlookEvent>,
    calendarId?: string
  ): Promise<{ id: string; webLink: string }> {
    const endpoint = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}`
      : `/me/calendar/events/${eventId}`;

    const eventResource: any = {};

    if (updates.subject) eventResource.subject = updates.subject;
    if (updates.body) eventResource.body = updates.body;
    if (updates.start) {
      eventResource.start = {
        dateTime: updates.start.toISOString(),
        timeZone: updates.timeZone || 'UTC',
      };
    }
    if (updates.end) {
      eventResource.end = {
        dateTime: updates.end.toISOString(),
        timeZone: updates.timeZone || 'UTC',
      };
    }
    if (updates.location) {
      eventResource.location = {
        displayName: updates.location.displayName,
        address: updates.location.address,
      };
    }
    if (updates.attendees) {
      eventResource.attendees = updates.attendees.map(a => ({
        emailAddress: {
          address: a.email,
          name: a.name,
        },
        type: a.type || 'required',
      }));
    }

    const response = await this.graphClient.patch(endpoint, eventResource);

    return {
      id: response.data.id,
      webLink: response.data.webLink,
    };
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string, calendarId?: string): Promise<void> {
    const endpoint = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}`
      : `/me/calendar/events/${eventId}`;

    await this.graphClient.delete(endpoint);
  }

  /**
   * Get event details
   */
  async getEvent(eventId: string, calendarId?: string): Promise<OutlookEvent | null> {
    try {
      const endpoint = calendarId
        ? `/me/calendars/${calendarId}/events/${eventId}`
        : `/me/calendar/events/${eventId}`;

      const response = await this.graphClient.get(endpoint);
      const event = response.data;

      return {
        id: event.id,
        subject: event.subject,
        body: event.body,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        timeZone: event.start.timeZone,
        location: event.location?.displayName ? {
          displayName: event.location.displayName,
          address: event.location.address,
        } : undefined,
        attendees: event.attendees?.map((a: any) => ({
          email: a.emailAddress.address,
          name: a.emailAddress.name,
          type: a.type,
          status: a.status?.response,
        })),
        isOnlineMeeting: event.isOnlineMeeting,
        showAs: event.showAs,
        importance: event.importance,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * List events in a time range
   */
  async listEvents(
    startDate: Date,
    endDate: Date,
    calendarId?: string,
    top: number = 100
  ): Promise<OutlookEvent[]> {
    const endpoint = calendarId
      ? `/me/calendars/${calendarId}/calendarView`
      : '/me/calendar/calendarView';

    const response = await this.graphClient.get(endpoint, {
      params: {
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $top: top,
        $orderby: 'start/dateTime',
      },
    });

    return (response.data.value || []).map((event: any) => ({
      id: event.id,
      subject: event.subject,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      timeZone: event.start.timeZone,
      location: event.location?.displayName ? {
        displayName: event.location.displayName,
      } : undefined,
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress.address,
        name: a.emailAddress.name,
        status: a.status?.response,
      })),
      showAs: event.showAs,
    }));
  }

  /**
   * Get schedule/availability information
   */
  async getSchedule(
    schedules: string[],
    startTime: Date,
    endTime: Date,
    timeZone: string = 'UTC'
  ): Promise<ScheduleInfo[]> {
    const response = await this.graphClient.post('/me/calendar/getSchedule', {
      schedules,
      startTime: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      endTime: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      availabilityViewInterval: 30, // 30-minute intervals
    });

    return (response.data.value || []).map((schedule: any) => ({
      scheduleId: schedule.scheduleId,
      availabilityView: schedule.availabilityView,
      scheduleItems: (schedule.scheduleItems || []).map((item: any) => ({
        status: item.status,
        start: item.start.dateTime,
        end: item.end.dateTime,
        subject: item.subject,
        location: item.location,
      })),
      workingHours: schedule.workingHours ? {
        startTime: schedule.workingHours.startTime,
        endTime: schedule.workingHours.endTime,
        daysOfWeek: schedule.workingHours.daysOfWeek,
        timeZone: schedule.workingHours.timeZone?.name,
      } : undefined,
    }));
  }

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(
    subject: string,
    startTime: Date,
    endTime: Date,
    participants?: string[]
  ): Promise<OnlineMeetingInfo> {
    const response = await this.graphClient.post('/me/onlineMeetings', {
      subject,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      participants: participants ? {
        attendees: participants.map(email => ({
          upn: email,
          role: 'attendee',
        })),
      } : undefined,
    });

    return {
      joinUrl: response.data.joinWebUrl,
      conferenceId: response.data.id,
      tollNumber: response.data.audioConferencing?.tollNumber,
      tollFreeNumber: response.data.audioConferencing?.tollFreeNumber,
    };
  }
}

// Singleton instance
let outlookInstance: OutlookCalendarService | null = null;

export function initOutlookCalendar(config: OutlookConfig): OutlookCalendarService {
  outlookInstance = new OutlookCalendarService(config);
  return outlookInstance;
}

export function getOutlookCalendar(): OutlookCalendarService {
  if (!outlookInstance) {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.API_URL}/api/integrations/outlook-calendar/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Outlook Calendar configuration is incomplete');
    }

    outlookInstance = new OutlookCalendarService({ clientId, clientSecret, tenantId, redirectUri });
  }
  return outlookInstance;
}

export default OutlookCalendarService;
