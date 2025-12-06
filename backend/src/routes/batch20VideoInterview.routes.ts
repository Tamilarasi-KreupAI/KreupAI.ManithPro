import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Video Rooms
  createVideoRoom,
  getVideoRooms,
  getVideoRoomById,
  joinRoomByCode,
  startRoom,
  endRoom,
  approveParticipant,
  removeParticipant,
  // Integrations
  connectIntegration,
  getIntegrations,
  disconnectIntegration,
  createExternalMeeting,
  getExternalMeetings,
  // Recording
  startRecording,
  stopRecording,
  getRecordings,
  // Transcription
  startTranscription,
  addTranscriptionSegment,
  stopTranscription,
  getTranscriptions,
  // Virtual Backgrounds
  getVirtualBackgrounds,
  uploadBackground,
  setDefaultBackground,
  // Whiteboard
  createWhiteboard,
  updateWhiteboard,
  getWhiteboard,
  // Code Editor
  createCodeEditor,
  updateCode,
  executeCode,
  getCodeEditor,
  // Chat
  sendChatMessage,
  getChatMessages,
  // Timer
  createTimer,
  startTimer,
  pauseTimer,
  getTimer,
  // One-Way Interview
  createOneWayInterview,
  getOneWayInterviews,
  getOneWayInterviewById,
  startOneWayInterview,
  submitOneWayResponse,
  submitOneWayInterview,
  reviewOneWayResponse,
  completeOneWayReview,
} from '../controllers/batch20VideoInterview.controller';

const router = Router();

// ============================================
// 4.4.1 - BUILT-IN VIDEO CONFERENCING
// ============================================

router.post('/rooms', authenticate, authorize('recruiter', 'admin'), createVideoRoom);
router.get('/rooms', authenticate, getVideoRooms);
router.get('/rooms/:id', authenticate, getVideoRoomById);
router.post('/rooms/join', authenticate, joinRoomByCode);
router.post('/rooms/:id/start', authenticate, authorize('recruiter', 'admin'), startRoom);
router.post('/rooms/:id/end', authenticate, authorize('recruiter', 'admin'), endRoom);
router.post('/rooms/:id/participants/:participantId/approve', authenticate, authorize('recruiter', 'admin'), approveParticipant);
router.delete('/rooms/:id/participants/:participantId', authenticate, authorize('recruiter', 'admin'), removeParticipant);

// ============================================
// 4.4.2-4.4.4 - PLATFORM INTEGRATIONS
// ============================================

router.post('/integrations', authenticate, connectIntegration);
router.get('/integrations', authenticate, getIntegrations);
router.delete('/integrations/:id', authenticate, disconnectIntegration);
router.post('/external-meetings', authenticate, authorize('recruiter', 'admin'), createExternalMeeting);
router.get('/external-meetings', authenticate, getExternalMeetings);

// ============================================
// 4.4.5 - INTERVIEW RECORDING
// ============================================

router.post('/recordings', authenticate, authorize('recruiter', 'admin'), startRecording);
router.post('/recordings/:id/stop', authenticate, authorize('recruiter', 'admin'), stopRecording);
router.get('/recordings', authenticate, getRecordings);

// ============================================
// 4.4.6 - LIVE TRANSCRIPTION
// ============================================

router.post('/transcriptions', authenticate, authorize('recruiter', 'admin'), startTranscription);
router.post('/transcriptions/:id/segment', authenticate, addTranscriptionSegment);
router.post('/transcriptions/:id/stop', authenticate, authorize('recruiter', 'admin'), stopTranscription);
router.get('/transcriptions', authenticate, getTranscriptions);

// ============================================
// 4.4.7 - VIRTUAL BACKGROUNDS
// ============================================

router.get('/backgrounds', authenticate, getVirtualBackgrounds);
router.post('/backgrounds', authenticate, uploadBackground);
router.patch('/backgrounds/:id/default', authenticate, setDefaultBackground);

// ============================================
// 4.4.9 - COLLABORATIVE WHITEBOARD
// ============================================

router.post('/whiteboards', authenticate, createWhiteboard);
router.patch('/whiteboards/:id', authenticate, updateWhiteboard);
router.get('/whiteboards/:id', authenticate, getWhiteboard);

// ============================================
// 4.4.10 - LIVE CODE EDITOR
// ============================================

router.post('/code-editor', authenticate, authorize('recruiter', 'admin'), createCodeEditor);
router.patch('/code-editor/:id/code', authenticate, updateCode);
router.post('/code-editor/:id/execute', authenticate, executeCode);
router.get('/code-editor/:id', authenticate, getCodeEditor);

// ============================================
// VIDEO CHAT
// ============================================

router.post('/chat', authenticate, sendChatMessage);
router.get('/rooms/:roomId/chat', authenticate, getChatMessages);

// ============================================
// 4.4.11 - INTERVIEW TIMER
// ============================================

router.post('/timers', authenticate, authorize('recruiter', 'admin'), createTimer);
router.post('/timers/:id/start', authenticate, authorize('recruiter', 'admin'), startTimer);
router.post('/timers/:id/pause', authenticate, authorize('recruiter', 'admin'), pauseTimer);
router.get('/timers/:id', authenticate, getTimer);

// ============================================
// 4.4.12 - ONE-WAY VIDEO INTERVIEW
// ============================================

router.post('/one-way', authenticate, authorize('recruiter', 'admin'), createOneWayInterview);
router.get('/one-way', authenticate, getOneWayInterviews);
router.get('/one-way/:id', authenticate, getOneWayInterviewById);
router.post('/one-way/:id/start', authenticate, startOneWayInterview);
router.post('/one-way/:id/responses', authenticate, submitOneWayResponse);
router.post('/one-way/:id/submit', authenticate, submitOneWayInterview);
router.patch('/one-way/:id/responses/:responseId/review', authenticate, authorize('recruiter', 'admin'), reviewOneWayResponse);
router.post('/one-way/:id/complete-review', authenticate, authorize('recruiter', 'admin'), completeOneWayReview);

export default router;
