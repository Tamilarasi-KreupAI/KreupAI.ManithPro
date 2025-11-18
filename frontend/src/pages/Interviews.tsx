import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, Interview } from '../services/interviewAPI';

const Interviews: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('upcoming');

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      if (filter === 'upcoming') {
        const data = await interviewAPI.getUpcoming();
        setInterviews(data);
      } else {
        const params = filter !== 'all' ? { status: filter } : {};
        const data = await interviewAPI.getAll(params);
        setInterviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTypeLabel = (type: string) => {
    return type.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Interviews</h1>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-lg text-gray-600">No interviews found</p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => navigate(`/interviews/${interview.id}`)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {formatTypeLabel(interview.type)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {interview.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {interview.application?.job?.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(interview.scheduledAt)}
                    </p>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                      >
                        Join Meeting →
                      </a>
                    )}
                    {interview.location && (
                      <p className="text-sm text-gray-600 mt-1">Location: {interview.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
