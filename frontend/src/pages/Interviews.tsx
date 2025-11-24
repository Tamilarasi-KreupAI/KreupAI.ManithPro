import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, Interview } from '../services/interviewAPI';

const Interviews: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Interviews</h1>
            <p className="text-slate-500 mt-2">Manage your upcoming and past interviews</p>
          </div>

          {/* Filters */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium appearance-none shadow-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="all">All Interviews</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl opacity-50">📅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No interviews found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                You don't have any interviews matching the selected filter. Apply to more jobs to increase your chances!
              </p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => navigate(`/interviews/${interview.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                        {formatTypeLabel(interview.type)}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${interview.status === 'SCHEDULED' ? 'bg-green-50 text-green-700 border-green-100' :
                        interview.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {interview.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {interview.application?.job?.title}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🗓️</span>
                        <span className="font-medium">{formatDateTime(interview.scheduledAt)}</span>
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span>{interview.location}</span>
                        </div>
                      )}
                    </div>

                    {interview.meetingLink && (
                      <div className="mt-4">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                        >
                          <span>🎥</span> Join Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="text-slate-300 group-hover:text-blue-500 transition-colors self-center sm:self-start">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
