import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Package not installed
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { queryClient } from './lib/queryClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';
import SavedJobs from './pages/SavedJobs';
import CompanyProfile from './pages/CompanyProfile';
import Applications from './pages/Applications';
import ResumeManager from './pages/ResumeManager';
import AdvancedJobSearch from './pages/AdvancedJobSearch';
import JobRecommendations from './pages/JobRecommendations';
import JobForm from './pages/JobForm';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterApplications from './pages/RecruiterApplications';
import CandidateSearch from './pages/CandidateSearch';
import InterviewCalendar from './pages/InterviewCalendar';
import Interviews from './pages/Interviews';
import InterviewDetail from './pages/InterviewDetail';
import Messages from './pages/Messages';
import ApplicationKanban from './pages/ApplicationKanban';
import SuperAdvancedJobSearch from './pages/SuperAdvancedJobSearch';
import AchievementsPage from './pages/AchievementsPage';
import SalaryInsights from './pages/SalaryInsights';
import SmartRecommendations from './pages/SmartRecommendations';
import RecruiterRecommendations from './pages/RecruiterRecommendations';
import EnhancedProfile from './pages/EnhancedProfile';
import ProfileBuilder from './pages/ProfileBuilder';
import EnhancedCompanyProfile from './pages/EnhancedCompanyProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminJobManagement from './pages/AdminJobManagement';
import AdminApplicationManagement from './pages/AdminApplicationManagement';
import AdminConfiguration from './pages/AdminConfiguration';
import AdminCommunication from './pages/AdminCommunication';
import AdminInterviewManagement from './pages/AdminInterviewManagement';
import AdminAdvancedAnalytics from './pages/AdminAdvancedAnalytics';
import AdminContentManagement from './pages/AdminContentManagement';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBilling from './pages/AdminBilling';
import AdminReports from './pages/AdminReports';
import AdminMonitoring from './pages/AdminMonitoring';

// B2B Imports
import B2BLayout from './components/b2b/B2BLayout';
import B2BDashboard from './pages/b2b/B2BDashboard';
import BulkRequirements from './pages/b2b/BulkRequirements';
import PostRequirement from './pages/b2b/PostRequirement';
import CandidateSupply from './pages/b2b/CandidateSupply';
import UploadSupply from './pages/b2b/UploadSupply';
import Contracts from './pages/b2b/Contracts';
import Invoices from './pages/b2b/Invoices';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <Navbar />
                <main id="main-content" role="main" tabIndex={-1}>
                  <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <Jobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:id"
                  element={
                    <ProtectedRoute>
                      <JobDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications/:id"
                  element={
                    <ProtectedRoute>
                      <ApplicationDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/enhanced"
                  element={
                    <ProtectedRoute>
                      <EnhancedProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/builder"
                  element={
                    <ProtectedRoute>
                      <ProfileBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-jobs"
                  element={
                    <ProtectedRoute>
                      <SavedJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/companies/:name"
                  element={
                    <ProtectedRoute>
                      <CompanyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/companies/:name/enhanced"
                  element={
                    <ProtectedRoute>
                      <EnhancedCompanyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <Applications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resumes"
                  element={
                    <ProtectedRoute>
                      <ResumeManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <AdvancedJobSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute>
                      <JobRecommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/new"
                  element={
                    <ProtectedRoute>
                      <JobForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:id/edit"
                  element={
                    <ProtectedRoute>
                      <JobForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applications"
                  element={
                    <ProtectedRoute>
                      <RecruiterApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/kanban"
                  element={
                    <ProtectedRoute>
                      <ApplicationKanban />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidates"
                  element={
                    <ProtectedRoute>
                      <CandidateSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews"
                  element={
                    <ProtectedRoute>
                      <Interviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-calendar"
                  element={
                    <ProtectedRoute>
                      <InterviewCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advanced-search"
                  element={
                    <ProtectedRoute>
                      <SuperAdvancedJobSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <ProtectedRoute>
                      <AchievementsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salary-insights"
                  element={
                    <ProtectedRoute>
                      <SalaryInsights />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-recommendations"
                  element={
                    <ProtectedRoute>
                      <SmartRecommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/recommendations"
                  element={
                    <ProtectedRoute>
                      <RecruiterRecommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <AdminUserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/jobs"
                  element={
                    <ProtectedRoute>
                      <AdminJobManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedRoute>
                      <AdminApplicationManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/configuration"
                  element={
                    <ProtectedRoute>
                      <AdminConfiguration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/communication"
                  element={
                    <ProtectedRoute>
                      <AdminCommunication />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/interviews"
                  element={
                    <ProtectedRoute>
                      <AdminInterviewManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute>
                      <AdminAdvancedAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <ProtectedRoute>
                      <AdminContentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute>
                      <AdminAuditLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/billing"
                  element={
                    <ProtectedRoute>
                      <AdminBilling />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/monitoring"
                  element={
                    <ProtectedRoute>
                      <AdminMonitoring />
                    </ProtectedRoute>
                  }
                />

                {/* B2B Routes */}
                <Route path="/b2b" element={<ProtectedRoute><B2BLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<B2BDashboard />} />
                  <Route path="requirements" element={<BulkRequirements />} />
                  <Route path="requirements/new" element={<PostRequirement />} />
                  <Route path="supply" element={<CandidateSupply />} />
                  <Route path="supply/upload" element={<UploadSupply />} />
                  <Route path="contracts" element={<Contracts />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="settings" element={<div className="p-6">Settings Page (Coming Soon)</div>} />
                </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <PWAInstallPrompt />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--toast-bg, #fff)',
                      color: 'var(--toast-color, #363636)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </Router>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
