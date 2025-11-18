import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI, Interview } from '../services/interviewAPI';

const InterviewCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchInterviews();
  }, [filter, selectedType]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      const data = await interviewAPI.getAll(params);
      setInterviews(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const getInterviewTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      PHONE_SCREEN: 'bg-blue-100 text-blue-800',
      TECHNICAL: 'bg-purple-100 text-purple-800',
      HR: 'bg-green-100 text-green-800',
      FINAL: 'bg-red-100 text-red-800',
      PEER: 'bg-yellow-100 text-yellow-800',
      CULTURAL_FIT: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RESCHEDULED: 'bg-yellow-100 text-yellow-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const groupInterviewsByDate = () => {
    const grouped: { [key: string]: Interview[] } = {};

    interviews.forEach((interview) => {
      const dateKey = new Date(interview.scheduledAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(interview);
    });

    // Sort interviews within each date
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    });

    return grouped;
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews.filter(
      (interview) =>
        new Date(interview.scheduledAt) >= now &&
        (interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED')
    );
  };

  const groupedInterviews = groupInterviewsByDate();
  const upcomingInterviews = getUpcomingInterviews();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Calendar</h1>
          <p className="mt-2 text-gray-600">Manage and view all your scheduled interviews</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="PHONE_SCREEN">Phone Screen</option>
                <option value="TECHNICAL">Technical</option>
                <option value="HR">HR</option>
                <option value="FINAL">Final Round</option>
                <option value="PEER">Peer Interview</option>
                <option value="CULTURAL_FIT">Cultural Fit</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingInterviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter((i) => i.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Interview List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Scheduled Interviews</h2>

            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4 text-lg text-gray-600">No interviews found</p>
                <p className="text-gray-500">Schedule interviews from the applications page</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedInterviews).map(([date, dateInterviews]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{date}</h3>
                    <div className="space-y-3">
                      {dateInterviews.map((interview) => {
                        const { time } = formatDateTime(interview.scheduledAt);
                        return (
                          <div
                            key={interview.id}
                            onClick={() => navigate(`/interviews/${interview.id}`)}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getInterviewTypeColor(interview.type)}`}>
                                    {formatTypeLabel(interview.type)}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(interview.status)}`}>
                                    {interview.status}
                                  </span>
                                  <span className="text-sm text-gray-600">{time}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">
                                  {interview.candidate?.firstName} {interview.candidate?.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{interview.application?.job?.title}</p>
                                {interview.meetingLink && (
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Join Meeting
                                  </a>
                                )}
                                {interview.location && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Location:</span> {interview.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCalendar;
