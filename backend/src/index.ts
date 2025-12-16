import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import savedJobRoutes from './routes/savedJob.routes';
import companyRoutes from './routes/company.routes';
import interviewRoutes from './routes/interview.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import candidateProfileRoutes from './routes/candidateProfile.routes';
import achievementsRoutes from './routes/achievements.routes';
import resumeRoutes from './routes/resume.routes';
import profileVersioningRoutes from './routes/profileVersioning.routes';
import integrationsRoutes from './routes/integrations.routes';
import additionalIntegrationsRoutes from './routes/additionalIntegrations.routes';
import batch4IntegrationsRoutes from './routes/batch4Integrations.routes';
import verificationRoutes from './routes/verification.routes';
import extendedVerificationRoutes from './routes/extendedVerification.routes';
import assessmentsRoutes from './routes/assessments.routes';
import batch7AssessmentsRoutes from './routes/batch7Assessments.routes';
import batch8ScoringRoutes from './routes/batch8Scoring.routes';
import batch9AdvancedScoringRoutes from './routes/batch9AdvancedScoring.routes';
import batch10ExtendedScoringRoutes from './routes/batch10ExtendedScoring.routes';
import batch11AIContentGenerationRoutes from './routes/batch11AIContentGeneration.routes';
import batch12ExtendedAIContentRoutes from './routes/batch12ExtendedAIContent.routes';
import batch13CandidateAIContentRoutes from './routes/batch13CandidateAIContent.routes';
import batch14ExtendedAINLPRoutes from './routes/batch14ExtendedAINLP.routes';
import batch15CalendarSchedulingRoutes from './routes/batch15CalendarScheduling.routes';
import batch16RemindersNotificationsRoutes from './routes/batch16RemindersNotifications.routes';
import batch17AIScreeningRoutes from './routes/batch17AIScreening.routes';
import batch18InterviewAnalysisRoutes from './routes/batch18InterviewAnalysis.routes';
import batch19AIKnowledgeBaseRoutes from './routes/batch19AIKnowledgeBase.routes';
import batch20VideoInterviewRoutes from './routes/batch20VideoInterview.routes';
import batch21SemanticMatchingRoutes from './routes/batch21SemanticMatching.routes';
import batch22PredictiveAnalyticsRoutes from './routes/batch22PredictiveAnalytics.routes';
import batch23SmartRecommendationsRoutes from './routes/batch23SmartRecommendations.routes';
import batch24HiringTeamManagementRoutes from './routes/batch24HiringTeamManagement.routes';
import batch25CollaborativeEvaluationRoutes from './routes/batch25CollaborativeEvaluation.routes';
import batch26RealtimeCommunicationRoutes from './routes/batch26RealtimeCommunication.routes';
import batch27AuthenticationAccessRoutes from './routes/batch27AuthenticationAccess.routes';
// import batch28DataProtectionRoutes from './routes/batch28DataProtection.routes'; // Temporarily disabled - missing controller functions
import batch29ComplianceRoutes from './routes/batch29Compliance.routes';
import batch30RecruitmentAnalyticsRoutes from './routes/batch30RecruitmentAnalytics.routes';
import batch31ExecutiveDashboardsRoutes from './routes/batch31ExecutiveDashboards.routes';
import batch32MarketIntelligenceRoutes from './routes/batch32MarketIntelligence.routes';
import batch33HRIntegrationsRoutes from './routes/batch33HRIntegrations.routes';
import batch34CommunicationIntegrationsRoutes from './routes/batch34CommunicationIntegrations.routes';
import batch35JobBoardIntegrationsRoutes from './routes/batch35JobBoardIntegrations.routes';
import batch36DeveloperToolsRoutes from './routes/batch36DeveloperTools.routes';
import batch37_39WorkflowAutomationRoutes from './routes/batch37_39WorkflowAutomation.routes';
import batch40_42MobileAccessibilityRoutes from './routes/batch40_42MobileAccessibility.routes';
import batch43_45EnterpriseAdminRoutes from './routes/batch43_45EnterpriseAdmin.routes';
import batch46_49TechnicalInfraRoutes from './routes/batch46_49TechnicalInfra.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware for response optimization
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'KreupAI Recruitment Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      users: '/api/users',
      savedJobs: '/api/saved-jobs',
      companies: '/api/companies',
      interviews: '/api/interviews',
      resumes: '/api/resumes',
      messages: '/api/messages',
      notifications: '/api/notifications',
      admin: '/api/admin',
      candidateProfile: '/api/candidate-profile',
      achievements: '/api/achievements',
      profileVersions: '/api/profile-versions',
      integrations: '/api/integrations',
      additionalIntegrations: '/api/additional-integrations',
      batch4Integrations: '/api/batch4-integrations',
      verification: '/api/verification',
      extendedVerification: '/api/extended-verification',
      assessments: '/api/assessments',
      batch7Assessments: '/api/batch7-assessments',
      batch8Scoring: '/api/batch8-scoring',
      batch9AdvancedScoring: '/api/batch9-advanced-scoring',
      batch10ExtendedScoring: '/api/batch10-extended-scoring',
      batch11AIContentGeneration: '/api/ai-content',
      batch12ExtendedAIContent: '/api/ai-content-extended',
      batch13CandidateAIContent: '/api/candidate-ai',
      batch14ExtendedAINLP: '/api/ai-nlp',
      batch15CalendarScheduling: '/api/calendar',
      batch16RemindersNotifications: '/api/reminders',
      batch17AIScreening: '/api/screening',
      batch18InterviewAnalysis: '/api/analysis',
      batch19KnowledgeBase: '/api/knowledge-base',
      batch20VideoInterview: '/api/video',
      batch21SemanticMatching: '/api/matching',
      batch22PredictiveAnalytics: '/api/predictions',
      batch23SmartRecommendations: '/api/recommendations',
      batch24HiringTeamManagement: '/api/hiring-teams',
      batch25CollaborativeEvaluation: '/api/evaluation',
      batch26RealtimeCommunication: '/api/realtime',
      batch27AuthenticationAccess: '/api/security',
      batch28DataProtection: '/api/data-protection',
      batch29Compliance: '/api/compliance',
      batch30RecruitmentAnalytics: '/api/recruitment-analytics',
      batch31ExecutiveDashboards: '/api/executive',
      batch32MarketIntelligence: '/api/market-intelligence',
      batch33HRIntegrations: '/api/hr-integrations',
      batch34CommunicationIntegrations: '/api/communication-integrations',
      batch35JobBoardIntegrations: '/api/job-boards',
      batch36DeveloperTools: '/api/developer',
      batch37_39WorkflowAutomation: '/api/workflow-automation',
      batch40_42MobileAccessibility: '/api/mobile',
      batch43_45EnterpriseAdmin: '/api/admin-enterprise',
      batch46_49TechnicalInfra: '/api/infrastructure',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate-profile', candidateProfileRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/profile-versions', profileVersioningRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/additional-integrations', additionalIntegrationsRoutes);
app.use('/api/batch4-integrations', batch4IntegrationsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/extended-verification', extendedVerificationRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/batch7-assessments', batch7AssessmentsRoutes);
app.use('/api/batch8-scoring', batch8ScoringRoutes);
app.use('/api/batch9-advanced-scoring', batch9AdvancedScoringRoutes);
app.use('/api/batch10-extended-scoring', batch10ExtendedScoringRoutes);
app.use('/api/ai-content', batch11AIContentGenerationRoutes);
app.use('/api/ai-content-extended', batch12ExtendedAIContentRoutes);
app.use('/api/candidate-ai', batch13CandidateAIContentRoutes);
app.use('/api/ai-nlp', batch14ExtendedAINLPRoutes);
app.use('/api/calendar', batch15CalendarSchedulingRoutes);
app.use('/api/reminders', batch16RemindersNotificationsRoutes);
app.use('/api/screening', batch17AIScreeningRoutes);
app.use('/api/analysis', batch18InterviewAnalysisRoutes);
app.use('/api/knowledge-base', batch19AIKnowledgeBaseRoutes);
app.use('/api/video', batch20VideoInterviewRoutes);
app.use('/api/matching', batch21SemanticMatchingRoutes);
app.use('/api/predictions', batch22PredictiveAnalyticsRoutes);
app.use('/api/recommendations', batch23SmartRecommendationsRoutes);
app.use('/api/hiring-teams', batch24HiringTeamManagementRoutes);
app.use('/api/evaluation', batch25CollaborativeEvaluationRoutes);
app.use('/api/realtime', batch26RealtimeCommunicationRoutes);
app.use('/api/security', batch27AuthenticationAccessRoutes);
// app.use('/api/data-protection', batch28DataProtectionRoutes); // Temporarily disabled
app.use('/api/compliance', batch29ComplianceRoutes);
app.use('/api/recruitment-analytics', batch30RecruitmentAnalyticsRoutes);
app.use('/api/executive', batch31ExecutiveDashboardsRoutes);
app.use('/api/market-intelligence', batch32MarketIntelligenceRoutes);
app.use('/api/hr-integrations', batch33HRIntegrationsRoutes);
app.use('/api/communication-integrations', batch34CommunicationIntegrationsRoutes);
app.use('/api/job-boards', batch35JobBoardIntegrationsRoutes);
app.use('/api/developer', batch36DeveloperToolsRoutes);
app.use('/api/workflow-automation', batch37_39WorkflowAutomationRoutes);
app.use('/api/mobile', batch40_42MobileAccessibilityRoutes);
app.use('/api/admin-enterprise', batch43_45EnterpriseAdminRoutes);
app.use('/api/infrastructure', batch46_49TechnicalInfraRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
