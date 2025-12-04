import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { applicationAPI } from '../services/api';

import { Application, ApplicationStatus } from '../types';

const ApplicationKanban: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'PENDING', title: 'New Applications', color: 'bg-blue-500' },
    { id: 'REVIEWING', title: 'Under Review', color: 'bg-purple-500' },
    { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-green-500' },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interview', color: 'bg-yellow-500' },
    { id: 'ACCEPTED', title: 'Hired', color: 'bg-emerald-500' },
    { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { applications: data } = await applicationAPI.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApplicationStatus;

    try {
      // Update the status in backend
      await applicationAPI.updateStatus(draggableId, { status: newStatus });

      // Update local state
      setApplications(prevApps =>
        prevApps.map(app =>
          app.id === draggableId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Failed to update application status:', error);
      // Revert the change
      fetchApplications();
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const getStatusColor = (status: string) => {
    const column = columns.find(col => col.id === status);
    return column ? column.color : 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Pipeline</h1>
            <p className="mt-2 text-gray-600">Drag and drop candidates to update their status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              List View
            </button>
            <button
              onClick={fetchApplications}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {columns.map(column => {
            const count = getApplicationsByStatus(column.id).length;
            return (
              <div key={column.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className={`h-2 ${column.color} rounded-full mb-2`}></div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{column.title}</p>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(column => {
              const columnApplications = getApplicationsByStatus(column.id);
              return (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <div className="bg-gray-100 rounded-lg p-4">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 ${column.color} rounded-full`}></div>
                        <h2 className="font-semibold text-gray-900">{column.title}</h2>
                      </div>
                      <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                        {columnApplications.length}
                      </span>
                    </div>

                    {/* Droppable Column */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[600px] space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                            }`}
                        >
                          {columnApplications.map((application, index) => (
                            <Draggable
                              key={application.id}
                              draggableId={application.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                                    }`}
                                  onClick={(e) => {
                                    if (!snapshot.isDragging) {
                                      navigate(`/applications/${application.id}`);
                                    }
                                  }}
                                >
                                  {/* Candidate Info */}
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0">
                                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-600">
                                          {application.candidate?.firstName?.[0]}
                                          {application.candidate?.lastName?.[0]}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-gray-900 truncate">
                                        {application.candidate?.firstName} {application.candidate?.lastName}
                                      </h3>
                                      <p className="text-sm text-gray-600 truncate">
                                        {application.job?.title}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Skills */}
                                  {application.candidate?.skills && application.candidate.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {application.candidate.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {application.candidate.skills.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                          +{application.candidate.skills.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                      {new Date(application.appliedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/applications/${application.id}`);
                                      }}
                                      className="text-primary-600 hover:text-primary-700"
                                    >
                                      View →
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {columnApplications.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                              <svg
                                className="mx-auto h-12 w-12 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-sm">No applications</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ApplicationKanban;
