import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Kaggle
  connectKaggle,
  getKaggleProfile,
  disconnectKaggle,
  // Coding Platforms
  connectCodingPlatform,
  getCodingPlatforms,
  disconnectCodingPlatform,
  // Online Courses
  connectOnlineCourses,
  getOnlineCourseProfiles,
  addOnlineCourse,
  disconnectOnlineCourses,
  // Academic Profiles
  connectAcademicProfile,
  getAcademicProfiles,
  addPublication,
  disconnectAcademicProfile,
  // Portfolio Links
  addPortfolioLink,
  getPortfolioLinks,
  updatePortfolioLink,
  deletePortfolioLink,
  reorderPortfolioLinks,
  // Status
  getBatch4IntegrationsStatus,
} from '../controllers/batch4Integrations.controller';

const router = Router();

// ============================================
// KAGGLE INTEGRATION ROUTES (1.2.8)
// ============================================

router.post('/kaggle/connect', authenticate, connectKaggle);
router.get('/kaggle/profile', authenticate, getKaggleProfile);
router.delete('/kaggle/disconnect', authenticate, disconnectKaggle);

// ============================================
// CODING PLATFORM ROUTES (1.2.9)
// ============================================

router.post('/coding/connect', authenticate, connectCodingPlatform);
router.get('/coding/platforms', authenticate, getCodingPlatforms);
router.delete('/coding/:platform/disconnect', authenticate, disconnectCodingPlatform);

// ============================================
// ONLINE COURSES ROUTES (1.2.10)
// ============================================

router.post('/courses/connect', authenticate, connectOnlineCourses);
router.get('/courses/profiles', authenticate, getOnlineCourseProfiles);
router.post('/courses/add', authenticate, addOnlineCourse);
router.delete('/courses/:platform/disconnect', authenticate, disconnectOnlineCourses);

// ============================================
// ACADEMIC PROFILE ROUTES (1.2.11)
// ============================================

router.post('/academic/connect', authenticate, connectAcademicProfile);
router.get('/academic/profiles', authenticate, getAcademicProfiles);
router.post('/academic/publications', authenticate, addPublication);
router.delete('/academic/:platform/disconnect', authenticate, disconnectAcademicProfile);

// ============================================
// CUSTOM PORTFOLIO LINKS ROUTES (1.2.12)
// ============================================

router.get('/portfolio-links', authenticate, getPortfolioLinks);
router.post('/portfolio-links', authenticate, addPortfolioLink);
router.put('/portfolio-links/:linkId', authenticate, updatePortfolioLink);
router.delete('/portfolio-links/:linkId', authenticate, deletePortfolioLink);
router.post('/portfolio-links/reorder', authenticate, reorderPortfolioLinks);

// ============================================
// STATUS ROUTE
// ============================================

router.get('/status', authenticate, getBatch4IntegrationsStatus);

export default router;
