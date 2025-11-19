import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import EnhancedCompanyProfile from './pages/EnhancedCompanyProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminJobManagement from './pages/AdminJobManagement';
import AdminApplicationManagement from './pages/AdminApplicationManagement';
import AdminConfiguration from './pages/AdminConfiguration';
import AdminCommunication from './pages/AdminCommunication';

function App() {
  return (
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </main>
          <PWAInstallPrompt />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
