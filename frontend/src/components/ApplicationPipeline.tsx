import React, { useState, useEffect } from 'react';
import { applicationService, Application, ApplicationStatus } from '../utils/applicationService';

interface ApplicationPipelineProps {
  jobId?: string;
  onSelectApplication?: (application: Application) => void;
}

const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({ jobId, onSelectApplication }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);

  const stages: ApplicationStatus[] = [
    'APPLIED',
    'SCREENING',
    'PHONE_SCREEN',
    'TECHNICAL_INTERVIEW',
    'ONSITE_INTERVIEW',
    'OFFER_EXTENDED',
    'HIRED',
  ];

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications({
        jobIds: jobId ? [jobId] : undefined,
        statuses: stages,
      });
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
    setLoading(false);
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedApp(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    if (!draggedApp || draggedApp.status === targetStatus) {
      setDraggedApp(null);
      return;
    }

    // Check if this is a valid transition
    const validNextStatuses = applicationService.getNextStatuses(draggedApp.status);
    if (!validNextStatuses.includes(targetStatus) && targetStatus !== 'REJECTED') {
      alert('Invalid status transition. Please use the allowed workflow.');
      setDraggedApp(null);
      return;
    }

    try {
      await applicationService.updateApplicationStatus(
        draggedApp.id,
        targetStatus,
        `Moved from ${applicationService.getStatusLabel(draggedApp.status)} to ${applicationService.getStatusLabel(targetStatus)}`
      );
      await loadApplications();
    } catch (error) {
      alert('Failed to update application status');
    }

    setDraggedApp(null);
  };

  const renderApplicationCard = (app: Application) => (
    <div
      key={app.id}
      draggable
      onDragStart={(e) => handleDragStart(e, app)}
      onClick={() => onSelectApplication?.(app)}
      className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-move hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1">
            {app.candidateName}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {app.candidateEmail}
          </p>
        </div>
        {app.isBookmarked && (
          <svg className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" viewBox="0 0 20 20">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        {app.rating && (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3 h-3 ${star <= app.rating! ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        {app.matchScore && (
          <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
            {app.matchScore}% match
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(app.appliedDate).toLocaleDateString()}
        </span>
        {app.notes.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {app.notes.length}
          </span>
        )}
      </div>

      {app.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {app.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Pipeline
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop applications to move them through the hiring process
        </p>
      </div>

      {/* Pipeline Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-full">
          {stages.map((status) => {
            const stageApps = getApplicationsByStatus(status);
            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-900 rounded-xl p-4"
              >
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {applicationService.getStatusLabel(status)}
                    </h3>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-semibold">
                      {stageApps.length}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        status === 'APPLIED' ? 'bg-blue-500' :
                        status === 'SCREENING' ? 'bg-purple-500' :
                        status === 'PHONE_SCREEN' ? 'bg-indigo-500' :
                        status === 'TECHNICAL_INTERVIEW' ? 'bg-cyan-500' :
                        status === 'ONSITE_INTERVIEW' ? 'bg-teal-500' :
                        status === 'OFFER_EXTENDED' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (stageApps.length / Math.max(...stages.map(s => getApplicationsByStatus(s).length))) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Applications */}
                <div className="space-y-3 min-h-[400px]">
                  {stageApps.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No applications
                      </p>
                    </div>
                  ) : (
                    stageApps.map(renderApplicationCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Pipeline Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {stages.map((status) => {
            const count = getApplicationsByStatus(status).length;
            const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
            return (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {count}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {applicationService.getStatusLabel(status)}
                </p>
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 dark:bg-primary-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              How to use the pipeline
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Drag and drop applications between columns to update their status</li>
              <li>• Click on any application card to view full details</li>
              <li>• The system enforces valid workflow transitions</li>
              <li>• Bookmarked applications are marked with a star icon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPipeline;
