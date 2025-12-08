import axios from 'axios';
import type {
  VideoRoom,
  VideoParticipant,
  VideoIntegration,
  ExternalMeeting,
  VideoRecording,
  LiveTranscription,
  VirtualBackground,
  WhiteboardSession,
  CodeEditorSession,
  VideoChatMessage,
  InterviewTimer,
  OneWayInterview,
  OneWayResponse,
  CreateVideoRoomInput,
  AddParticipantInput,
  CreateVideoIntegrationInput,
  CreateRecordingInput,
  CreateTranscriptionInput,
  CreateVirtualBackgroundInput,
  CreateWhiteboardInput,
  CreateCodeEditorInput,
  ExecuteCodeInput,
  SendChatMessageInput,
  CreateTimerInput,
  CreateOneWayInterviewInput,
  InviteCandidateInput,
  ReviewOneWayResponseInput,
  VideoInterviewStats,
  ExecutionResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockVideoRooms: VideoRoom[] = [
  {
    id: 'vr-1',
    companyId: 'company-1',
    interviewId: 'interview-1',
    applicationId: 'app-1',
    roomType: 'LIVE_INTERVIEW',
    roomName: 'Senior Developer Interview - John Smith',
    roomCode: 'ROOM-ABC123',
    description: 'Technical interview for senior developer position',
    provider: 'NATIVE',
    hostUserId: 'user-1',
    scheduledStartAt: new Date(Date.now() + 86400000).toISOString(),
    scheduledEndAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    durationMinutes: 60,
    maxParticipants: 5,
    currentParticipantCount: 0,
    status: 'SCHEDULED',
    waitingRoomEnabled: true,
    recordingEnabled: true,
    transcriptionEnabled: true,
    screenShareEnabled: true,
    chatEnabled: true,
    whiteboardEnabled: true,
    codeEditorEnabled: true,
    breakoutRoomsEnabled: false,
    virtualBackgroundAllowed: true,
    defaultVideoQuality: 'HD',
    autoAdmitParticipants: false,
    muteOnEntry: true,
    disableVideoOnEntry: false,
    joinUrl: 'https://video.kreupai.com/room/ABC123',
    hostJoinUrl: 'https://video.kreupai.com/room/ABC123?host=true',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [],
  },
  {
    id: 'vr-2',
    companyId: 'company-1',
    roomType: 'TECHNICAL',
    roomName: 'Coding Assessment - Jane Doe',
    roomCode: 'ROOM-DEF456',
    provider: 'ZOOM',
    externalRoomId: 'zoom-123456',
    externalRoomUrl: 'https://zoom.us/j/123456789',
    hostUserId: 'user-2',
    scheduledStartAt: new Date(Date.now() + 172800000).toISOString(),
    durationMinutes: 90,
    maxParticipants: 3,
    currentParticipantCount: 0,
    status: 'SCHEDULED',
    waitingRoomEnabled: true,
    recordingEnabled: true,
    transcriptionEnabled: false,
    screenShareEnabled: true,
    chatEnabled: true,
    whiteboardEnabled: false,
    codeEditorEnabled: true,
    breakoutRoomsEnabled: false,
    virtualBackgroundAllowed: true,
    defaultVideoQuality: 'HD',
    autoAdmitParticipants: false,
    muteOnEntry: false,
    disableVideoOnEntry: false,
    joinUrl: 'https://zoom.us/j/123456789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockVideoIntegrations: VideoIntegration[] = [
  {
    id: 'vi-1',
    companyId: 'company-1',
    userId: 'user-1',
    provider: 'ZOOM',
    providerAccountId: 'zoom-account-1',
    providerEmail: 'admin@company.com',
    status: 'CONNECTED',
    lastSyncAt: new Date().toISOString(),
    features: {
      supportsRecording: true,
      supportsTranscription: true,
      supportsBreakoutRooms: true,
      supportsPolls: true,
      supportsChat: true,
      supportsScreenShare: true,
      supportsVirtualBackground: true,
      supportsWhiteboard: true,
      maxParticipants: 100,
      maxDurationMinutes: 180,
    },
    settings: {
      defaultMeetingDuration: 60,
      autoRecording: false,
      waitingRoomDefault: true,
      muteOnEntryDefault: true,
      allowJoinBeforeHost: false,
      requirePassword: false,
      timezone: 'America/New_York',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vi-2',
    companyId: 'company-1',
    userId: 'user-1',
    provider: 'TEAMS',
    providerEmail: 'admin@company.onmicrosoft.com',
    status: 'CONNECTED',
    features: {
      supportsRecording: true,
      supportsTranscription: true,
      supportsBreakoutRooms: true,
      supportsPolls: true,
      supportsChat: true,
      supportsScreenShare: true,
      supportsVirtualBackground: true,
      supportsWhiteboard: true,
      maxParticipants: 300,
      maxDurationMinutes: 240,
    },
    settings: {
      defaultMeetingDuration: 60,
      autoRecording: false,
      waitingRoomDefault: true,
      muteOnEntryDefault: false,
      allowJoinBeforeHost: true,
      requirePassword: false,
      timezone: 'America/New_York',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRecordings: VideoRecording[] = [
  {
    id: 'rec-1',
    roomId: 'vr-completed-1',
    recordingType: 'FULL',
    status: 'READY',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    endedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    durationSeconds: 3540,
    fileUrl: 'https://storage.kreupai.com/recordings/rec-1.mp4',
    thumbnailUrl: 'https://storage.kreupai.com/recordings/rec-1-thumb.jpg',
    fileSizeBytes: 524288000,
    format: 'mp4',
    resolution: '1920x1080',
    codec: 'H.264',
    bitrate: 4000000,
    storageLocation: 'S3',
    storagePath: 'recordings/2024/rec-1.mp4',
    downloadable: true,
    downloadCount: 3,
    viewCount: 12,
    accessControl: {
      publicAccess: false,
      allowedUserIds: ['user-1', 'user-2'],
      allowedRoles: ['recruiter', 'admin'],
      requiresPassword: false,
    },
    retentionDays: 90,
    isDeleted: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTranscriptions: LiveTranscription[] = [
  {
    id: 'trans-1',
    roomId: 'vr-completed-1',
    recordingId: 'rec-1',
    transcriptionProvider: 'NATIVE',
    language: 'en-US',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86300000).toISOString(),
    durationSeconds: 3540,
    fullTranscript: 'Interview transcript content...',
    segments: [
      {
        id: 'seg-1',
        speakerId: 'speaker-1',
        speakerName: 'Interviewer',
        startTimeMs: 0,
        endTimeMs: 5000,
        text: 'Thank you for joining us today. Could you tell us about your experience?',
        confidence: 0.95,
        sentiment: 'neutral',
      },
      {
        id: 'seg-2',
        speakerId: 'speaker-2',
        speakerName: 'Candidate',
        startTimeMs: 5500,
        endTimeMs: 25000,
        text: 'Thank you for having me. I have over 5 years of experience in software development...',
        confidence: 0.92,
        sentiment: 'positive',
      },
    ],
    wordCount: 4520,
    confidenceScore: 0.93,
    speakerDiarization: true,
    speakers: [
      {
        id: 'speaker-1',
        name: 'Interviewer',
        role: 'INTERVIEWER',
        totalSpeakingTimeSeconds: 1200,
        wordCount: 1500,
        averagePace: 130,
      },
      {
        id: 'speaker-2',
        name: 'Candidate',
        role: 'CANDIDATE',
        totalSpeakingTimeSeconds: 2340,
        wordCount: 3020,
        averagePace: 145,
      },
    ],
    keyMoments: [
      {
        timestamp: 180000,
        type: 'KEY_POINT',
        text: 'Discussed experience with microservices architecture',
        importance: 'HIGH',
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockBackgrounds: VirtualBackground[] = [
  {
    id: 'bg-1',
    companyId: 'company-1',
    backgroundName: 'Company Office',
    backgroundType: 'IMAGE',
    imageUrl: 'https://storage.kreupai.com/backgrounds/office.jpg',
    thumbnailUrl: 'https://storage.kreupai.com/backgrounds/office-thumb.jpg',
    isDefault: true,
    isCompanyBranded: true,
    brandColor: '#2563eb',
    category: 'professional',
    tags: ['office', 'branded', 'professional'],
    usageCount: 150,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bg-2',
    companyId: 'company-1',
    backgroundName: 'Light Blur',
    backgroundType: 'BLUR',
    blurIntensity: 8,
    isDefault: false,
    isCompanyBranded: false,
    category: 'blur',
    tags: ['blur', 'minimal'],
    usageCount: 89,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockOneWayInterviews: OneWayInterview[] = [
  {
    id: 'owi-1',
    companyId: 'company-1',
    jobId: 'job-1',
    title: 'Software Engineer Pre-Screen',
    description: 'Pre-screening interview for software engineer candidates',
    instructions: 'Please answer each question within the time limit. You may retake up to 2 times.',
    welcomeMessage: 'Welcome! This interview will help us learn more about you.',
    completionMessage: 'Thank you for completing the interview!',
    questions: [
      {
        id: 'q-1',
        order: 1,
        questionText: 'Tell us about yourself and your experience in software development.',
        questionType: 'VIDEO',
        thinkTimeSeconds: 30,
        maxResponseSeconds: 120,
        retakesAllowed: 2,
        isRequired: true,
        aiEvaluationEnabled: true,
        evaluationCriteria: ['communication', 'experience', 'relevance'],
        weight: 25,
      },
      {
        id: 'q-2',
        order: 2,
        questionText: 'Describe a challenging technical problem you solved recently.',
        questionType: 'VIDEO',
        thinkTimeSeconds: 45,
        maxResponseSeconds: 180,
        retakesAllowed: 2,
        isRequired: true,
        aiEvaluationEnabled: true,
        evaluationCriteria: ['problem-solving', 'technical-depth', 'clarity'],
        weight: 30,
      },
      {
        id: 'q-3',
        order: 3,
        questionText: 'Why are you interested in this position?',
        questionType: 'VIDEO',
        thinkTimeSeconds: 30,
        maxResponseSeconds: 90,
        retakesAllowed: 2,
        isRequired: true,
        aiEvaluationEnabled: true,
        evaluationCriteria: ['motivation', 'company-knowledge', 'fit'],
        weight: 20,
      },
      {
        id: 'q-4',
        order: 4,
        questionText: 'What is your expected salary range?',
        questionType: 'TEXT',
        thinkTimeSeconds: 0,
        maxResponseSeconds: 0,
        retakesAllowed: 0,
        isRequired: true,
        aiEvaluationEnabled: false,
        weight: 0,
      },
    ],
    settings: {
      allowRetakes: true,
      showQuestionUpfront: false,
      randomizeQuestions: false,
      requireCamera: true,
      requireMicrophone: true,
      allowPause: false,
      allowSkip: false,
      deadlineEnforced: true,
      autoSubmit: true,
      notifyOnComplete: true,
      sendReminderEmails: true,
      reminderDays: [1, 3],
    },
    branding: {
      primaryColor: '#2563eb',
      backgroundColor: '#f8fafc',
    },
    status: 'PUBLISHED',
    expiresAt: new Date(Date.now() + 2592000000).toISOString(),
    maxAttempts: 1,
    totalInvited: 45,
    totalStarted: 38,
    totalCompleted: 32,
    averageScore: 78.5,
    createdById: 'user-1',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockOneWayResponses: OneWayResponse[] = [
  {
    id: 'owr-1',
    interviewId: 'owi-1',
    candidateId: 'candidate-1',
    applicationId: 'app-1',
    inviteToken: 'token-abc123',
    status: 'REVIEWED',
    attemptNumber: 1,
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    submittedAt: new Date(Date.now() - 172000000).toISOString(),
    totalDurationSeconds: 480,
    questionResponses: [
      {
        questionId: 'q-1',
        questionOrder: 1,
        responseType: 'VIDEO',
        videoUrl: 'https://storage.kreupai.com/responses/owr-1-q1.mp4',
        thumbnailUrl: 'https://storage.kreupai.com/responses/owr-1-q1-thumb.jpg',
        durationSeconds: 95,
        retakeNumber: 0,
        startedAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172700000).toISOString(),
        transcription: 'My name is John and I have 5 years of experience...',
        aiAnalysis: {
          contentScore: 85,
          deliveryScore: 78,
          clarityScore: 82,
          relevanceScore: 90,
          confidenceScore: 75,
          overallScore: 82,
          keyPoints: ['5 years experience', 'Full-stack development', 'Team lead role'],
          strengths: ['Clear communication', 'Relevant experience'],
          improvements: ['Could provide more specific examples'],
          sentiment: 'positive',
          speechPace: 140,
          fillerWordCount: 3,
        },
        manualScore: 85,
      },
    ],
    deviceInfo: {
      browser: 'Chrome',
      browserVersion: '120.0',
      os: 'macOS',
      osVersion: '14.0',
      deviceType: 'desktop',
      camera: 'FaceTime HD Camera',
      microphone: 'MacBook Pro Microphone',
    },
    overallScore: 82,
    aiScore: 82,
    reviewerScore: 85,
    reviewerId: 'user-1',
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    feedback: 'Strong candidate with relevant experience. Good communication skills.',
    rating: 4,
    recommendation: 'ADVANCE',
    viewCount: 5,
    lastViewedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStats: VideoInterviewStats = {
  rooms: {
    total: 156,
    scheduled: 12,
    active: 2,
    completed: 142,
    averageDuration: 52,
  },
  recordings: {
    total: 128,
    totalStorageBytes: 68719476736,
    averageDuration: 3240,
  },
  oneWayInterviews: {
    total: 8,
    active: 3,
    totalResponses: 245,
    completionRate: 0.78,
    averageScore: 76.5,
  },
  integrations: {
    total: 3,
    byProvider: {
      ZOOM: 1,
      TEAMS: 1,
      GOOGLE_MEET: 1,
    },
  },
};

// ============================================
// VIDEO ROOMS API
// ============================================

export const videoRoomsAPI = {
  create: async (data: CreateVideoRoomInput): Promise<VideoRoom> => {
    if (USE_MOCK) {
      const newRoom: VideoRoom = {
        id: `vr-${Date.now()}`,
        companyId: 'company-1',
        ...data,
        roomCode: `ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        provider: data.provider || 'NATIVE',
        hostUserId: 'user-1',
        maxParticipants: data.maxParticipants || 10,
        currentParticipantCount: 0,
        status: 'SCHEDULED',
        waitingRoomEnabled: data.waitingRoomEnabled ?? true,
        recordingEnabled: data.recordingEnabled ?? true,
        transcriptionEnabled: data.transcriptionEnabled ?? false,
        screenShareEnabled: data.screenShareEnabled ?? true,
        chatEnabled: data.chatEnabled ?? true,
        whiteboardEnabled: data.whiteboardEnabled ?? false,
        codeEditorEnabled: data.codeEditorEnabled ?? false,
        breakoutRoomsEnabled: false,
        virtualBackgroundAllowed: data.virtualBackgroundAllowed ?? true,
        defaultVideoQuality: data.defaultVideoQuality || 'HD',
        autoAdmitParticipants: data.autoAdmitParticipants ?? false,
        muteOnEntry: data.muteOnEntry ?? true,
        disableVideoOnEntry: false,
        joinUrl: `https://video.kreupai.com/room/${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockVideoRooms.push(newRoom);
      return newRoom;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms`, data);
    return response.data;
  },

  getAll: async (params?: { status?: string; type?: string }): Promise<VideoRoom[]> => {
    if (USE_MOCK) {
      let rooms = [...mockVideoRooms];
      if (params?.status) {
        rooms = rooms.filter(r => r.status === params.status);
      }
      if (params?.type) {
        rooms = rooms.filter(r => r.roomType === params.type);
      }
      return rooms;
    }
    const response = await axios.get(`${API_BASE_URL}/video/rooms`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<VideoRoom> => {
    if (USE_MOCK) {
      const room = mockVideoRooms.find(r => r.id === id);
      if (!room) throw new Error('Video room not found');
      return room;
    }
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVideoRoomInput>): Promise<VideoRoom> => {
    if (USE_MOCK) {
      const index = mockVideoRooms.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Video room not found');
      mockVideoRooms[index] = { ...mockVideoRooms[index], ...data, updatedAt: new Date().toISOString() };
      return mockVideoRooms[index];
    }
    const response = await axios.patch(`${API_BASE_URL}/video/rooms/${id}`, data);
    return response.data;
  },

  startRoom: async (id: string): Promise<VideoRoom> => {
    if (USE_MOCK) {
      const room = mockVideoRooms.find(r => r.id === id);
      if (!room) throw new Error('Video room not found');
      room.status = 'ACTIVE';
      room.actualStartAt = new Date().toISOString();
      room.updatedAt = new Date().toISOString();
      return room;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${id}/start`);
    return response.data;
  },

  endRoom: async (id: string): Promise<VideoRoom> => {
    if (USE_MOCK) {
      const room = mockVideoRooms.find(r => r.id === id);
      if (!room) throw new Error('Video room not found');
      room.status = 'ENDED';
      room.actualEndAt = new Date().toISOString();
      room.updatedAt = new Date().toISOString();
      return room;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${id}/end`);
    return response.data;
  },

  addParticipant: async (roomId: string, data: AddParticipantInput): Promise<VideoParticipant> => {
    if (USE_MOCK) {
      const participant: VideoParticipant = {
        id: `vp-${Date.now()}`,
        roomId,
        ...data,
        status: 'INVITED',
        videoEnabled: true,
        audioEnabled: true,
        screenSharing: false,
        handRaised: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return participant;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/participants`, data);
    return response.data;
  },

  removeParticipant: async (roomId: string, participantId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/video/rooms/${roomId}/participants/${participantId}`);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockVideoRooms.findIndex(r => r.id === id);
      if (index !== -1) mockVideoRooms.splice(index, 1);
      return;
    }
    await axios.delete(`${API_BASE_URL}/video/rooms/${id}`);
  },
};

// ============================================
// VIDEO INTEGRATIONS API
// ============================================

export const videoIntegrationsAPI = {
  create: async (data: CreateVideoIntegrationInput): Promise<VideoIntegration> => {
    if (USE_MOCK) {
      const integration: VideoIntegration = {
        id: `vi-${Date.now()}`,
        companyId: 'company-1',
        userId: 'user-1',
        ...data,
        status: 'PENDING',
        features: {
          supportsRecording: true,
          supportsTranscription: true,
          supportsBreakoutRooms: data.provider === 'ZOOM' || data.provider === 'TEAMS',
          supportsPolls: data.provider === 'ZOOM',
          supportsChat: true,
          supportsScreenShare: true,
          supportsVirtualBackground: true,
          supportsWhiteboard: data.provider === 'TEAMS',
          maxParticipants: 100,
          maxDurationMinutes: 180,
        },
        settings: data.settings || {
          defaultMeetingDuration: 60,
          autoRecording: false,
          waitingRoomDefault: true,
          muteOnEntryDefault: true,
          allowJoinBeforeHost: false,
          requirePassword: false,
          timezone: 'America/New_York',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockVideoIntegrations.push(integration);
      return integration;
    }
    const response = await axios.post(`${API_BASE_URL}/video/integrations`, data);
    return response.data;
  },

  getAll: async (): Promise<VideoIntegration[]> => {
    if (USE_MOCK) return mockVideoIntegrations;
    const response = await axios.get(`${API_BASE_URL}/video/integrations`);
    return response.data;
  },

  getById: async (id: string): Promise<VideoIntegration> => {
    if (USE_MOCK) {
      const integration = mockVideoIntegrations.find(i => i.id === id);
      if (!integration) throw new Error('Integration not found');
      return integration;
    }
    const response = await axios.get(`${API_BASE_URL}/video/integrations/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVideoIntegrationInput>): Promise<VideoIntegration> => {
    if (USE_MOCK) {
      const index = mockVideoIntegrations.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Integration not found');
      mockVideoIntegrations[index] = { ...mockVideoIntegrations[index], ...data, updatedAt: new Date().toISOString() };
      return mockVideoIntegrations[index];
    }
    const response = await axios.patch(`${API_BASE_URL}/video/integrations/${id}`, data);
    return response.data;
  },

  sync: async (id: string): Promise<VideoIntegration> => {
    if (USE_MOCK) {
      const integration = mockVideoIntegrations.find(i => i.id === id);
      if (!integration) throw new Error('Integration not found');
      integration.lastSyncAt = new Date().toISOString();
      return integration;
    }
    const response = await axios.post(`${API_BASE_URL}/video/integrations/${id}/sync`);
    return response.data;
  },

  disconnect: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const integration = mockVideoIntegrations.find(i => i.id === id);
      if (integration) integration.status = 'REVOKED';
      return;
    }
    await axios.post(`${API_BASE_URL}/video/integrations/${id}/disconnect`);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockVideoIntegrations.findIndex(i => i.id === id);
      if (index !== -1) mockVideoIntegrations.splice(index, 1);
      return;
    }
    await axios.delete(`${API_BASE_URL}/video/integrations/${id}`);
  },

  createExternalMeeting: async (integrationId: string, data: Partial<ExternalMeeting>): Promise<ExternalMeeting> => {
    if (USE_MOCK) {
      const meeting: ExternalMeeting = {
        id: `em-${Date.now()}`,
        integrationId,
        externalMeetingId: `ext-${Date.now()}`,
        topic: data.topic || 'Interview Meeting',
        startUrl: `https://zoom.us/s/${Date.now()}`,
        joinUrl: `https://zoom.us/j/${Date.now()}`,
        scheduledStartAt: data.scheduledStartAt || new Date().toISOString(),
        durationMinutes: data.durationMinutes || 60,
        hostId: 'user-1',
        settings: {
          hostVideo: true,
          participantVideo: true,
          joinBeforeHost: false,
          muteUponEntry: true,
          watermark: false,
          autoRecording: 'none',
          waitingRoom: true,
          breakoutRooms: false,
        },
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return meeting;
    }
    const response = await axios.post(`${API_BASE_URL}/video/integrations/${integrationId}/meetings`, data);
    return response.data;
  },
};

// ============================================
// RECORDINGS API
// ============================================

export const recordingsAPI = {
  start: async (roomId: string, data?: CreateRecordingInput): Promise<VideoRecording> => {
    if (USE_MOCK) {
      const recording: VideoRecording = {
        id: `rec-${Date.now()}`,
        roomId,
        recordingType: data?.recordingType || 'FULL',
        status: 'RECORDING',
        startedAt: new Date().toISOString(),
        format: data?.format || 'mp4',
        storageLocation: 'S3',
        downloadable: true,
        downloadCount: 0,
        viewCount: 0,
        accessControl: data?.accessControl as any || {
          publicAccess: false,
          allowedUserIds: [],
          allowedRoles: ['recruiter', 'admin'],
          requiresPassword: false,
        },
        retentionDays: data?.retentionDays || 90,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRecordings.push(recording);
      return recording;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/recordings/start`, data);
    return response.data;
  },

  stop: async (roomId: string, recordingId: string): Promise<VideoRecording> => {
    if (USE_MOCK) {
      const recording = mockRecordings.find(r => r.id === recordingId);
      if (!recording) throw new Error('Recording not found');
      recording.status = 'PROCESSING';
      recording.endedAt = new Date().toISOString();
      return recording;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/recordings/${recordingId}/stop`);
    return response.data;
  },

  getByRoom: async (roomId: string): Promise<VideoRecording[]> => {
    if (USE_MOCK) {
      return mockRecordings.filter(r => r.roomId === roomId);
    }
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/recordings`);
    return response.data;
  },

  getById: async (id: string): Promise<VideoRecording> => {
    if (USE_MOCK) {
      const recording = mockRecordings.find(r => r.id === id);
      if (!recording) throw new Error('Recording not found');
      return recording;
    }
    const response = await axios.get(`${API_BASE_URL}/video/recordings/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const recording = mockRecordings.find(r => r.id === id);
      if (recording) {
        recording.isDeleted = true;
        recording.deletedAt = new Date().toISOString();
      }
      return;
    }
    await axios.delete(`${API_BASE_URL}/video/recordings/${id}`);
  },
};

// ============================================
// TRANSCRIPTIONS API
// ============================================

export const transcriptionsAPI = {
  start: async (roomId: string, data?: CreateTranscriptionInput): Promise<LiveTranscription> => {
    if (USE_MOCK) {
      const transcription: LiveTranscription = {
        id: `trans-${Date.now()}`,
        roomId,
        recordingId: data?.recordingId,
        transcriptionProvider: data?.transcriptionProvider || 'NATIVE',
        language: data?.language || 'en-US',
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        segments: [],
        speakerDiarization: data?.speakerDiarization ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTranscriptions.push(transcription);
      return transcription;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/transcriptions/start`, data);
    return response.data;
  },

  stop: async (roomId: string, transcriptionId: string): Promise<LiveTranscription> => {
    if (USE_MOCK) {
      const transcription = mockTranscriptions.find(t => t.id === transcriptionId);
      if (!transcription) throw new Error('Transcription not found');
      transcription.status = 'COMPLETED';
      transcription.completedAt = new Date().toISOString();
      return transcription;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/transcriptions/${transcriptionId}/stop`);
    return response.data;
  },

  getByRoom: async (roomId: string): Promise<LiveTranscription[]> => {
    if (USE_MOCK) {
      return mockTranscriptions.filter(t => t.roomId === roomId);
    }
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/transcriptions`);
    return response.data;
  },

  getById: async (id: string): Promise<LiveTranscription> => {
    if (USE_MOCK) {
      const transcription = mockTranscriptions.find(t => t.id === id);
      if (!transcription) throw new Error('Transcription not found');
      return transcription;
    }
    const response = await axios.get(`${API_BASE_URL}/video/transcriptions/${id}`);
    return response.data;
  },

  export: async (id: string, format: 'vtt' | 'srt' | 'txt' | 'json'): Promise<string> => {
    if (USE_MOCK) {
      return `https://storage.kreupai.com/transcriptions/${id}.${format}`;
    }
    const response = await axios.get(`${API_BASE_URL}/video/transcriptions/${id}/export`, { params: { format } });
    return response.data.url;
  },
};

// ============================================
// VIRTUAL BACKGROUNDS API
// ============================================

export const virtualBackgroundsAPI = {
  create: async (data: CreateVirtualBackgroundInput): Promise<VirtualBackground> => {
    if (USE_MOCK) {
      const background: VirtualBackground = {
        id: `bg-${Date.now()}`,
        companyId: 'company-1',
        ...data,
        thumbnailUrl: data.imageUrl,
        isDefault: false,
        usageCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockBackgrounds.push(background);
      return background;
    }
    const response = await axios.post(`${API_BASE_URL}/video/backgrounds`, data);
    return response.data;
  },

  getAll: async (): Promise<VirtualBackground[]> => {
    if (USE_MOCK) return mockBackgrounds;
    const response = await axios.get(`${API_BASE_URL}/video/backgrounds`);
    return response.data;
  },

  getById: async (id: string): Promise<VirtualBackground> => {
    if (USE_MOCK) {
      const bg = mockBackgrounds.find(b => b.id === id);
      if (!bg) throw new Error('Background not found');
      return bg;
    }
    const response = await axios.get(`${API_BASE_URL}/video/backgrounds/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVirtualBackgroundInput>): Promise<VirtualBackground> => {
    if (USE_MOCK) {
      const index = mockBackgrounds.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Background not found');
      mockBackgrounds[index] = { ...mockBackgrounds[index], ...data, updatedAt: new Date().toISOString() };
      return mockBackgrounds[index];
    }
    const response = await axios.patch(`${API_BASE_URL}/video/backgrounds/${id}`, data);
    return response.data;
  },

  setDefault: async (id: string): Promise<VirtualBackground> => {
    if (USE_MOCK) {
      mockBackgrounds.forEach(b => b.isDefault = false);
      const bg = mockBackgrounds.find(b => b.id === id);
      if (bg) bg.isDefault = true;
      return bg!;
    }
    const response = await axios.post(`${API_BASE_URL}/video/backgrounds/${id}/set-default`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockBackgrounds.findIndex(b => b.id === id);
      if (index !== -1) mockBackgrounds.splice(index, 1);
      return;
    }
    await axios.delete(`${API_BASE_URL}/video/backgrounds/${id}`);
  },
};

// ============================================
// WHITEBOARD API
// ============================================

export const whiteboardAPI = {
  create: async (roomId: string, data?: CreateWhiteboardInput): Promise<WhiteboardSession> => {
    if (USE_MOCK) {
      const session: WhiteboardSession = {
        id: `wb-${Date.now()}`,
        roomId,
        sessionName: data?.sessionName || 'Whiteboard Session',
        status: 'IDLE',
        createdById: 'user-1',
        canvasWidth: data?.canvasWidth || 1920,
        canvasHeight: data?.canvasHeight || 1080,
        backgroundColor: data?.backgroundColor || '#ffffff',
        collaborators: [],
        allowAllEdit: data?.allowAllEdit ?? true,
        showCursors: data?.showCursors ?? true,
        showNames: data?.showNames ?? true,
        gridEnabled: data?.gridEnabled ?? false,
        snapToGrid: data?.snapToGrid ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return session;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/whiteboard`, data);
    return response.data;
  },

  getByRoom: async (roomId: string): Promise<WhiteboardSession | null> => {
    if (USE_MOCK) return null;
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/whiteboard`);
    return response.data;
  },

  start: async (roomId: string, sessionId: string): Promise<WhiteboardSession> => {
    if (USE_MOCK) {
      return { id: sessionId, status: 'ACTIVE' } as WhiteboardSession;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/whiteboard/${sessionId}/start`);
    return response.data;
  },

  end: async (roomId: string, sessionId: string): Promise<WhiteboardSession> => {
    if (USE_MOCK) {
      return { id: sessionId, status: 'ENDED' } as WhiteboardSession;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/whiteboard/${sessionId}/end`);
    return response.data;
  },

  export: async (roomId: string, sessionId: string, format: 'png' | 'pdf' | 'svg'): Promise<string> => {
    if (USE_MOCK) {
      return `https://storage.kreupai.com/whiteboards/${sessionId}.${format}`;
    }
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/whiteboard/${sessionId}/export`, { params: { format } });
    return response.data.url;
  },
};

// ============================================
// CODE EDITOR API
// ============================================

export const codeEditorAPI = {
  create: async (roomId: string, data: CreateCodeEditorInput): Promise<CodeEditorSession> => {
    if (USE_MOCK) {
      const session: CodeEditorSession = {
        id: `ce-${Date.now()}`,
        roomId,
        sessionName: data.sessionName || 'Code Editor Session',
        problemTitle: data.problemTitle,
        problemDescription: data.problemDescription,
        programmingLanguage: data.programmingLanguage,
        supportedLanguages: data.supportedLanguages || [data.programmingLanguage],
        status: 'IDLE',
        createdById: 'user-1',
        starterCode: data.starterCode,
        currentCode: data.starterCode || '',
        codeHistory: [],
        testCases: data.testCases,
        hiddenTestCases: data.hiddenTestCases,
        executionHistory: [],
        collaborators: [],
        allowLanguageChange: data.allowLanguageChange ?? true,
        allowExecution: data.allowExecution ?? true,
        allowAIAssist: data.allowAIAssist ?? false,
        showLineNumbers: true,
        syntaxHighlighting: true,
        autoComplete: true,
        theme: data.theme || 'vs-dark',
        fontSize: data.fontSize || 14,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return session;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/code-editor`, data);
    return response.data;
  },

  getByRoom: async (roomId: string): Promise<CodeEditorSession | null> => {
    if (USE_MOCK) return null;
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/code-editor`);
    return response.data;
  },

  start: async (roomId: string, sessionId: string): Promise<CodeEditorSession> => {
    if (USE_MOCK) {
      return { id: sessionId, status: 'ACTIVE' } as CodeEditorSession;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/code-editor/${sessionId}/start`);
    return response.data;
  },

  executeCode: async (roomId: string, sessionId: string, data: ExecuteCodeInput): Promise<ExecutionResult> => {
    if (USE_MOCK) {
      const result: ExecutionResult = {
        executionId: `exec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        language: data.language,
        code: data.code,
        status: 'SUCCESS',
        output: 'Hello, World!',
        executionTimeMs: 45,
        memoryUsageBytes: 1024000,
      };
      return result;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/code-editor/${sessionId}/execute`, data);
    return response.data;
  },

  end: async (roomId: string, sessionId: string): Promise<CodeEditorSession> => {
    if (USE_MOCK) {
      return { id: sessionId, status: 'COMPLETED' } as CodeEditorSession;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/code-editor/${sessionId}/end`);
    return response.data;
  },
};

// ============================================
// CHAT API
// ============================================

export const videoChatAPI = {
  sendMessage: async (roomId: string, data: SendChatMessageInput): Promise<VideoChatMessage> => {
    if (USE_MOCK) {
      const message: VideoChatMessage = {
        id: `msg-${Date.now()}`,
        roomId,
        participantId: 'participant-1',
        userId: 'user-1',
        displayName: 'Current User',
        messageType: data.messageType || 'TEXT',
        content: data.content,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileMimeType: data.fileMimeType,
        replyToId: data.replyToId,
        isEdited: false,
        isDeleted: false,
        isPrivate: data.isPrivate ?? false,
        recipientIds: data.recipientIds,
        isPinned: false,
        readBy: ['user-1'],
        sentAt: new Date().toISOString(),
      };
      return message;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/chat`, data);
    return response.data;
  },

  getMessages: async (roomId: string): Promise<VideoChatMessage[]> => {
    if (USE_MOCK) return [];
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/chat`);
    return response.data;
  },

  pinMessage: async (roomId: string, messageId: string): Promise<VideoChatMessage> => {
    if (USE_MOCK) {
      return { id: messageId, isPinned: true } as VideoChatMessage;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/chat/${messageId}/pin`);
    return response.data;
  },

  deleteMessage: async (roomId: string, messageId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/video/rooms/${roomId}/chat/${messageId}`);
  },
};

// ============================================
// TIMER API
// ============================================

export const timerAPI = {
  create: async (roomId: string, data: CreateTimerInput): Promise<InterviewTimer> => {
    if (USE_MOCK) {
      const timer: InterviewTimer = {
        id: `timer-${Date.now()}`,
        roomId,
        timerName: data.timerName || 'Interview Timer',
        timerType: data.timerType,
        status: 'IDLE',
        totalDurationSeconds: data.totalDurationSeconds,
        elapsedSeconds: 0,
        remainingSeconds: data.totalDurationSeconds,
        warningAtSeconds: data.warningAtSeconds,
        sections: data.sections?.map((s, i) => ({
          ...s,
          id: `section-${i}`,
          isCompleted: false,
        })),
        isVisible: data.isVisible ?? true,
        soundEnabled: data.soundEnabled ?? true,
        autoAdvance: data.autoAdvance ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return timer;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/timer`, data);
    return response.data;
  },

  getByRoom: async (roomId: string): Promise<InterviewTimer | null> => {
    if (USE_MOCK) return null;
    const response = await axios.get(`${API_BASE_URL}/video/rooms/${roomId}/timer`);
    return response.data;
  },

  start: async (roomId: string, timerId: string): Promise<InterviewTimer> => {
    if (USE_MOCK) {
      return { id: timerId, status: 'RUNNING', startedAt: new Date().toISOString() } as InterviewTimer;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/timer/${timerId}/start`);
    return response.data;
  },

  pause: async (roomId: string, timerId: string): Promise<InterviewTimer> => {
    if (USE_MOCK) {
      return { id: timerId, status: 'PAUSED', pausedAt: new Date().toISOString() } as InterviewTimer;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/timer/${timerId}/pause`);
    return response.data;
  },

  reset: async (roomId: string, timerId: string): Promise<InterviewTimer> => {
    if (USE_MOCK) {
      return { id: timerId, status: 'IDLE', elapsedSeconds: 0 } as InterviewTimer;
    }
    const response = await axios.post(`${API_BASE_URL}/video/rooms/${roomId}/timer/${timerId}/reset`);
    return response.data;
  },
};

// ============================================
// ONE-WAY INTERVIEWS API
// ============================================

export const oneWayInterviewsAPI = {
  create: async (data: CreateOneWayInterviewInput): Promise<OneWayInterview> => {
    if (USE_MOCK) {
      const interview: OneWayInterview = {
        id: `owi-${Date.now()}`,
        companyId: 'company-1',
        ...data,
        questions: data.questions.map((q, i) => ({ ...q, id: `q-${i}` })),
        settings: {
          allowRetakes: true,
          showQuestionUpfront: false,
          randomizeQuestions: false,
          requireCamera: true,
          requireMicrophone: true,
          allowPause: false,
          allowSkip: false,
          deadlineEnforced: true,
          autoSubmit: true,
          notifyOnComplete: true,
          sendReminderEmails: true,
          ...data.settings,
        },
        status: 'DRAFT',
        maxAttempts: data.maxAttempts || 1,
        totalInvited: 0,
        totalStarted: 0,
        totalCompleted: 0,
        createdById: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockOneWayInterviews.push(interview);
      return interview;
    }
    const response = await axios.post(`${API_BASE_URL}/video/one-way`, data);
    return response.data;
  },

  getAll: async (params?: { status?: string; jobId?: string }): Promise<OneWayInterview[]> => {
    if (USE_MOCK) {
      let interviews = [...mockOneWayInterviews];
      if (params?.status) {
        interviews = interviews.filter(i => i.status === params.status);
      }
      if (params?.jobId) {
        interviews = interviews.filter(i => i.jobId === params.jobId);
      }
      return interviews;
    }
    const response = await axios.get(`${API_BASE_URL}/video/one-way`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<OneWayInterview> => {
    if (USE_MOCK) {
      const interview = mockOneWayInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      return interview;
    }
    const response = await axios.get(`${API_BASE_URL}/video/one-way/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateOneWayInterviewInput>): Promise<OneWayInterview> => {
    if (USE_MOCK) {
      const index = mockOneWayInterviews.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interview not found');
      mockOneWayInterviews[index] = { ...mockOneWayInterviews[index], ...data, updatedAt: new Date().toISOString() };
      return mockOneWayInterviews[index];
    }
    const response = await axios.patch(`${API_BASE_URL}/video/one-way/${id}`, data);
    return response.data;
  },

  publish: async (id: string): Promise<OneWayInterview> => {
    if (USE_MOCK) {
      const interview = mockOneWayInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      interview.status = 'PUBLISHED';
      return interview;
    }
    const response = await axios.post(`${API_BASE_URL}/video/one-way/${id}/publish`);
    return response.data;
  },

  archive: async (id: string): Promise<OneWayInterview> => {
    if (USE_MOCK) {
      const interview = mockOneWayInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      interview.status = 'ARCHIVED';
      return interview;
    }
    const response = await axios.post(`${API_BASE_URL}/video/one-way/${id}/archive`);
    return response.data;
  },

  inviteCandidate: async (id: string, data: InviteCandidateInput): Promise<OneWayResponse> => {
    if (USE_MOCK) {
      const response: OneWayResponse = {
        id: `owr-${Date.now()}`,
        interviewId: id,
        candidateId: data.candidateId,
        applicationId: data.applicationId,
        inviteToken: `token-${Date.now()}`,
        status: 'PENDING',
        attemptNumber: 1,
        questionResponses: [],
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockOneWayResponses.push(response);
      return response;
    }
    const axiosResponse = await axios.post(`${API_BASE_URL}/video/one-way/${id}/invite`, data);
    return axiosResponse.data;
  },

  getResponses: async (id: string): Promise<OneWayResponse[]> => {
    if (USE_MOCK) {
      return mockOneWayResponses.filter(r => r.interviewId === id);
    }
    const response = await axios.get(`${API_BASE_URL}/video/one-way/${id}/responses`);
    return response.data;
  },

  getResponseById: async (interviewId: string, responseId: string): Promise<OneWayResponse> => {
    if (USE_MOCK) {
      const response = mockOneWayResponses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      return response;
    }
    const axiosResponse = await axios.get(`${API_BASE_URL}/video/one-way/${interviewId}/responses/${responseId}`);
    return axiosResponse.data;
  },

  reviewResponse: async (interviewId: string, responseId: string, data: ReviewOneWayResponseInput): Promise<OneWayResponse> => {
    if (USE_MOCK) {
      const response = mockOneWayResponses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      response.status = 'REVIEWED';
      response.reviewerId = 'user-1';
      response.reviewedAt = new Date().toISOString();
      response.reviewerScore = data.reviewerScore;
      response.feedback = data.feedback;
      response.rating = data.rating;
      response.recommendation = data.recommendation;
      return response;
    }
    const axiosResponse = await axios.post(`${API_BASE_URL}/video/one-way/${interviewId}/responses/${responseId}/review`, data);
    return axiosResponse.data;
  },

  shareResponse: async (interviewId: string, responseId: string, userIds: string[]): Promise<OneWayResponse> => {
    if (USE_MOCK) {
      const response = mockOneWayResponses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      response.sharedWith = userIds;
      response.shareToken = `share-${Date.now()}`;
      return response;
    }
    const axiosResponse = await axios.post(`${API_BASE_URL}/video/one-way/${interviewId}/responses/${responseId}/share`, { userIds });
    return axiosResponse.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockOneWayInterviews.findIndex(i => i.id === id);
      if (index !== -1) mockOneWayInterviews.splice(index, 1);
      return;
    }
    await axios.delete(`${API_BASE_URL}/video/one-way/${id}`);
  },
};

// ============================================
// STATS API
// ============================================

export const videoStatsAPI = {
  getStats: async (): Promise<VideoInterviewStats> => {
    if (USE_MOCK) return mockStats;
    const response = await axios.get(`${API_BASE_URL}/video/stats`);
    return response.data;
  },
};

export default {
  rooms: videoRoomsAPI,
  integrations: videoIntegrationsAPI,
  recordings: recordingsAPI,
  transcriptions: transcriptionsAPI,
  backgrounds: virtualBackgroundsAPI,
  whiteboard: whiteboardAPI,
  codeEditor: codeEditorAPI,
  chat: videoChatAPI,
  timer: timerAPI,
  oneWay: oneWayInterviewsAPI,
  stats: videoStatsAPI,
};
