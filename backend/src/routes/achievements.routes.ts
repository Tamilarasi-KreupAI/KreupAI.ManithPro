import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  seedAchievementDefinitions,
  getAchievementDefinitions,
  getUserAchievements,
  checkAndUpdateAchievements,
  getAchievementLeaderboard,
  getAchievementStats,
} from '../controllers/achievements.controller';

const router = Router();

// ============================================
// ACHIEVEMENT DEFINITION ROUTES
// ============================================

// Seed achievement definitions (admin only in production)
router.post('/definitions/seed', authenticate, seedAchievementDefinitions);

// Get all achievement definitions
router.get('/definitions', authenticate, getAchievementDefinitions);

// ============================================
// USER ACHIEVEMENT ROUTES
// ============================================

// Get current user's achievements
router.get('/me', authenticate, getUserAchievements);

// Check and update achievements
router.post('/check', authenticate, checkAndUpdateAchievements);

// Get achievement statistics
router.get('/stats', authenticate, getAchievementStats);

// Get achievement leaderboard
router.get('/leaderboard', authenticate, getAchievementLeaderboard);

export default router;
