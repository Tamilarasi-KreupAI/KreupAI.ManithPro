import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Stack Overflow
  connectStackOverflow,
  getStackOverflowProfile,
  disconnectStackOverflow,
  // Notion
  connectNotion,
  getNotionPortfolio,
  disconnectNotion,
  // GitLab
  connectGitLab,
  getGitLabProfile,
  disconnectGitLab,
  // Design Platforms (Behance/Dribbble)
  connectDesignPlatform,
  getDesignPortfolios,
  disconnectDesignPlatform,
  // Blog Platforms (Medium/Dev.to)
  connectBlogPlatform,
  getBlogPlatforms,
  disconnectBlogPlatform,
  // Status
  getAllIntegrationsStatus,
} from '../controllers/additionalIntegrations.controller';

const router = Router();

// ============================================
// STACK OVERFLOW INTEGRATION ROUTES
// ============================================

// Connect Stack Overflow account
router.post('/stackoverflow/connect', authenticate, connectStackOverflow);

// Get Stack Overflow profile
router.get('/stackoverflow/profile', authenticate, getStackOverflowProfile);

// Disconnect Stack Overflow
router.delete('/stackoverflow/disconnect', authenticate, disconnectStackOverflow);

// ============================================
// NOTION INTEGRATION ROUTES
// ============================================

// Connect Notion workspace
router.post('/notion/connect', authenticate, connectNotion);

// Get Notion portfolio
router.get('/notion/portfolio', authenticate, getNotionPortfolio);

// Disconnect Notion
router.delete('/notion/disconnect', authenticate, disconnectNotion);

// ============================================
// GITLAB INTEGRATION ROUTES
// ============================================

// Connect GitLab account
router.post('/gitlab/connect', authenticate, connectGitLab);

// Get GitLab profile
router.get('/gitlab/profile', authenticate, getGitLabProfile);

// Disconnect GitLab
router.delete('/gitlab/disconnect', authenticate, disconnectGitLab);

// ============================================
// DESIGN PLATFORM ROUTES (BEHANCE/DRIBBBLE)
// ============================================

// Connect a design platform
router.post('/design/connect', authenticate, connectDesignPlatform);

// Get all design portfolios
router.get('/design/portfolios', authenticate, getDesignPortfolios);

// Disconnect a design platform
router.delete('/design/:platform/disconnect', authenticate, disconnectDesignPlatform);

// ============================================
// BLOG PLATFORM ROUTES (MEDIUM/DEV.TO)
// ============================================

// Connect a blog platform
router.post('/blog/connect', authenticate, connectBlogPlatform);

// Get all blog platforms
router.get('/blog/platforms', authenticate, getBlogPlatforms);

// Disconnect a blog platform
router.delete('/blog/:platform/disconnect', authenticate, disconnectBlogPlatform);

// ============================================
// STATUS ROUTES
// ============================================

// Get status of all additional integrations
router.get('/status/all', authenticate, getAllIntegrationsStatus);

export default router;
