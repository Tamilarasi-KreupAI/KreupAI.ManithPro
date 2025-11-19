import React from 'react';
import { useAuth } from '../context/AuthContext';
import EnhancedRecruiterDashboard from './EnhancedRecruiterDashboard';
import EnhancedCandidateDashboard from './EnhancedCandidateDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Route to enhanced dashboards based on user role
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <EnhancedRecruiterDashboard />;
  }

  return <EnhancedCandidateDashboard />;
};

export default Dashboard;
