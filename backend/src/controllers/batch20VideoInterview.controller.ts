import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate unique room code
const generateRoomCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// ============================================
// 4.4.1 - BUILT-IN VIDEO CONFERENCING
// ============================================

// Create video room
export const createVideoRoom = async (req: Request, res: Response) => {
  try {
    const {
      roomName,
      roomType,
      interviewId,
      jobId,
      applicationId,
      scheduledStartTime,
      scheduledEndTime,
      maxParticipants,
      waitingRoomEnabled,
      recordingEnabled,
      transcriptionEnabled,
      chatEnabled,
      screenShareEnabled,
      whiteboardEnabled,
      codeEditorEnabled,
      password,
      requireApproval,
      allowedDomains,
    } = req.body;

    const userId = (req as any).user?.id;
    const roomCode = generateRoomCode();

    const room = await prisma.videoRoom.create({
      data: {
        roomName,
        roomCode,
        roomType: roomType || 'INTERVIEW',
        interviewId,
        jobId,
        applicationId,
        hostId: userId,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : undefined,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
        maxParticipants: maxParticipants || 10,
        waitingRoomEnabled: waitingRoomEnabled !== false,
        recordingEnabled: recordingEnabled || false,
        transcriptionEnabled: transcriptionEnabled || false,
        chatEnabled: chatEnabled !== false,
        screenShareEnabled: screenShareEnabled !== false,
        whiteboardEnabled: whiteboardEnabled || false,
        codeEditorEnabled: codeEditorEnabled || false,
        password,
        requireApproval: requireApproval !== false,
        allowedDomains: allowedDomains || [],
      },
    });

    res.status(201).json({
      message: 'Video room created',
      room,
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({ error: 'Failed to create video room' });
  }
};

// Get video rooms
export const getVideoRooms = async (req: Request, res: Response) => {
  try {
    const { status, hostId, interviewId } = req.query;
    const userId = (req as any).user?.id;

    const where: any = {};
    if (status) where.status = status;
    if (hostId) where.hostId = hostId;
    if (interviewId) where.interviewId = interviewId;

    // Show rooms user is host or participant
    where.OR = [
      { hostId: userId },
      { coHostIds: { has: userId } },
      { participantIds: { has: userId } },
    ];

    const rooms = await prisma.videoRoom.findMany({
      where,
      include: {
        participants: true,
      },
      orderBy: { scheduledStartTime: 'asc' },
    });

    res.json({ rooms });
  } catch (error) {
    console.error('Error fetching video rooms:', error);
    res.status(500).json({ error: 'Failed to fetch video rooms' });
  }
};

// Get room by ID
export const getVideoRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.videoRoom.findUnique({
      where: { id },
      include: {
        participants: true,
        recordings: true,
        transcriptions: true,
        chatMessages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Error fetching video room:', error);
    res.status(500).json({ error: 'Failed to fetch video room' });
  }
};

// Join room by code
export const joinRoomByCode = async (req: Request, res: Response) => {
  try {
    const { roomCode, password } = req.body;
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email;
    const userName = (req as any).user?.firstName + ' ' + (req as any).user?.lastName;

    const room = await prisma.videoRoom.findUnique({
      where: { roomCode },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.password && room.password !== password) {
      return res.status(403).json({ error: 'Invalid password' });
    }

    if (room.status === 'ENDED' || room.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Room is no longer active' });
    }

    // Add participant
    const participant = await prisma.videoParticipant.create({
      data: {
        roomId: room.id,
        userId,
        userEmail,
        userName,
        role: room.hostId === userId ? 'HOST' : 'PARTICIPANT',
        status: room.requireApproval ? 'WAITING' : 'JOINED',
        joinedAt: room.requireApproval ? undefined : new Date(),
      },
    });

    // Update participant count
    await prisma.videoRoom.update({
      where: { id: room.id },
      data: {
        currentParticipants: { increment: 1 },
        participantIds: { push: userId },
      },
    });

    res.json({
      message: room.requireApproval ? 'Waiting for host approval' : 'Joined room',
      room,
      participant,
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

// Start room
export const startRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.videoRoom.update({
      where: { id },
      data: {
        status: 'LIVE',
        actualStartTime: new Date(),
      },
    });

    res.json({ message: 'Room started', room });
  } catch (error) {
    console.error('Error starting room:', error);
    res.status(500).json({ error: 'Failed to start room' });
  }
};

// End room
export const endRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.videoRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const duration = room.actualStartTime
      ? Math.round((Date.now() - room.actualStartTime.getTime()) / 60000)
      : null;

    const updated = await prisma.videoRoom.update({
      where: { id },
      data: {
        status: 'ENDED',
        actualEndTime: new Date(),
        duration,
      },
    });

    // Update all participants to left
    await prisma.videoParticipant.updateMany({
      where: { roomId: id, status: 'JOINED' },
      data: { status: 'LEFT', leftAt: new Date() },
    });

    res.json({ message: 'Room ended', room: updated });
  } catch (error) {
    console.error('Error ending room:', error);
    res.status(500).json({ error: 'Failed to end room' });
  }
};

// Approve participant
export const approveParticipant = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;

    const participant = await prisma.videoParticipant.update({
      where: { id: participantId },
      data: {
        status: 'JOINED',
        joinedAt: new Date(),
      },
    });

    res.json({ message: 'Participant approved', participant });
  } catch (error) {
    console.error('Error approving participant:', error);
    res.status(500).json({ error: 'Failed to approve participant' });
  }
};

// Remove participant
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;

    await prisma.videoParticipant.update({
      where: { id: participantId },
      data: { status: 'REMOVED', leftAt: new Date() },
    });

    await prisma.videoRoom.update({
      where: { id },
      data: { currentParticipants: { decrement: 1 } },
    });

    res.json({ message: 'Participant removed' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
};

// ============================================
// 4.4.2-4.4.4 - PLATFORM INTEGRATIONS
// ============================================

// Connect video integration
export const connectIntegration = async (req: Request, res: Response) => {
  try {
    const {
      platform,
      accessToken,
      refreshToken,
      tokenExpiry,
      scope,
      accountEmail,
      accountId,
      accountName,
      isDefault,
      defaultSettings,
    } = req.body;

    const userId = (req as any).user?.id;

    // Check if integration already exists
    const existing = await prisma.videoIntegration.findUnique({
      where: { userId_platform: { userId, platform } },
    });

    if (existing) {
      const updated = await prisma.videoIntegration.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken,
          tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
          scope: scope || [],
          accountEmail,
          accountId,
          accountName,
          isDefault: isDefault || false,
          defaultSettings,
          isConnected: true,
          lastSyncAt: new Date(),
          errorMessage: null,
        },
      });
      return res.json({ message: 'Integration updated', integration: updated });
    }

    const integration = await prisma.videoIntegration.create({
      data: {
        userId,
        platform,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        scope: scope || [],
        accountEmail,
        accountId,
        accountName,
        isDefault: isDefault || false,
        defaultSettings,
      },
    });

    res.status(201).json({
      message: 'Integration connected',
      integration,
    });
  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
};

// Get integrations
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const integrations = await prisma.videoIntegration.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        accountEmail: true,
        accountName: true,
        isDefault: true,
        isConnected: true,
        lastSyncAt: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    res.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

// Disconnect integration
export const disconnectIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.videoIntegration.delete({
      where: { id },
    });

    res.json({ message: 'Integration disconnected' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
};

// Create external meeting
export const createExternalMeeting = async (req: Request, res: Response) => {
  try {
    const {
      integrationId,
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      timezone,
      attendeeEmails,
      interviewId,
      jobId,
      waitingRoom,
      recordingEnabled,
      muteOnEntry,
    } = req.body;

    const integration = await prisma.videoIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // In production, this would call the actual platform API
    // For now, simulate creating a meeting
    const externalMeetingId = `${integration.platform}-${Date.now()}`;
    const meetingUrl = `https://${integration.platform.toLowerCase()}.example.com/j/${externalMeetingId}`;

    const meeting = await prisma.externalMeeting.create({
      data: {
        integrationId,
        platform: integration.platform,
        externalMeetingId,
        meetingUrl,
        joinUrl: meetingUrl,
        hostUrl: `${meetingUrl}?host=true`,
        title,
        description,
        scheduledStartTime: new Date(scheduledStartTime),
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
        timezone,
        hostEmail: integration.accountEmail || '',
        attendeeEmails: attendeeEmails || [],
        interviewId,
        jobId,
        waitingRoom: waitingRoom !== false,
        recordingEnabled: recordingEnabled || false,
        muteOnEntry: muteOnEntry !== false,
      },
    });

    res.status(201).json({
      message: 'External meeting created',
      meeting,
    });
  } catch (error) {
    console.error('Error creating external meeting:', error);
    res.status(500).json({ error: 'Failed to create external meeting' });
  }
};

// Get external meetings
export const getExternalMeetings = async (req: Request, res: Response) => {
  try {
    const { platform, interviewId, status } = req.query;
    const userId = (req as any).user?.id;

    const integrations = await prisma.videoIntegration.findMany({
      where: { userId },
      select: { id: true },
    });

    const integrationIds = integrations.map(i => i.id);

    const where: any = { integrationId: { in: integrationIds } };
    if (platform) where.platform = platform;
    if (interviewId) where.interviewId = interviewId;
    if (status) where.status = status;

    const meetings = await prisma.externalMeeting.findMany({
      where,
      orderBy: { scheduledStartTime: 'asc' },
    });

    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching external meetings:', error);
    res.status(500).json({ error: 'Failed to fetch external meetings' });
  }
};

// ============================================
// 4.4.5 - INTERVIEW RECORDING
// ============================================

// Start recording
export const startRecording = async (req: Request, res: Response) => {
  try {
    const { roomId, recordingType } = req.body;

    const recording = await prisma.videoRecording.create({
      data: {
        roomId,
        recordingType: recordingType || 'FULL',
        processingStatus: 'PENDING',
        startedAt: new Date(),
        consentObtained: true,
        consentTimestamp: new Date(),
      },
    });

    res.status(201).json({
      message: 'Recording started',
      recording,
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
};

// Stop recording
export const stopRecording = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recording = await prisma.videoRecording.findUnique({
      where: { id },
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    const duration = recording.startedAt
      ? Math.round((Date.now() - recording.startedAt.getTime()) / 1000)
      : null;

    const updated = await prisma.videoRecording.update({
      where: { id },
      data: {
        endedAt: new Date(),
        duration,
        processingStatus: 'PROCESSING',
      },
    });

    res.json({ message: 'Recording stopped', recording: updated });
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({ error: 'Failed to stop recording' });
  }
};

// Get recordings
export const getRecordings = async (req: Request, res: Response) => {
  try {
    const { roomId, processingStatus } = req.query;

    const where: any = {};
    if (roomId) where.roomId = roomId;
    if (processingStatus) where.processingStatus = processingStatus;

    const recordings = await prisma.videoRecording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
};

// ============================================
// 4.4.6 - LIVE TRANSCRIPTION
// ============================================

// Start transcription
export const startTranscription = async (req: Request, res: Response) => {
  try {
    const { roomId, language } = req.body;

    const transcription = await prisma.liveTranscription.create({
      data: {
        roomId,
        language: language || 'en-US',
        isLive: true,
        segments: [],
        startedAt: new Date(),
      },
    });

    res.status(201).json({
      message: 'Transcription started',
      transcription,
    });
  } catch (error) {
    console.error('Error starting transcription:', error);
    res.status(500).json({ error: 'Failed to start transcription' });
  }
};

// Add transcription segment
export const addTranscriptionSegment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { speaker, text, startTime, endTime, confidence } = req.body;

    const transcription = await prisma.liveTranscription.findUnique({
      where: { id },
    });

    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }

    const segments = transcription.segments as any[];
    segments.push({ speaker, text, startTime, endTime, confidence });

    const wordCount = segments.reduce((acc, seg) => acc + (seg.text?.split(' ').length || 0), 0);
    const avgConfidence = segments.reduce((acc, seg) => acc + (seg.confidence || 0), 0) / segments.length;

    const updated = await prisma.liveTranscription.update({
      where: { id },
      data: {
        segments,
        wordCount,
        averageConfidence: avgConfidence,
        fullText: segments.map(s => s.text).join(' '),
      },
    });

    res.json({ message: 'Segment added', transcription: updated });
  } catch (error) {
    console.error('Error adding segment:', error);
    res.status(500).json({ error: 'Failed to add segment' });
  }
};

// Stop transcription
export const stopTranscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transcription = await prisma.liveTranscription.findUnique({
      where: { id },
    });

    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }

    const duration = transcription.startedAt
      ? Math.round((Date.now() - transcription.startedAt.getTime()) / 1000)
      : null;

    const updated = await prisma.liveTranscription.update({
      where: { id },
      data: {
        isLive: false,
        status: 'COMPLETED',
        endedAt: new Date(),
        duration,
      },
    });

    res.json({ message: 'Transcription stopped', transcription: updated });
  } catch (error) {
    console.error('Error stopping transcription:', error);
    res.status(500).json({ error: 'Failed to stop transcription' });
  }
};

// Get transcriptions
export const getTranscriptions = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.query;

    const where: any = {};
    if (roomId) where.roomId = roomId;

    const transcriptions = await prisma.liveTranscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ transcriptions });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({ error: 'Failed to fetch transcriptions' });
  }
};

// ============================================
// 4.4.7 - VIRTUAL BACKGROUNDS
// ============================================

// Get virtual backgrounds
export const getVirtualBackgrounds = async (req: Request, res: Response) => {
  try {
    const { category, type } = req.query;
    const userId = (req as any).user?.id;

    const where: any = {
      isActive: true,
      OR: [{ isSystem: true }, { userId }],
    };
    if (category) where.category = category;
    if (type) where.type = type;

    const backgrounds = await prisma.virtualBackground.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }],
    });

    res.json({ backgrounds });
  } catch (error) {
    console.error('Error fetching backgrounds:', error);
    res.status(500).json({ error: 'Failed to fetch backgrounds' });
  }
};

// Upload custom background
export const uploadBackground = async (req: Request, res: Response) => {
  try {
    const { name, type, category, imageUrl, thumbnailUrl, color, blurIntensity } = req.body;
    const userId = (req as any).user?.id;

    const background = await prisma.virtualBackground.create({
      data: {
        userId,
        name,
        type,
        category: category || 'CUSTOM',
        imageUrl,
        thumbnailUrl,
        color,
        blurIntensity,
        isSystem: false,
      },
    });

    res.status(201).json({
      message: 'Background uploaded',
      background,
    });
  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({ error: 'Failed to upload background' });
  }
};

// Set default background
export const setDefaultBackground = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Clear existing default
    await prisma.virtualBackground.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const background = await prisma.virtualBackground.update({
      where: { id },
      data: { isDefault: true, usageCount: { increment: 1 } },
    });

    res.json({ message: 'Default background set', background });
  } catch (error) {
    console.error('Error setting default:', error);
    res.status(500).json({ error: 'Failed to set default background' });
  }
};

// ============================================
// 4.4.9 - COLLABORATIVE WHITEBOARD
// ============================================

// Create whiteboard session
export const createWhiteboard = async (req: Request, res: Response) => {
  try {
    const { roomId, name, description, canvasWidth, canvasHeight, backgroundColor, availableTools } = req.body;
    const userId = (req as any).user?.id;

    const whiteboard = await prisma.whiteboardSession.create({
      data: {
        roomId,
        name,
        description,
        canvasWidth: canvasWidth || 1920,
        canvasHeight: canvasHeight || 1080,
        backgroundColor: backgroundColor || '#FFFFFF',
        elements: [],
        availableTools: availableTools || ['PEN', 'MARKER', 'ERASER', 'SHAPES', 'TEXT'],
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Whiteboard created',
      whiteboard,
    });
  } catch (error) {
    console.error('Error creating whiteboard:', error);
    res.status(500).json({ error: 'Failed to create whiteboard' });
  }
};

// Update whiteboard elements
export const updateWhiteboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { elements } = req.body;

    const whiteboard = await prisma.whiteboardSession.update({
      where: { id },
      data: {
        elements,
        currentVersion: { increment: 1 },
      },
    });

    res.json({ message: 'Whiteboard updated', whiteboard });
  } catch (error) {
    console.error('Error updating whiteboard:', error);
    res.status(500).json({ error: 'Failed to update whiteboard' });
  }
};

// Get whiteboard
export const getWhiteboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const whiteboard = await prisma.whiteboardSession.findUnique({
      where: { id },
    });

    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    res.json({ whiteboard });
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    res.status(500).json({ error: 'Failed to fetch whiteboard' });
  }
};

// ============================================
// 4.4.10 - LIVE CODE EDITOR
// ============================================

// Create code editor session
export const createCodeEditor = async (req: Request, res: Response) => {
  try {
    const {
      roomId,
      title,
      description,
      problemStatement,
      language,
      initialCode,
      solutionCode,
      theme,
      fontSize,
      tabSize,
      testCases,
      timeLimit,
    } = req.body;
    const userId = (req as any).user?.id;

    const session = await prisma.codeEditorSession.create({
      data: {
        roomId,
        title,
        description,
        problemStatement,
        language: language || 'javascript',
        initialCode,
        currentCode: initialCode,
        solutionCode,
        theme: theme || 'vs-dark',
        fontSize: fontSize || 14,
        tabSize: tabSize || 2,
        testCases,
        timeLimit,
        createdById: userId,
      },
    });

    res.status(201).json({
      message: 'Code editor session created',
      session,
    });
  } catch (error) {
    console.error('Error creating code editor:', error);
    res.status(500).json({ error: 'Failed to create code editor session' });
  }
};

// Update code
export const updateCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const session = await prisma.codeEditorSession.update({
      where: { id },
      data: {
        currentCode: code,
        currentVersion: { increment: 1 },
      },
    });

    res.json({ message: 'Code updated', session });
  } catch (error) {
    console.error('Error updating code:', error);
    res.status(500).json({ error: 'Failed to update code' });
  }
};

// Execute code (simulated)
export const executeCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.codeEditorSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Simulate code execution
    const result = {
      output: 'Code executed successfully',
      errors: null,
      executionTime: Math.random() * 100,
    };

    await prisma.codeEditorSession.update({
      where: { id },
      data: { lastExecutionResult: result },
    });

    res.json({ message: 'Code executed', result });
  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
};

// Get code editor session
export const getCodeEditor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.codeEditorSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching code editor:', error);
    res.status(500).json({ error: 'Failed to fetch code editor session' });
  }
};

// ============================================
// VIDEO CHAT
// ============================================

// Send chat message
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, content, messageType, fileUrl, fileName, fileType, fileSize, isPrivate, recipientId } = req.body;
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.firstName + ' ' + (req as any).user?.lastName;

    const message = await prisma.videoChatMessage.create({
      data: {
        roomId,
        senderId: userId,
        senderName: userName,
        content,
        messageType: messageType || 'TEXT',
        fileUrl,
        fileName,
        fileType,
        fileSize,
        isPrivate: isPrivate || false,
        recipientId,
      },
    });

    res.status(201).json({ message: 'Message sent', chatMessage: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get chat messages
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;

    const messages = await prisma.videoChatMessage.findMany({
      where: {
        roomId,
        isDeleted: false,
        OR: [
          { isPrivate: false },
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// ============================================
// 4.4.11 - INTERVIEW TIMER
// ============================================

// Create timer
export const createTimer = async (req: Request, res: Response) => {
  try {
    const { roomId, timerType, name, totalDuration, sections, alertTimes, visibleToAll, visibleToRoles } = req.body;
    const userId = (req as any).user?.id;

    const timer = await prisma.interviewTimer.create({
      data: {
        roomId,
        timerType: timerType || 'COUNTDOWN',
        name,
        totalDuration,
        remainingTime: totalDuration,
        sections,
        alertTimes: alertTimes || [],
        visibleToAll: visibleToAll !== false,
        visibleToRoles: visibleToRoles || [],
        createdById: userId,
      },
    });

    res.status(201).json({ message: 'Timer created', timer });
  } catch (error) {
    console.error('Error creating timer:', error);
    res.status(500).json({ error: 'Failed to create timer' });
  }
};

// Start timer
export const startTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const timer = await prisma.interviewTimer.update({
      where: { id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    res.json({ message: 'Timer started', timer });
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
};

// Pause timer
export const pauseTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { remainingTime } = req.body;

    const timer = await prisma.interviewTimer.update({
      where: { id },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
        remainingTime,
      },
    });

    res.json({ message: 'Timer paused', timer });
  } catch (error) {
    console.error('Error pausing timer:', error);
    res.status(500).json({ error: 'Failed to pause timer' });
  }
};

// Get timer
export const getTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const timer = await prisma.interviewTimer.findUnique({
      where: { id },
    });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    res.json({ timer });
  } catch (error) {
    console.error('Error fetching timer:', error);
    res.status(500).json({ error: 'Failed to fetch timer' });
  }
};

// ============================================
// 4.4.12 - ONE-WAY VIDEO INTERVIEW
// ============================================

// Create one-way interview
export const createOneWayInterview = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      applicationId,
      candidateId,
      title,
      description,
      instructions,
      questions,
      totalTimeLimit,
      allowRetakes,
      maxRetakesPerQuestion,
      showQuestionPreview,
      randomizeQuestions,
      deadline,
    } = req.body;

    const userId = (req as any).user?.id;

    const interview = await prisma.oneWayInterview.create({
      data: {
        jobId,
        applicationId,
        candidateId,
        recruiterId: userId,
        title,
        description,
        instructions,
        questions: questions || [],
        questionCount: questions?.length || 0,
        totalTimeLimit,
        allowRetakes: allowRetakes !== false,
        maxRetakesPerQuestion: maxRetakesPerQuestion || 2,
        showQuestionPreview: showQuestionPreview !== false,
        randomizeQuestions: randomizeQuestions || false,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    res.status(201).json({
      message: 'One-way interview created',
      interview,
    });
  } catch (error) {
    console.error('Error creating one-way interview:', error);
    res.status(500).json({ error: 'Failed to create one-way interview' });
  }
};

// Get one-way interviews
export const getOneWayInterviews = async (req: Request, res: Response) => {
  try {
    const { status, candidateId, recruiterId } = req.query;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const where: any = {};
    if (status) where.status = status;

    // Candidates see their own, recruiters see ones they created
    if (userRole === 'CANDIDATE') {
      where.candidateId = userId;
    } else if (candidateId) {
      where.candidateId = candidateId;
    } else if (recruiterId) {
      where.recruiterId = recruiterId;
    } else {
      where.recruiterId = userId;
    }

    const interviews = await prisma.oneWayInterview.findMany({
      where,
      include: {
        responses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching one-way interviews:', error);
    res.status(500).json({ error: 'Failed to fetch one-way interviews' });
  }
};

// Get one-way interview by ID
export const getOneWayInterviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.oneWayInterview.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { questionIndex: 'asc' },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ interview });
  } catch (error) {
    console.error('Error fetching one-way interview:', error);
    res.status(500).json({ error: 'Failed to fetch one-way interview' });
  }
};

// Start one-way interview
export const startOneWayInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.oneWayInterview.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    res.json({ message: 'Interview started', interview });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

// Submit one-way response
export const submitOneWayResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      questionId,
      questionIndex,
      videoUrl,
      videoPath,
      videoDuration,
      thumbnailUrl,
      attemptNumber,
      thinkTimeUsed,
      answerTimeUsed,
    } = req.body;

    const response = await prisma.oneWayResponse.create({
      data: {
        interviewId: id,
        questionId,
        questionIndex,
        videoUrl,
        videoPath,
        videoDuration,
        thumbnailUrl,
        attemptNumber: attemptNumber || 1,
        thinkTimeUsed,
        answerTimeUsed,
        startedAt: new Date(),
        completedAt: new Date(),
        status: 'COMPLETED',
      },
    });

    res.status(201).json({ message: 'Response submitted', response });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

// Submit one-way interview (complete)
export const submitOneWayInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.oneWayInterview.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.json({ message: 'Interview submitted', interview });
  } catch (error) {
    console.error('Error submitting interview:', error);
    res.status(500).json({ error: 'Failed to submit interview' });
  }
};

// Review one-way response
export const reviewOneWayResponse = async (req: Request, res: Response) => {
  try {
    const { id, responseId } = req.params;
    const { rating, reviewerNotes, flagged, flagReason } = req.body;

    const response = await prisma.oneWayResponse.update({
      where: { id: responseId },
      data: {
        rating,
        reviewerNotes,
        flagged: flagged || false,
        flagReason,
      },
    });

    res.json({ message: 'Response reviewed', response });
  } catch (error) {
    console.error('Error reviewing response:', error);
    res.status(500).json({ error: 'Failed to review response' });
  }
};

// Complete review of one-way interview
export const completeOneWayReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.oneWayInterview.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        reviewedAt: new Date(),
      },
    });

    res.json({ message: 'Review completed', interview });
  } catch (error) {
    console.error('Error completing review:', error);
    res.status(500).json({ error: 'Failed to complete review' });
  }
};
