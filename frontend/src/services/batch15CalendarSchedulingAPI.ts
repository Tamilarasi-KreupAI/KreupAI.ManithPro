import axios from 'axios';
import {
  CalendarIntegration,
  CalendarEvent,
  ConnectCalendarRequest,
  CreateCalendarEventRequest,
  CalendarConflict,
  BufferTimeSettings,
  WorkingHours,
  CreateWorkingHoursRequest,
  Holiday,
  AddHolidayRequest,
  SchedulingLink,
  CreateSchedulingLinkRequest,
  SchedulingBooking,
  BookSlotRequest,
  AvailableSlot,
  AvailabilitySlot,
  GenerateAvailabilityRequest,
  PanelSession,
  CreatePanelSessionRequest,
  SubmitPanelAvailabilityRequest,
  OptimalPanelTime,
  TimezonePreference,
  TimezoneConversion,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock Data
const mockCalendarIntegration: CalendarIntegration = {
  id: 'cal-001',
  userId: 'user-001',
  provider: 'GOOGLE',
  name: 'Work Calendar',
  email: 'john@company.com',
  isDefault: true,
  isPrimary: true,
  syncEnabled: true,
  syncDirection: 'BIDIRECTIONAL',
  lastSyncAt: new Date().toISOString(),
  syncStatus: 'SYNCED',
  color: '#4285f4',
  timezone: 'America/New_York',
  showInAvailability: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: { events: 45 }
};

const mockCalendarEvent: CalendarEvent = {
  id: 'evt-001',
  calendarId: 'cal-001',
  userId: 'user-001',
  title: 'Technical Interview - John Doe',
  description: 'Senior Developer position interview',
  location: 'Zoom',
  meetingLink: 'https://zoom.us/j/123456',
  startTime: new Date(Date.now() + 86400000).toISOString(),
  endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
  allDay: false,
  timezone: 'America/New_York',
  isRecurring: false,
  status: 'CONFIRMED',
  visibility: 'BUSY',
  syncStatus: 'SYNCED',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockWorkingHours: WorkingHours = {
  id: 'wh-001',
  userId: 'user-001',
  name: 'Default',
  timezone: 'America/New_York',
  isDefault: true,
  monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
  minNoticeHours: 24,
  maxAdvanceDays: 30,
  slotDuration: 30,
  slotIncrement: 15,
  lunchStart: '12:00',
  lunchEnd: '13:00',
  excludeLunch: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockSchedulingLink: SchedulingLink = {
  id: 'sl-001',
  userId: 'user-001',
  slug: 'john-smith-interview',
  name: '30-Minute Interview',
  description: 'Initial phone screen for open positions',
  isActive: true,
  meetingType: 'PHONE_SCREEN',
  duration: 30,
  bufferBefore: 5,
  bufferAfter: 5,
  minNotice: 24,
  maxAdvance: 14,
  requireConfirmation: false,
  autoConfirm: true,
  notifyOnBooking: true,
  viewCount: 125,
  bookingCount: 23,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockPanelSession: PanelSession = {
  id: 'ps-001',
  organizerId: 'user-001',
  name: 'Final Round - Jane Smith',
  description: 'Panel interview for Senior Developer position',
  duration: 60,
  panelists: [],
  status: 'SCHEDULING',
  minPanelistsRequired: 3,
  requireAllPanelists: false,
  candidateName: 'Jane Smith',
  candidateEmail: 'jane@email.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Calendar Integration APIs
export const calendarAPI = {
  connect: async (request: ConnectCalendarRequest): Promise<CalendarIntegration> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return { ...mockCalendarIntegration, ...request };
    }
    const response = await axios.post(`${API_URL}/api/calendar/calendars/connect`, request);
    return response.data.data;
  },

  getIntegrations: async (): Promise<CalendarIntegration[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [mockCalendarIntegration, { ...mockCalendarIntegration, id: 'cal-002', provider: 'OUTLOOK', name: 'Personal', isPrimary: false }];
    }
    const response = await axios.get(`${API_URL}/api/calendar/calendars`);
    return response.data.data;
  },

  sync: async (id: string): Promise<CalendarIntegration> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 2000));
      return { ...mockCalendarIntegration, syncStatus: 'SYNCED', lastSyncAt: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/api/calendar/calendars/${id}/sync`);
    return response.data.data;
  },

  disconnect: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return;
    }
    await axios.delete(`${API_URL}/api/calendar/calendars/${id}`);
  },

  getEvents: async (startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [mockCalendarEvent];
    }
    const response = await axios.get(`${API_URL}/api/calendar/events`, { params: { startDate, endDate } });
    return response.data.data;
  },

  createEvent: async (request: CreateCalendarEventRequest): Promise<CalendarEvent> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { ...mockCalendarEvent, ...request };
    }
    const response = await axios.post(`${API_URL}/api/calendar/events`, request);
    return response.data.data;
  }
};

// Conflict Detection APIs
export const conflictAPI = {
  detect: async (startDate?: string, endDate?: string): Promise<{ conflicts: CalendarConflict[]; totalConflicts: number }> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return { conflicts: [], totalConflicts: 0 };
    }
    const response = await axios.post(`${API_URL}/api/calendar/conflicts/detect`, {}, { params: { startDate, endDate } });
    return response.data.data;
  },

  getAll: async (status?: string): Promise<CalendarConflict[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [];
    }
    const response = await axios.get(`${API_URL}/api/calendar/conflicts`, { params: { status } });
    return response.data.data;
  },

  resolve: async (id: string, resolution: string): Promise<CalendarConflict> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return {} as CalendarConflict;
    }
    const response = await axios.patch(`${API_URL}/api/calendar/conflicts/${id}/resolve`, { resolution });
    return response.data.data;
  }
};

// Buffer Time APIs
export const bufferTimeAPI = {
  get: async (): Promise<BufferTimeSettings> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return {
        id: 'bt-001', userId: 'user-001', beforeMeeting: 0, afterMeeting: 0,
        beforeInterview: 15, afterInterview: 10, includeTravel: false, defaultTravelTime: 30,
        phoneScreenBuffer: 5, videoInterviewBuffer: 10, onsiteInterviewBuffer: 30, panelInterviewBuffer: 15,
        autoApply: true, applyToExternal: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
    }
    const response = await axios.get(`${API_URL}/api/calendar/buffer-settings`);
    return response.data.data;
  },

  update: async (settings: Partial<BufferTimeSettings>): Promise<BufferTimeSettings> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return settings as BufferTimeSettings;
    }
    const response = await axios.put(`${API_URL}/api/calendar/buffer-settings`, settings);
    return response.data.data;
  }
};

// Working Hours APIs
export const workingHoursAPI = {
  getAll: async (): Promise<WorkingHours[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [mockWorkingHours];
    }
    const response = await axios.get(`${API_URL}/api/calendar/working-hours`);
    return response.data.data;
  },

  create: async (request: CreateWorkingHoursRequest): Promise<WorkingHours> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { ...mockWorkingHours, ...request };
    }
    const response = await axios.post(`${API_URL}/api/calendar/working-hours`, request);
    return response.data.data;
  },

  update: async (id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { ...mockWorkingHours, ...updates };
    }
    const response = await axios.patch(`${API_URL}/api/calendar/working-hours/${id}`, updates);
    return response.data.data;
  }
};

// Holiday APIs
export const holidayAPI = {
  getAll: async (country?: string, year?: number): Promise<Holiday[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [
        { id: 'h1', name: 'New Year', date: '2025-01-01', type: 'PUBLIC', isRecurring: true, isOfficial: true, blockEntireDay: true, scope: 'GLOBAL', createdAt: '', updatedAt: '' },
        { id: 'h2', name: 'Independence Day', date: '2025-07-04', type: 'PUBLIC', isRecurring: true, isOfficial: true, blockEntireDay: true, scope: 'GLOBAL', createdAt: '', updatedAt: '' }
      ];
    }
    const response = await axios.get(`${API_URL}/api/calendar/holidays`, { params: { country, year } });
    return response.data.data;
  },

  add: async (request: AddHolidayRequest): Promise<Holiday> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { id: 'h-new', ...request, isRecurring: false, isOfficial: false, blockEntireDay: true, scope: 'USER', createdAt: '', updatedAt: '' };
    }
    const response = await axios.post(`${API_URL}/api/calendar/holidays`, request);
    return response.data.data;
  },

  importForRegion: async (country: string, year: number): Promise<Holiday[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return [];
    }
    const response = await axios.post(`${API_URL}/api/calendar/holidays/import`, { country, year });
    return response.data.data;
  }
};

// Scheduling Link APIs
export const schedulingLinkAPI = {
  create: async (request: CreateSchedulingLinkRequest): Promise<SchedulingLink> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { ...mockSchedulingLink, ...request };
    }
    const response = await axios.post(`${API_URL}/api/calendar/scheduling-links`, request);
    return response.data.data;
  },

  getAll: async (): Promise<SchedulingLink[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [mockSchedulingLink];
    }
    const response = await axios.get(`${API_URL}/api/calendar/scheduling-links`);
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<SchedulingLink> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return mockSchedulingLink;
    }
    const response = await axios.get(`${API_URL}/api/calendar/scheduling-links/${slug}`);
    return response.data.data;
  },

  getAvailableSlots: async (slug: string, date: string, timezone?: string): Promise<{ date: string; timezone: string; slots: AvailableSlot[] }> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      const slots: AvailableSlot[] = [];
      for (let h = 9; h < 17; h++) {
        slots.push({ startTime: `${date}T${h.toString().padStart(2, '0')}:00:00`, endTime: `${date}T${h.toString().padStart(2, '0')}:30:00`, available: true });
        slots.push({ startTime: `${date}T${h.toString().padStart(2, '0')}:30:00`, endTime: `${date}T${(h + 1).toString().padStart(2, '0')}:00:00`, available: Math.random() > 0.3 });
      }
      return { date, timezone: timezone || 'UTC', slots };
    }
    const response = await axios.get(`${API_URL}/api/calendar/scheduling-links/${slug}/slots`, { params: { date, timezone } });
    return response.data.data;
  },

  book: async (slug: string, request: BookSlotRequest): Promise<SchedulingBooking> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return {
        id: 'bk-001', linkId: 'sl-001', ...request,
        endTime: new Date(new Date(request.startTime).getTime() + 30 * 60000).toISOString(),
        status: 'CONFIRMED', confirmedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
    }
    const response = await axios.post(`${API_URL}/api/calendar/scheduling-links/${slug}/book`, request);
    return response.data.data;
  },

  getBookings: async (status?: string, startDate?: string, endDate?: string): Promise<SchedulingBooking[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [];
    }
    const response = await axios.get(`${API_URL}/api/calendar/bookings`, { params: { status, startDate, endDate } });
    return response.data.data;
  }
};

// Availability APIs
export const availabilityAPI = {
  generate: async (request: GenerateAvailabilityRequest): Promise<{ slots: AvailabilitySlot[]; totalSlots: number; availableSlots: number }> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500));
      return { slots: [], totalSlots: 0, availableSlots: 0 };
    }
    const response = await axios.post(`${API_URL}/api/calendar/availability/generate`, request);
    return response.data.data;
  },

  get: async (startDate?: string, endDate?: string, status?: string): Promise<AvailabilitySlot[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [];
    }
    const response = await axios.get(`${API_URL}/api/calendar/availability`, { params: { startDate, endDate, status } });
    return response.data.data;
  }
};

// Panel Session APIs
export const panelAPI = {
  create: async (request: CreatePanelSessionRequest): Promise<PanelSession> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return { ...mockPanelSession, ...request };
    }
    const response = await axios.post(`${API_URL}/api/calendar/panel-sessions`, request);
    return response.data.data;
  },

  getAll: async (status?: string): Promise<PanelSession[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return [mockPanelSession];
    }
    const response = await axios.get(`${API_URL}/api/calendar/panel-sessions`, { params: { status } });
    return response.data.data;
  },

  submitAvailability: async (sessionId: string, request: SubmitPanelAvailabilityRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return;
    }
    await axios.post(`${API_URL}/api/calendar/panel-sessions/${sessionId}/availability`, request);
  },

  findOptimalTime: async (sessionId: string): Promise<{ sessionId: string; optimalSlots: OptimalPanelTime[]; totalPanelists: number; minRequired: number }> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      return { sessionId, optimalSlots: [], totalPanelists: 4, minRequired: 3 };
    }
    const response = await axios.get(`${API_URL}/api/calendar/panel-sessions/${sessionId}/optimal-time`);
    return response.data.data;
  },

  schedule: async (sessionId: string, startTime: string, endTime: string, meetingLink?: string, location?: string): Promise<PanelSession> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return { ...mockPanelSession, scheduledStartTime: startTime, scheduledEndTime: endTime, meetingLink, location, status: 'SCHEDULED' };
    }
    const response = await axios.post(`${API_URL}/api/calendar/panel-sessions/${sessionId}/schedule`, { startTime, endTime, meetingLink, location });
    return response.data.data;
  }
};

// Timezone APIs
export const timezoneAPI = {
  getPreferences: async (): Promise<TimezonePreference> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return {
        id: 'tz-001', userId: 'user-001', primaryTimezone: 'America/New_York', autoDetect: true,
        use24HourFormat: false, showSecondaryTimezone: false, preferLocalTime: true, includeTimezoneInInvites: true,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
    }
    const response = await axios.get(`${API_URL}/api/calendar/timezone/preferences`);
    return response.data.data;
  },

  updatePreferences: async (prefs: Partial<TimezonePreference>): Promise<TimezonePreference> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return prefs as TimezonePreference;
    }
    const response = await axios.put(`${API_URL}/api/calendar/timezone/preferences`, prefs);
    return response.data.data;
  },

  detect: async (detectedTimezone: string): Promise<TimezonePreference> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return { primaryTimezone: detectedTimezone, lastDetectedTimezone: detectedTimezone } as TimezonePreference;
    }
    const response = await axios.post(`${API_URL}/api/calendar/timezone/detect`, { detectedTimezone });
    return response.data.data;
  },

  convert: async (dateTime: string, fromTimezone: string, toTimezone: string): Promise<TimezoneConversion> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return {
        original: { dateTime, timezone: fromTimezone },
        converted: { dateTime, timezone: toTimezone, formatted: new Date(dateTime).toLocaleString() }
      };
    }
    const response = await axios.post(`${API_URL}/api/calendar/timezone/convert`, { dateTime, fromTimezone, toTimezone });
    return response.data.data;
  }
};
