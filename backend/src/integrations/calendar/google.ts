// @ts-nocheck
/**
 * Google Calendar Integration
 *
 * Production-ready integration with Google Calendar API
 * Supports OAuth, event management, and availability checking
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Types
export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CalendarTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  timeZone?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    optional?: boolean;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    type: 'hangoutsMeet' | 'addOn';
    requestId?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  recurrence?: string[];
  colorId?: string;
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface FreeBusyQuery {
  timeMin: Date;
  timeMax: Date;
  timeZone?: string;
  calendars: string[];
}

export interface FreeBusyResponse {
  calendar: string;
  busy: Array<{
    start: string;
    end: string;
  }>;
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(config: GoogleCalendarConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const defaultScopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes || defaultScopes,
      state,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<CalendarTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || undefined,
      expiryDate: tokens.expiry_date || undefined,
    };
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(tokens: CalendarTokens): void {
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
    });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<CalendarTokens> {
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || undefined,
      expiryDate: credentials.expiry_date || undefined,
    };
  }

  /**
   * List calendars
   */
  async listCalendars(): Promise<Array<{ id: string; summary: string; primary: boolean }>> {
    const response = await this.calendar.calendarList.list();
    return (response.data.items || []).map(cal => ({
      id: cal.id!,
      summary: cal.summary!,
      primary: cal.primary || false,
    }));
  }

  /**
   * Create calendar event
   */
  async createEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<{ id: string; htmlLink: string; meetLink?: string }> {
    const eventResource: calendar_v3.Schema$Event = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timeZone || 'UTC',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timeZone || 'UTC',
      },
      attendees: event.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        optional: a.optional,
        responseStatus: a.responseStatus,
      })),
      reminders: event.reminders,
      recurrence: event.recurrence,
      colorId: event.colorId,
      visibility: event.visibility,
      status: event.status,
    };

    // Request Google Meet conference
    if (event.conferenceData?.type === 'hangoutsMeet') {
      eventResource.conferenceData = {
        createRequest: {
          requestId: event.conferenceData.requestId || `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: eventResource,
      conferenceDataVersion: event.conferenceData ? 1 : 0,
      sendUpdates: event.attendees?.length ? 'all' : 'none',
    });

    return {
      id: response.data.id!,
      htmlLink: response.data.htmlLink!,
      meetLink: response.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri,
    };
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<{ id: string; htmlLink: string }> {
    const eventResource: calendar_v3.Schema$Event = {};

    if (updates.summary) eventResource.summary = updates.summary;
    if (updates.description) eventResource.description = updates.description;
    if (updates.location) eventResource.location = updates.location;
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
    if (updates.attendees) {
      eventResource.attendees = updates.attendees.map(a => ({
        email: a.email,
        displayName: a.displayName,
        optional: a.optional,
      }));
    }
    if (updates.status) eventResource.status = updates.status;

    const response = await this.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: eventResource,
      sendUpdates: updates.attendees?.length ? 'all' : 'none',
    });

    return {
      id: response.data.id!,
      htmlLink: response.data.htmlLink!,
    };
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary', sendCancellation: boolean = true): Promise<void> {
    await this.calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: sendCancellation ? 'all' : 'none',
    });
  }

  /**
   * Get event details
   */
  async getEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarEvent | null> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      const event = response.data;
      return {
        id: event.id!,
        summary: event.summary!,
        description: event.description || undefined,
        location: event.location || undefined,
        start: new Date(event.start?.dateTime || event.start?.date!),
        end: new Date(event.end?.dateTime || event.end?.date!),
        timeZone: event.start?.timeZone || undefined,
        attendees: event.attendees?.map(a => ({
          email: a.email!,
          displayName: a.displayName || undefined,
          optional: a.optional || undefined,
          responseStatus: a.responseStatus as any,
        })),
        status: event.status as any,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * List events in a time range
   */
  async listEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId: string = 'primary',
    maxResults: number = 100
  ): Promise<CalendarEvent[]> {
    const response = await this.calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map(event => ({
      id: event.id!,
      summary: event.summary!,
      description: event.description || undefined,
      location: event.location || undefined,
      start: new Date(event.start?.dateTime || event.start?.date!),
      end: new Date(event.end?.dateTime || event.end?.date!),
      timeZone: event.start?.timeZone || undefined,
      attendees: event.attendees?.map(a => ({
        email: a.email!,
        displayName: a.displayName || undefined,
        responseStatus: a.responseStatus as any,
      })),
      status: event.status as any,
    }));
  }

  /**
   * Check free/busy status
   */
  async getFreeBusy(query: FreeBusyQuery): Promise<FreeBusyResponse[]> {
    const response = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: query.timeMin.toISOString(),
        timeMax: query.timeMax.toISOString(),
        timeZone: query.timeZone || 'UTC',
        items: query.calendars.map(id => ({ id })),
      },
    });

    const calendars = response.data.calendars || {};
    return query.calendars.map(calId => ({
      calendar: calId,
      busy: (calendars[calId]?.busy || []).map(b => ({
        start: b.start!,
        end: b.end!,
      })),
    }));
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(
    calendars: string[],
    timeMin: Date,
    timeMax: Date,
    slotDuration: number, // minutes
    options?: {
      workingHoursStart?: number; // 0-23
      workingHoursEnd?: number; // 0-23
      excludeWeekends?: boolean;
      timeZone?: string;
    }
  ): Promise<AvailabilitySlot[]> {
    const freeBusy = await this.getFreeBusy({
      timeMin,
      timeMax,
      calendars,
      timeZone: options?.timeZone,
    });

    // Merge all busy periods
    const allBusy: Array<{ start: Date; end: Date }> = [];
    for (const cal of freeBusy) {
      for (const busy of cal.busy) {
        allBusy.push({
          start: new Date(busy.start),
          end: new Date(busy.end),
        });
      }
    }

    // Sort busy periods by start time
    allBusy.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Find available slots
    const slots: AvailabilitySlot[] = [];
    const slotMs = slotDuration * 60 * 1000;
    let current = new Date(timeMin);

    while (current.getTime() + slotMs <= timeMax.getTime()) {
      const slotEnd = new Date(current.getTime() + slotMs);

      // Check working hours
      const hour = current.getHours();
      const day = current.getDay();
      const isWeekend = day === 0 || day === 6;

      const workStart = options?.workingHoursStart ?? 9;
      const workEnd = options?.workingHoursEnd ?? 17;

      if (
        (options?.excludeWeekends && isWeekend) ||
        hour < workStart ||
        hour >= workEnd
      ) {
        current = new Date(current.getTime() + slotMs);
        continue;
      }

      // Check if slot overlaps with any busy period
      const isAvailable = !allBusy.some(
        busy =>
          current.getTime() < busy.end.getTime() &&
          slotEnd.getTime() > busy.start.getTime()
      );

      slots.push({
        start: new Date(current),
        end: slotEnd,
        available: isAvailable,
      });

      current = new Date(current.getTime() + slotMs);
    }

    return slots;
  }
}

// Singleton instance
let googleCalendarInstance: GoogleCalendarService | null = null;

export function initGoogleCalendar(config: GoogleCalendarConfig): GoogleCalendarService {
  googleCalendarInstance = new GoogleCalendarService(config);
  return googleCalendarInstance;
}

export function getGoogleCalendar(): GoogleCalendarService {
  if (!googleCalendarInstance) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.API_URL}/api/integrations/google-calendar/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google Calendar configuration is incomplete');
    }

    googleCalendarInstance = new GoogleCalendarService({ clientId, clientSecret, redirectUri });
  }
  return googleCalendarInstance;
}

export default GoogleCalendarService;
