import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Calendar Integrations (3.1.1-3.1.5)
  connectCalendar,
  getCalendarIntegrations,
  updateCalendarIntegration,
  disconnectCalendar,
  syncCalendar,
  getCalendarEvents,
  createCalendarEvent,
  // Conflict Detection (3.1.6)
  detectConflicts,
  getConflicts,
  resolveConflict,
  // Buffer Time (3.1.7)
  getBufferSettings,
  updateBufferSettings,
  // Working Hours (3.1.8)
  getWorkingHours,
  createWorkingHours,
  updateWorkingHours,
  // Holidays (3.1.9)
  getHolidays,
  addHoliday,
  importHolidaysForRegion,
  // Self-Scheduling (3.2.1)
  createSchedulingLink,
  getSchedulingLinks,
  getSchedulingLinkBySlug,
  getAvailableSlotsForLink,
  bookSlot,
  getBookings,
  // Auto-Availability (3.2.2)
  generateAvailability,
  getAvailability,
  // Panel Coordinator (3.2.3)
  createPanelSession,
  getPanelSessions,
  submitPanelAvailability,
  findOptimalPanelTime,
  schedulePanelSession,
  // Timezone Intelligence (3.2.4)
  getTimezonePreferences,
  updateTimezonePreferences,
  detectTimezone,
  convertTimezone
} from '../controllers/batch15CalendarScheduling.controller';

const router = Router();

// ============================================
// CALENDAR INTEGRATIONS (3.1.1-3.1.5)
// ============================================

router.post('/calendars/connect', authenticate, connectCalendar);
router.get('/calendars', authenticate, getCalendarIntegrations);
router.patch('/calendars/:id', authenticate, updateCalendarIntegration);
router.delete('/calendars/:id', authenticate, disconnectCalendar);
router.post('/calendars/:id/sync', authenticate, syncCalendar);

// Calendar Events
router.get('/events', authenticate, getCalendarEvents);
router.post('/events', authenticate, createCalendarEvent);

// ============================================
// CONFLICT DETECTION (3.1.6)
// ============================================

router.post('/conflicts/detect', authenticate, detectConflicts);
router.get('/conflicts', authenticate, getConflicts);
router.patch('/conflicts/:id/resolve', authenticate, resolveConflict);

// ============================================
// BUFFER TIME SETTINGS (3.1.7)
// ============================================

router.get('/buffer-settings', authenticate, getBufferSettings);
router.put('/buffer-settings', authenticate, updateBufferSettings);

// ============================================
// WORKING HOURS (3.1.8)
// ============================================

router.get('/working-hours', authenticate, getWorkingHours);
router.post('/working-hours', authenticate, createWorkingHours);
router.patch('/working-hours/:id', authenticate, updateWorkingHours);

// ============================================
// HOLIDAYS (3.1.9)
// ============================================

router.get('/holidays', authenticate, getHolidays);
router.post('/holidays', authenticate, addHoliday);
router.post('/holidays/import', authenticate, importHolidaysForRegion);

// ============================================
// SELF-SCHEDULING LINKS (3.2.1)
// ============================================

router.post('/scheduling-links', authenticate, authorize('RECRUITER', 'ADMIN'), createSchedulingLink);
router.get('/scheduling-links', authenticate, getSchedulingLinks);
router.get('/scheduling-links/:slug', getSchedulingLinkBySlug); // Public endpoint
router.get('/scheduling-links/:slug/slots', getAvailableSlotsForLink); // Public endpoint
router.post('/scheduling-links/:slug/book', bookSlot); // Public endpoint
router.get('/bookings', authenticate, getBookings);

// ============================================
// AUTO-AVAILABILITY (3.2.2)
// ============================================

router.post('/availability/generate', authenticate, generateAvailability);
router.get('/availability', authenticate, getAvailability);

// ============================================
// PANEL COORDINATOR (3.2.3)
// ============================================

router.post('/panel-sessions', authenticate, authorize('RECRUITER', 'ADMIN'), createPanelSession);
router.get('/panel-sessions', authenticate, getPanelSessions);
router.post('/panel-sessions/:sessionId/availability', authenticate, submitPanelAvailability);
router.get('/panel-sessions/:sessionId/optimal-time', authenticate, findOptimalPanelTime);
router.post('/panel-sessions/:sessionId/schedule', authenticate, authorize('RECRUITER', 'ADMIN'), schedulePanelSession);

// ============================================
// TIMEZONE INTELLIGENCE (3.2.4)
// ============================================

router.get('/timezone/preferences', authenticate, getTimezonePreferences);
router.put('/timezone/preferences', authenticate, updateTimezonePreferences);
router.post('/timezone/detect', authenticate, detectTimezone);
router.post('/timezone/convert', authenticate, convertTimezone);

export default router;
