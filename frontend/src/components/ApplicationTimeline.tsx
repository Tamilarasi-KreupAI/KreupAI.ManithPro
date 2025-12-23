interface TimelineEvent {
  status: string;
  label: string;
  date?: string;
  description?: string;
  completed: boolean;
  active: boolean;
}

interface ApplicationTimelineProps {
  currentStatus: string;
  appliedAt: string;
  updatedAt: string;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  currentStatus,
  appliedAt,
  updatedAt,
}) => {
  // Define the typical application workflow
  const statusFlow = [
    { status: 'PENDING', label: 'Application Submitted', description: 'Your application has been received' },
    { status: 'REVIEWING', label: 'Under Review', description: 'Recruiter is reviewing your profile' },
    { status: 'SHORTLISTED', label: 'Shortlisted', description: 'You\'ve been selected for next round' },
    { status: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', description: 'Interview date has been set' },
    { status: 'ACCEPTED', label: 'Offer Extended', description: 'Congratulations! You got the offer' },
  ];

  // Rejected and Withdrawn are terminal states not in the flow
  const isRejected = currentStatus === 'REJECTED';
  const isWithdrawn = currentStatus === 'WITHDRAWN';

  // Find current status index
  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);

  // Build timeline events
  const timelineEvents: TimelineEvent[] = statusFlow.map((step, index) => {
    const completed = index < currentIndex || (index === currentIndex && !isRejected && !isWithdrawn);
    const active = index === currentIndex;

    return {
      ...step,
      date: index === 0 ? appliedAt : (completed ? updatedAt : undefined),
      completed,
      active,
    };
  });

  // Add rejection/withdrawal if applicable
  if (isRejected || isWithdrawn) {
    const lastCompletedIndex = statusFlow.findIndex(s => s.status === currentStatus);
    if (lastCompletedIndex === -1) {
      // Was rejected during initial review
      timelineEvents[0].completed = true;
    }

    timelineEvents.push({
      status: currentStatus,
      label: currentStatus === 'REJECTED' ? 'Application Closed' : 'Application Withdrawn',
      description: currentStatus === 'REJECTED'
        ? 'Unfortunately, we decided to move forward with other candidates'
        : 'You withdrew your application',
      date: updatedAt,
      completed: true,
      active: true,
    });
  }

  const getStepIcon = (step: TimelineEvent) => {
    if (step.completed && step.active && (isRejected || isWithdrawn)) {
      return (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }

    if (step.completed) {
      return (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (step.active) {
      return (
        <div className="relative">
          <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-current animate-pulse"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-6 w-6 rounded-full border-2 border-current"></div>
    );
  };

  const getStepColor = (step: TimelineEvent) => {
    if (step.completed && step.active && isRejected) {
      return 'text-red-600';
    }
    if (step.completed && step.active && isWithdrawn) {
      return 'text-gray-600';
    }
    if (step.completed) {
      return 'text-green-600';
    }
    if (step.active) {
      return 'text-blue-600';
    }
    return 'text-gray-400';
  };

  const getConnectorColor = (index: number) => {
    if (index < currentIndex || (index === currentIndex && timelineEvents[index].completed)) {
      if (isRejected && index === timelineEvents.length - 2) {
        return 'bg-red-300';
      }
      return 'bg-green-300';
    }
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Journey</h3>

      <div className="relative">
        {/* Timeline */}
        <div className="space-y-8">
          {timelineEvents.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 ${getStepColor(step)}`}>
                  {getStepIcon(step, index)}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${
                      step.active ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {step.label}
                    </h4>
                    {step.date && (
                      <span className="text-xs text-gray-500">
                        {new Date(step.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        } as Intl.DateTimeFormatOptions)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                  {step.active && !isRejected && !isWithdrawn && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current Stage
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < timelineEvents.length - 1 && (
                <div
                  className={`absolute left-3 top-8 w-0.5 h-8 -ml-px ${getConnectorColor(index)}`}
                  style={{ transform: 'translateX(-50%)' }}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Expected Next Steps */}
        {!isRejected && !isWithdrawn && currentIndex < statusFlow.length - 1 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h5 className="text-sm font-semibold text-blue-900">What's Next?</h5>
                <p className="text-sm text-blue-800 mt-1">
                  {currentStatus === 'PENDING' && 'Your application will be reviewed by our recruitment team within 3-5 business days.'}
                  {currentStatus === 'REVIEWING' && 'If shortlisted, you\'ll be contacted for the next round within 1 week.'}
                  {currentStatus === 'SHORTLISTED' && 'Our team will reach out to schedule an interview soon.'}
                  {currentStatus === 'INTERVIEW_SCHEDULED' && 'Prepare for your interview! Check your email for details and resources.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Message */}
        {isRejected && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h5 className="text-sm font-semibold text-red-900">Application Closed</h5>
                <p className="text-sm text-red-800 mt-1">
                  We appreciate your interest in this position. While we won't be moving forward with your application at this time, we encourage you to apply for other opportunities that match your skills.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
