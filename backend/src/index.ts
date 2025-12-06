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
import profileVersioningRoutes from './routes/profileVersioning.routes';
import integrationsRoutes from './routes/integrations.routes';
import additionalIntegrationsRoutes from './routes/additionalIntegrations.routes';
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
      messages: '/api/messages',
      notifications: '/api/notifications',
      admin: '/api/admin',
      candidateProfile: '/api/candidate-profile',
      achievements: '/api/achievements',
      profileVersions: '/api/profile-versions',
      integrations: '/api/integrations',
      additionalIntegrations: '/api/additional-integrations',
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
app.use('/api/profile-versions', profileVersioningRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/additional-integrations', additionalIntegrationsRoutes);

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
