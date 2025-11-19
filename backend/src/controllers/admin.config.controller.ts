import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// In-memory configuration store (in production, this should be in database)
interface SystemConfig {
  site: {
    name: string;
    description: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  jobs: {
    requireApproval: boolean;
    maxJobsPerRecruiter: number;
    jobExpirationDays: number;
    featuredJobsEnabled: boolean;
  };
  applications: {
    maxApplicationsPerCandidate: number;
    allowWithdrawal: boolean;
    autoRejectAfterDays: number;
  };
  email: {
    enabled: boolean;
    fromName: string;
    fromEmail: string;
    notificationsEnabled: boolean;
  };
  uploads: {
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
  };
  security: {
    passwordMinLength: number;
    requireEmailVerification: boolean;
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
  };
}

// Default configuration
let systemConfig: SystemConfig = {
  site: {
    name: 'KreupAI Recruitment Portal',
    description: 'A comprehensive recruitment platform',
    maintenanceMode: false,
    allowRegistration: true,
  },
  jobs: {
    requireApproval: false,
    maxJobsPerRecruiter: 100,
    jobExpirationDays: 90,
    featuredJobsEnabled: true,
  },
  applications: {
    maxApplicationsPerCandidate: 50,
    allowWithdrawal: true,
    autoRejectAfterDays: 60,
  },
  email: {
    enabled: true,
    fromName: 'KreupAI',
    fromEmail: 'noreply@kreupai.com',
    notificationsEnabled: true,
  },
  uploads: {
    maxFileSize: 5,
    allowedFileTypes: ['.pdf', '.doc', '.docx'],
  },
  security: {
    passwordMinLength: 6,
    requireEmailVerification: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
};

// Load configuration from file
const configFilePath = path.join(__dirname, '../../config/system.json');

const loadConfig = () => {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      systemConfig = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
};

// Save configuration to file
const saveConfig = () => {
  try {
    const configDir = path.dirname(configFilePath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configFilePath, JSON.stringify(systemConfig, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
};

// Initialize config on load
loadConfig();

// Get all system configuration
export const getSystemConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(systemConfig);
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system configuration' });
  }
};

// Update site configuration
export const updateSiteConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, maintenanceMode, allowRegistration } = req.body;

    systemConfig.site = {
      ...systemConfig.site,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(maintenanceMode !== undefined && { maintenanceMode }),
      ...(allowRegistration !== undefined && { allowRegistration }),
    };

    saveConfig();
    res.json({ message: 'Site configuration updated', config: systemConfig.site });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ error: 'Failed to update site configuration' });
  }
};

// Update jobs configuration
export const updateJobsConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requireApproval, maxJobsPerRecruiter, jobExpirationDays, featuredJobsEnabled } = req.body;

    systemConfig.jobs = {
      ...systemConfig.jobs,
      ...(requireApproval !== undefined && { requireApproval }),
      ...(maxJobsPerRecruiter !== undefined && { maxJobsPerRecruiter }),
      ...(jobExpirationDays !== undefined && { jobExpirationDays }),
      ...(featuredJobsEnabled !== undefined && { featuredJobsEnabled }),
    };

    saveConfig();
    res.json({ message: 'Jobs configuration updated', config: systemConfig.jobs });
  } catch (error) {
    console.error('Error updating jobs config:', error);
    res.status(500).json({ error: 'Failed to update jobs configuration' });
  }
};

// Update applications configuration
export const updateApplicationsConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { maxApplicationsPerCandidate, allowWithdrawal, autoRejectAfterDays } = req.body;

    systemConfig.applications = {
      ...systemConfig.applications,
      ...(maxApplicationsPerCandidate !== undefined && { maxApplicationsPerCandidate }),
      ...(allowWithdrawal !== undefined && { allowWithdrawal }),
      ...(autoRejectAfterDays !== undefined && { autoRejectAfterDays }),
    };

    saveConfig();
    res.json({ message: 'Applications configuration updated', config: systemConfig.applications });
  } catch (error) {
    console.error('Error updating applications config:', error);
    res.status(500).json({ error: 'Failed to update applications configuration' });
  }
};

// Update email configuration
export const updateEmailConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enabled, fromName, fromEmail, notificationsEnabled } = req.body;

    systemConfig.email = {
      ...systemConfig.email,
      ...(enabled !== undefined && { enabled }),
      ...(fromName !== undefined && { fromName }),
      ...(fromEmail !== undefined && { fromEmail }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
    };

    saveConfig();
    res.json({ message: 'Email configuration updated', config: systemConfig.email });
  } catch (error) {
    console.error('Error updating email config:', error);
    res.status(500).json({ error: 'Failed to update email configuration' });
  }
};

// Update uploads configuration
export const updateUploadsConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { maxFileSize, allowedFileTypes } = req.body;

    systemConfig.uploads = {
      ...systemConfig.uploads,
      ...(maxFileSize !== undefined && { maxFileSize }),
      ...(allowedFileTypes !== undefined && { allowedFileTypes }),
    };

    saveConfig();
    res.json({ message: 'Uploads configuration updated', config: systemConfig.uploads });
  } catch (error) {
    console.error('Error updating uploads config:', error);
    res.status(500).json({ error: 'Failed to update uploads configuration' });
  }
};

// Update security configuration
export const updateSecurityConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { passwordMinLength, requireEmailVerification, sessionTimeout, maxLoginAttempts } = req.body;

    systemConfig.security = {
      ...systemConfig.security,
      ...(passwordMinLength !== undefined && { passwordMinLength }),
      ...(requireEmailVerification !== undefined && { requireEmailVerification }),
      ...(sessionTimeout !== undefined && { sessionTimeout }),
      ...(maxLoginAttempts !== undefined && { maxLoginAttempts }),
    };

    saveConfig();
    res.json({ message: 'Security configuration updated', config: systemConfig.security });
  } catch (error) {
    console.error('Error updating security config:', error);
    res.status(500).json({ error: 'Failed to update security configuration' });
  }
};

// Reset configuration to defaults
export const resetConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    systemConfig = {
      site: {
        name: 'KreupAI Recruitment Portal',
        description: 'A comprehensive recruitment platform',
        maintenanceMode: false,
        allowRegistration: true,
      },
      jobs: {
        requireApproval: false,
        maxJobsPerRecruiter: 100,
        jobExpirationDays: 90,
        featuredJobsEnabled: true,
      },
      applications: {
        maxApplicationsPerCandidate: 50,
        allowWithdrawal: true,
        autoRejectAfterDays: 60,
      },
      email: {
        enabled: true,
        fromName: 'KreupAI',
        fromEmail: 'noreply@kreupai.com',
        notificationsEnabled: true,
      },
      uploads: {
        maxFileSize: 5,
        allowedFileTypes: ['.pdf', '.doc', '.docx'],
      },
      security: {
        passwordMinLength: 6,
        requireEmailVerification: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
      },
    };

    saveConfig();
    res.json({ message: 'Configuration reset to defaults', config: systemConfig });
  } catch (error) {
    console.error('Error resetting config:', error);
    res.status(500).json({ error: 'Failed to reset configuration' });
  }
};

// Get system statistics
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalInterviews,
      activeUsers,
      diskUsage,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),
      // Active users in last 7 days
      prisma.user.count({
        where: {
          OR: [
            { applications: { some: { appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
            { postedJobs: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
          ],
        },
      }),
      // Disk usage (approximate based on uploads)
      getDiskUsage(),
    ]);

    res.json({
      database: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalInterviews,
        activeUsers,
      },
      storage: diskUsage,
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

// Helper function to get disk usage
const getDiskUsage = async (): Promise<{ used: number; files: number }> => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      return { used: 0, files: 0 };
    }

    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (dir: string) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          calculateSize(filePath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      });
    };

    calculateSize(uploadsDir);

    return {
      used: totalSize / 1024 / 1024, // MB
      files: fileCount,
    };
  } catch (error) {
    console.error('Error calculating disk usage:', error);
    return { used: 0, files: 0 };
  }
};

// Export current configuration
export { systemConfig };
