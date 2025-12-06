import React, { useState, useEffect } from 'react';
import {
  videoRoomsAPI,
  videoIntegrationsAPI,
  recordingsAPI,
  transcriptionsAPI,
  virtualBackgroundsAPI,
  oneWayInterviewsAPI,
  videoStatsAPI,
} from '../../services/batch20VideoInterviewAPI';
import type {
  VideoRoom,
  VideoIntegration,
  VideoRecording,
  LiveTranscription,
  VirtualBackground,
  OneWayInterview,
  OneWayResponse,
  VideoInterviewStats,
  CreateVideoRoomInput,
  CreateOneWayInterviewInput,
} from '../../types';

type TabType =
  | 'overview'
  | 'rooms'
  | 'integrations'
  | 'recordings'
  | 'transcriptions'
  | 'backgrounds'
  | 'one-way'
  | 'responses';

const VideoInterviewHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<VideoInterviewStats | null>(null);
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [integrations, setIntegrations] = useState<VideoIntegration[]>([]);
  const [recordings, setRecordings] = useState<VideoRecording[]>([]);
  const [transcriptions, setTranscriptions] = useState<LiveTranscription[]>([]);
  const [backgrounds, setBackgrounds] = useState<VirtualBackground[]>([]);
  const [oneWayInterviews, setOneWayInterviews] = useState<OneWayInterview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<OneWayInterview | null>(null);
  const [responses, setResponses] = useState<OneWayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showOneWayForm, setShowOneWayForm] = useState(false);
  const [roomForm, setRoomForm] = useState<CreateVideoRoomInput>({
    roomType: 'LIVE_INTERVIEW',
    roomName: '',
    scheduledStartAt: '',
    durationMinutes: 60,
  });
  const [oneWayForm, setOneWayForm] = useState<CreateOneWayInterviewInput>({
    title: '',
    questions: [],
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'overview':
          const statsData = await videoStatsAPI.getStats();
          setStats(statsData);
          break;
        case 'rooms':
          const roomsData = await videoRoomsAPI.getAll();
          setRooms(roomsData);
          break;
        case 'integrations':
          const integrationsData = await videoIntegrationsAPI.getAll();
          setIntegrations(integrationsData);
          break;
        case 'recordings':
          // Load all recordings (in real app, would have a dedicated endpoint)
          setRecordings([]);
          break;
        case 'transcriptions':
          setTranscriptions([]);
          break;
        case 'backgrounds':
          const backgroundsData = await virtualBackgroundsAPI.getAll();
          setBackgrounds(backgroundsData);
          break;
        case 'one-way':
          const oneWayData = await oneWayInterviewsAPI.getAll();
          setOneWayInterviews(oneWayData);
          break;
        case 'responses':
          if (selectedInterview) {
            const responsesData = await oneWayInterviewsAPI.getResponses(selectedInterview.id);
            setResponses(responsesData);
          }
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      await videoRoomsAPI.create(roomForm);
      setShowRoomForm(false);
      setRoomForm({
        roomType: 'LIVE_INTERVIEW',
        roomName: '',
        scheduledStartAt: '',
        durationMinutes: 60,
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoom = async (roomId: string) => {
    try {
      await videoRoomsAPI.startRoom(roomId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start room');
    }
  };

  const handleEndRoom = async (roomId: string) => {
    try {
      await videoRoomsAPI.endRoom(roomId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await videoRoomsAPI.delete(roomId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      await videoIntegrationsAPI.sync(integrationId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync integration');
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    try {
      await videoIntegrationsAPI.disconnect(integrationId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect integration');
    }
  };

  const handleSetDefaultBackground = async (backgroundId: string) => {
    try {
      await virtualBackgroundsAPI.setDefault(backgroundId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default background');
    }
  };

  const handleCreateOneWay = async () => {
    try {
      setLoading(true);
      await oneWayInterviewsAPI.create(oneWayForm);
      setShowOneWayForm(false);
      setOneWayForm({ title: '', questions: [] });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishOneWay = async (interviewId: string) => {
    try {
      await oneWayInterviewsAPI.publish(interviewId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish interview');
    }
  };

  const handleArchiveOneWay = async (interviewId: string) => {
    try {
      await oneWayInterviewsAPI.archive(interviewId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive interview');
    }
  };

  const handleViewResponses = (interview: OneWayInterview) => {
    setSelectedInterview(interview);
    setActiveTab('responses');
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'rooms', label: 'Video Rooms', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'integrations', label: 'Integrations', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'recordings', label: 'Recordings', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
    { id: 'transcriptions', label: 'Transcriptions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'backgrounds', label: 'Backgrounds', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'one-way', label: 'One-Way Interviews', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'responses', label: 'Responses', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rooms.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600 dark:text-green-400">{stats.rooms.active} active</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-yellow-600 dark:text-yellow-400">{stats.rooms.scheduled} scheduled</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recordings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recordings.total}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {(stats.recordings.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB storage used
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">One-Way Interviews</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.oneWayInterviews.total}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600 dark:text-green-400">{stats.oneWayInterviews.active} active</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-blue-600 dark:text-blue-400">{(stats.oneWayInterviews.completionRate * 100).toFixed(0)}% completion</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Integrations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.integrations.total}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {Object.entries(stats.integrations.byProvider).map(([provider, count]) => `${provider}: ${count}`).join(', ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completed Rooms</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.rooms.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Average Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.rooms.averageDuration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg Recording Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.recordings.averageDuration / 60)} min</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">One-Way Interview Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Responses</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.oneWayInterviews.totalResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(stats.oneWayInterviews.completionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.oneWayInterviews.averageScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Rooms</h3>
        <button
          onClick={() => setShowRoomForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Room
        </button>
      </div>

      {showRoomForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Create Video Room</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Name</label>
              <input
                type="text"
                value={roomForm.roomName}
                onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
              <select
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="LIVE_INTERVIEW">Live Interview</option>
                <option value="PANEL">Panel Interview</option>
                <option value="GROUP">Group Interview</option>
                <option value="TECHNICAL">Technical Interview</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Start</label>
              <input
                type="datetime-local"
                value={roomForm.scheduledStartAt}
                onChange={(e) => setRoomForm({ ...roomForm, scheduledStartAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={roomForm.durationMinutes}
                onChange={(e) => setRoomForm({ ...roomForm, durationMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowRoomForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{room.roomName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Code: {room.roomCode}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                room.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                room.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                room.status === 'ENDED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {room.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Type: {room.roomType.replace('_', ' ')}</p>
              <p>Provider: {room.provider}</p>
              <p>Scheduled: {new Date(room.scheduledStartAt).toLocaleString()}</p>
              <p>Duration: {room.durationMinutes} min</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {room.recordingEnabled && <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">Recording</span>}
              {room.transcriptionEnabled && <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Transcription</span>}
              {room.chatEnabled && <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">Chat</span>}
              {room.whiteboardEnabled && <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">Whiteboard</span>}
              {room.codeEditorEnabled && <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">Code Editor</span>}
            </div>
            <div className="flex gap-2 mt-4">
              {room.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleStartRoom(room.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Start
                </button>
              )}
              {room.status === 'ACTIVE' && (
                <>
                  <a
                    href={room.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Join
                  </a>
                  <button
                    onClick={() => handleEndRoom(room.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    End
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteRoom(room.id)}
                className="px-3 py-1 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No video rooms found. Create one to get started.
        </div>
      )}
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Integrations</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  integration.provider === 'ZOOM' ? 'bg-blue-100 dark:bg-blue-900' :
                  integration.provider === 'TEAMS' ? 'bg-purple-100 dark:bg-purple-900' :
                  integration.provider === 'GOOGLE_MEET' ? 'bg-green-100 dark:bg-green-900' :
                  'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <span className={`text-lg font-bold ${
                    integration.provider === 'ZOOM' ? 'text-blue-600 dark:text-blue-400' :
                    integration.provider === 'TEAMS' ? 'text-purple-600 dark:text-purple-400' :
                    integration.provider === 'GOOGLE_MEET' ? 'text-green-600 dark:text-green-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {integration.provider.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.provider.replace('_', ' ')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{integration.providerEmail}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                integration.status === 'CONNECTED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                integration.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {integration.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Max Participants: {integration.features.maxParticipants}</p>
              <p>Max Duration: {integration.features.maxDurationMinutes} min</p>
              {integration.lastSyncAt && <p>Last Synced: {new Date(integration.lastSyncAt).toLocaleString()}</p>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {integration.features.supportsRecording && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">Recording</span>}
              {integration.features.supportsTranscription && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">Transcription</span>}
              {integration.features.supportsBreakoutRooms && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">Breakout Rooms</span>}
              {integration.features.supportsWhiteboard && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">Whiteboard</span>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSyncIntegration(integration.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Sync
              </button>
              <button
                onClick={() => handleDisconnectIntegration(integration.id)}
                className="px-3 py-1 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No integrations configured. Add one to connect with video providers.
        </div>
      )}
    </div>
  );

  const renderBackgrounds = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Virtual Backgrounds</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Upload Background
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {backgrounds.map((bg) => (
          <div key={bg.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
              {bg.backgroundType === 'IMAGE' && bg.imageUrl ? (
                <img src={bg.thumbnailUrl || bg.imageUrl} alt={bg.backgroundName} className="w-full h-full object-cover" />
              ) : bg.backgroundType === 'BLUR' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-800">
                  <span className="text-white text-sm">Blur</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Preview</span>
                </div>
              )}
              {bg.isDefault && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded">Default</span>
              )}
              {bg.isCompanyBranded && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">Branded</span>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{bg.backgroundName}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{bg.usageCount} uses</p>
              <div className="flex gap-2 mt-2">
                {!bg.isDefault && (
                  <button
                    onClick={() => handleSetDefaultBackground(bg.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {backgrounds.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No virtual backgrounds configured. Upload one to get started.
        </div>
      )}
    </div>
  );

  const renderOneWayInterviews = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">One-Way Interviews</h3>
        <button
          onClick={() => setShowOneWayForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Interview
        </button>
      </div>

      {showOneWayForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Create One-Way Interview</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={oneWayForm.title}
                onChange={(e) => setOneWayForm({ ...oneWayForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter interview title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={oneWayForm.description || ''}
                onChange={(e) => setOneWayForm({ ...oneWayForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Enter interview description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowOneWayForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOneWay}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Interview'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {oneWayInterviews.map((interview) => (
          <div key={interview.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{interview.title}</h4>
                {interview.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{interview.description}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                interview.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                interview.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                interview.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {interview.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Questions</p>
                <p className="font-medium text-gray-900 dark:text-white">{interview.questions.length}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Invited</p>
                <p className="font-medium text-gray-900 dark:text-white">{interview.totalInvited}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Completed</p>
                <p className="font-medium text-gray-900 dark:text-white">{interview.totalCompleted}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Avg Score</p>
                <p className="font-medium text-gray-900 dark:text-white">{interview.averageScore?.toFixed(1) || '-'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {interview.status === 'DRAFT' && (
                <button
                  onClick={() => handlePublishOneWay(interview.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => handleViewResponses(interview)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                View Responses ({interview.totalCompleted})
              </button>
              {interview.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handleArchiveOneWay(interview.id)}
                  className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {oneWayInterviews.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No one-way interviews found. Create one to get started.
        </div>
      )}
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveTab('one-way')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          &larr; Back to Interviews
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Responses: {selectedInterview?.title}
        </h3>
      </div>

      <div className="space-y-4">
        {responses.map((response) => (
          <div key={response.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Candidate ID: {response.candidateId}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted: {response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'Not submitted'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                response.status === 'REVIEWED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                response.status === 'SUBMITTED' || response.status === 'READY' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                response.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {response.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {response.totalDurationSeconds ? `${Math.round(response.totalDurationSeconds / 60)} min` : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">AI Score</p>
                <p className="font-medium text-gray-900 dark:text-white">{response.aiScore || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Reviewer Score</p>
                <p className="font-medium text-gray-900 dark:text-white">{response.reviewerScore || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Views</p>
                <p className="font-medium text-gray-900 dark:text-white">{response.viewCount}</p>
              </div>
            </div>
            {response.feedback && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">Feedback: {response.feedback}</p>
              </div>
            )}
            {response.recommendation && (
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  response.recommendation === 'ADVANCE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  response.recommendation === 'REJECT' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {response.recommendation}
                </span>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                View Details
              </button>
              {response.status !== 'REVIEWED' && (
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  Review
                </button>
              )}
              <button className="px-3 py-1 text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {responses.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No responses found for this interview.
        </div>
      )}
    </div>
  );

  const renderRecordings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recordings</h3>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Select a video room to view its recordings.
      </div>
    </div>
  );

  const renderTranscriptions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcriptions</h3>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Select a video room to view its transcriptions.
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'rooms':
        return renderRooms();
      case 'integrations':
        return renderIntegrations();
      case 'recordings':
        return renderRecordings();
      case 'transcriptions':
        return renderTranscriptions();
      case 'backgrounds':
        return renderBackgrounds();
      case 'one-way':
        return renderOneWayInterviews();
      case 'responses':
        return renderResponses();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Interview Platform</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage video interviews, recordings, and one-way async interviews
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading && !stats && !rooms.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default VideoInterviewHub;
