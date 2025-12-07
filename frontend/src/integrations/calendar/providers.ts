// ============================================================
// CALENDAR PROVIDERS - Provider-specific implementations
// ============================================================

import { CalendarService } from './CalendarService';
import { registerIntegration, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  CalendarEvent,
  CalendarAvailability,
  CalendarSyncResult,
} from '../types';

// ============================================
// Google Calendar Service
// ============================================
export class GoogleCalendarService extends CalendarService {
  private accessToken: string | null = null;

  constructor(config?: Partial<IntegrationConfig>) {
    super(
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync with Google Calendar for interview scheduling',
        icon: 'google-calendar',
        ...config,
      },
      'google'
    );
  }

  async connect(): Promise<void> {
    try {
      // Request connection through backend OAuth flow
      const response = await this.request<{ accessToken: string; calendarId: string }>(
        '/calendar/google/connect',
        { method: 'POST' }
      );

      this.accessToken = response.accessToken;
      this.calendarId = response.calendarId || 'primary';
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
    await this.request('/calendar/google/disconnect', { method: 'POST' });
    this.accessToken = null;
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
      '/calendar/google/refresh',
      { method: 'POST' }
    );
    this.accessToken = response.accessToken;
  }

  // ============================================
  // Event Methods
  // ============================================

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      calendarId: this.calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await this.request<{ items: Record<string, unknown>[] }>(
      `/calendar/google/events?${params}`
    );

    return response.items.map((item) => this.parseGoogleEvent(item));
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const response = await this.request<Record<string, unknown>>(
        `/calendar/google/events/${eventId}?calendarId=${this.calendarId}`
      );
      return this.parseGoogleEvent(response);
    } catch {
      return null;
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const googleEvent = this.formatGoogleEvent(event);

    const response = await this.request<Record<string, unknown>>(
      `/calendar/google/events?calendarId=${this.calendarId}`,
      {
        method: 'POST',
        body: JSON.stringify(googleEvent),
      }
    );

    return this.parseGoogleEvent(response);
  }

  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const googleUpdates = this.formatGoogleEvent(updates as Omit<CalendarEvent, 'id'>);

    const response = await this.request<Record<string, unknown>>(
      `/calendar/google/events/${eventId}?calendarId=${this.calendarId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(googleUpdates),
      }
    );

    return this.parseGoogleEvent(response);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request(
      `/calendar/google/events/${eventId}?calendarId=${this.calendarId}`,
      { method: 'DELETE' }
    );
  }

  // ============================================
  // Availability Methods
  // ============================================

  async getAvailability(
    startDate: Date,
    endDate: Date,
    userIds?: string[]
  ): Promise<CalendarAvailability[]> {
    const response = await this.request<{
      calendars: Record<string, { busy: Array<{ start: string; end: string }> }>;
    }>('/calendar/google/freebusy', {
      method: 'POST',
      body: JSON.stringify({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: (userIds || [this.calendarId]).map((id) => ({ id })),
      }),
    });

    const availability: CalendarAvailability[] = [];

    for (const calendar of Object.values(response.calendars)) {
      for (const busy of calendar.busy) {
        availability.push({
          start: new Date(busy.start),
          end: new Date(busy.end),
          busy: true,
        });
      }
    }

    return availability;
  }

  async syncEvents(): Promise<CalendarSyncResult> {
    const params = new URLSearchParams({
      calendarId: this.calendarId,
    });

    if (this.syncToken) {
      params.set('syncToken', this.syncToken);
    }

    const response = await this.request<{
      items: Record<string, unknown>[];
      nextSyncToken: string;
      created: number;
      updated: number;
      deleted: number;
    }>(`/calendar/google/sync?${params}`);

    this.syncToken = response.nextSyncToken;

    return {
      created: response.created,
      updated: response.updated,
      deleted: response.deleted,
      errors: [],
    };
  }

  // ============================================
  // Google-specific Methods
  // ============================================

  async createMeetingLink(eventId: string): Promise<string> {
    const response = await this.request<{ meetingLink: string }>(
      `/calendar/google/events/${eventId}/conference`,
      { method: 'POST' }
    );
    return response.meetingLink;
  }

  async getCalendarList(): Promise<
    Array<{ id: string; summary: string; primary: boolean }>
  > {
    const response = await this.request<{
      items: Array<{ id: string; summary: string; primary?: boolean }>;
    }>('/calendar/google/calendars');

    return response.items.map((cal) => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary || false,
    }));
  }

  // ============================================
  // Private Helpers
  // ============================================

  private formatGoogleEvent(event: Omit<CalendarEvent, 'id'>): Record<string, unknown> {
    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start?.toISOString(),
        timeZone: event.timezone,
      },
      end: {
        dateTime: event.end?.toISOString(),
        timeZone: event.timezone,
      },
      location: event.location,
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        displayName: a.name,
        optional: !a.required,
        responseStatus: a.status === 'pending' ? 'needsAction' : a.status,
      })),
      conferenceData: event.conferenceType === 'meet'
        ? {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          }
        : undefined,
      reminders: event.reminders
        ? {
            useDefault: false,
            overrides: event.reminders.map((r) => ({
              method: r.method,
              minutes: r.minutes,
            })),
          }
        : undefined,
    };
  }

  private parseGoogleEvent(data: Record<string, unknown>): CalendarEvent {
    const start = data.start as Record<string, string> | undefined;
    const end = data.end as Record<string, string> | undefined;
    const conferenceData = data.conferenceData as Record<string, unknown> | undefined;
    const reminders = data.reminders as Record<string, unknown> | undefined;

    return {
      id: String(data.id || ''),
      title: String(data.summary || ''),
      description: String(data.description || ''),
      start: new Date(start?.dateTime || start?.date || ''),
      end: new Date(end?.dateTime || end?.date || ''),
      timezone: String(start?.timeZone || 'UTC'),
      location: data.location as string | undefined,
      attendees: this.parseGoogleAttendees(data.attendees),
      conferenceLink: conferenceData?.entryPoints?.[0]?.uri as string | undefined,
      conferenceType: conferenceData ? 'meet' : undefined,
      status: this.mapGoogleStatus(data.status as string),
      reminders: this.parseGoogleReminders(reminders),
      metadata: {
        htmlLink: data.htmlLink,
        iCalUID: data.iCalUID,
        etag: data.etag,
      },
    };
  }

  private parseGoogleAttendees(attendees: unknown): CalendarEvent['attendees'] {
    if (!Array.isArray(attendees)) return [];

    return attendees.map((a: Record<string, unknown>) => ({
      email: String(a.email || ''),
      name: a.displayName as string | undefined,
      status: this.mapGoogleResponseStatus(a.responseStatus as string),
      required: !a.optional,
    }));
  }

  private parseGoogleReminders(
    reminders: Record<string, unknown> | undefined
  ): CalendarEvent['reminders'] {
    if (!reminders || reminders.useDefault) return undefined;

    const overrides = reminders.overrides as Array<Record<string, unknown>> | undefined;
    if (!overrides) return undefined;

    return overrides.map((r) => ({
      method: (r.method || 'popup') as 'email' | 'popup' | 'sms',
      minutes: Number(r.minutes || 15),
    }));
  }

  private mapGoogleStatus(status: string): CalendarEvent['status'] {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'tentative':
        return 'tentative';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'confirmed';
    }
  }

  private mapGoogleResponseStatus(
    status: string
  ): CalendarEvent['attendees'][0]['status'] {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      case 'tentative':
        return 'tentative';
      default:
        return 'pending';
    }
  }
}

// ============================================
// Outlook Calendar Service
// ============================================
export class OutlookCalendarService extends CalendarService {
  private accessToken: string | null = null;

  constructor(config?: Partial<IntegrationConfig>) {
    super(
      {
        id: 'outlook-calendar',
        name: 'Outlook Calendar',
        description: 'Sync with Microsoft Outlook Calendar',
        icon: 'outlook',
        ...config,
      },
      'outlook'
    );
  }

  async connect(): Promise<void> {
    try {
      const response = await this.request<{ accessToken: string }>(
        '/calendar/outlook/connect',
        { method: 'POST' }
      );

      this.accessToken = response.accessToken;
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
    await this.request('/calendar/outlook/disconnect', { method: 'POST' });
    this.accessToken = null;
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
      '/calendar/outlook/refresh',
      { method: 'POST' }
    );
    this.accessToken = response.accessToken;
  }

  // ============================================
  // Event Methods
  // ============================================

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    });

    const response = await this.request<{ value: Record<string, unknown>[] }>(
      `/calendar/outlook/events?${params}`
    );

    return response.value.map((item) => this.parseOutlookEvent(item));
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const response = await this.request<Record<string, unknown>>(
        `/calendar/outlook/events/${eventId}`
      );
      return this.parseOutlookEvent(response);
    } catch {
      return null;
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const outlookEvent = this.formatOutlookEvent(event);

    const response = await this.request<Record<string, unknown>>(
      '/calendar/outlook/events',
      {
        method: 'POST',
        body: JSON.stringify(outlookEvent),
      }
    );

    return this.parseOutlookEvent(response);
  }

  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const outlookUpdates = this.formatOutlookEvent(updates as Omit<CalendarEvent, 'id'>);

    const response = await this.request<Record<string, unknown>>(
      `/calendar/outlook/events/${eventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(outlookUpdates),
      }
    );

    return this.parseOutlookEvent(response);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request(`/calendar/outlook/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Availability Methods
  // ============================================

  async getAvailability(
    startDate: Date,
    endDate: Date,
    userIds?: string[]
  ): Promise<CalendarAvailability[]> {
    const response = await this.request<{
      value: Array<{
        scheduleItems: Array<{ start: { dateTime: string }; end: { dateTime: string }; status: string }>;
      }>;
    }>('/calendar/outlook/findMeetingTimes', {
      method: 'POST',
      body: JSON.stringify({
        schedules: userIds || ['me'],
        startTime: { dateTime: startDate.toISOString(), timeZone: 'UTC' },
        endTime: { dateTime: endDate.toISOString(), timeZone: 'UTC' },
      }),
    });

    const availability: CalendarAvailability[] = [];

    for (const schedule of response.value) {
      for (const item of schedule.scheduleItems) {
        availability.push({
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
          busy: item.status !== 'free',
        });
      }
    }

    return availability;
  }

  async syncEvents(): Promise<CalendarSyncResult> {
    const params = new URLSearchParams();

    if (this.syncToken) {
      params.set('deltaToken', this.syncToken);
    }

    const response = await this.request<{
      value: Record<string, unknown>[];
      deltaLink?: string;
      created: number;
      updated: number;
      deleted: number;
    }>(`/calendar/outlook/sync?${params}`);

    // Extract delta token from deltaLink
    if (response.deltaLink) {
      const url = new URL(response.deltaLink);
      this.syncToken = url.searchParams.get('$deltatoken');
    }

    return {
      created: response.created,
      updated: response.updated,
      deleted: response.deleted,
      errors: [],
    };
  }

  // ============================================
  // Outlook-specific Methods
  // ============================================

  async createTeamsMeeting(eventId: string): Promise<string> {
    const response = await this.request<{ joinUrl: string }>(
      `/calendar/outlook/events/${eventId}/onlineMeeting`,
      { method: 'POST' }
    );
    return response.joinUrl;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private formatOutlookEvent(event: Omit<CalendarEvent, 'id'>): Record<string, unknown> {
    return {
      subject: event.title,
      body: event.description
        ? { contentType: 'text', content: event.description }
        : undefined,
      start: event.start
        ? { dateTime: event.start.toISOString(), timeZone: event.timezone }
        : undefined,
      end: event.end
        ? { dateTime: event.end.toISOString(), timeZone: event.timezone }
        : undefined,
      location: event.location ? { displayName: event.location } : undefined,
      attendees: event.attendees?.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
        type: a.required ? 'required' : 'optional',
      })),
      isOnlineMeeting: event.conferenceType === 'teams',
      onlineMeetingProvider: event.conferenceType === 'teams' ? 'teamsForBusiness' : undefined,
    };
  }

  private parseOutlookEvent(data: Record<string, unknown>): CalendarEvent {
    const start = data.start as Record<string, string> | undefined;
    const end = data.end as Record<string, string> | undefined;
    const body = data.body as Record<string, string> | undefined;
    const location = data.location as Record<string, string> | undefined;

    return {
      id: String(data.id || ''),
      title: String(data.subject || ''),
      description: body?.content || '',
      start: new Date(start?.dateTime || ''),
      end: new Date(end?.dateTime || ''),
      timezone: String(start?.timeZone || 'UTC'),
      location: location?.displayName,
      attendees: this.parseOutlookAttendees(data.attendees),
      conferenceLink: data.onlineMeeting
        ? (data.onlineMeeting as Record<string, string>).joinUrl
        : undefined,
      conferenceType: data.isOnlineMeeting ? 'teams' : undefined,
      status: this.mapOutlookStatus(data.showAs as string),
      metadata: {
        webLink: data.webLink,
        iCalUId: data.iCalUId,
      },
    };
  }

  private parseOutlookAttendees(attendees: unknown): CalendarEvent['attendees'] {
    if (!Array.isArray(attendees)) return [];

    return attendees.map((a: Record<string, unknown>) => {
      const emailAddress = a.emailAddress as Record<string, string>;
      const status = a.status as Record<string, string>;

      return {
        email: emailAddress?.address || '',
        name: emailAddress?.name,
        status: this.mapOutlookResponseStatus(status?.response),
        required: a.type === 'required',
      };
    });
  }

  private mapOutlookStatus(showAs: string): CalendarEvent['status'] {
    switch (showAs) {
      case 'free':
        return 'tentative';
      case 'busy':
      case 'oof':
      case 'workingElsewhere':
        return 'confirmed';
      default:
        return 'confirmed';
    }
  }

  private mapOutlookResponseStatus(
    response: string
  ): CalendarEvent['attendees'][0]['status'] {
    switch (response) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      case 'tentativelyAccepted':
        return 'tentative';
      default:
        return 'pending';
    }
  }
}

// ============================================
// Register Providers
// ============================================
registerIntegration('google-calendar', GoogleCalendarService);
registerIntegration('outlook-calendar', OutlookCalendarService);

// ============================================
// Export
// ============================================
export const calendarProviders = {
  google: GoogleCalendarService,
  outlook: OutlookCalendarService,
};

export default calendarProviders;
