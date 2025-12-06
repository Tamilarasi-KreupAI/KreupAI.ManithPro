import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Profile
  getCandidateProfile,
  getCandidateProfileById,
  updateCandidateProfile,
  getProfileCompleteness,
  // Work Experience
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getWorkExperienceTimeline,
  // Education
  addEducation,
  updateEducation,
  deleteEducation,
  // Certification
  addCertification,
  updateCertification,
  deleteCertification,
  // Skills
  addSkill,
  updateSkill,
  deleteSkill,
  bulkAddSkills,
  getSkillsMatrix,
  endorseSkill,
  // Projects
  addProject,
  updateProject,
  deleteProject,
  getPortfolio,
  reorderProjects,
} from '../controllers/candidateProfile.controller';

const router = Router();

// ============================================
// PROFILE ROUTES
// ============================================

// Get current user's candidate profile (create if doesn't exist)
router.get('/', authenticate, getCandidateProfile);

// Get candidate profile by user ID (public view)
router.get('/user/:userId', authenticate, getCandidateProfileById);

// Update profile basic information
router.put('/', authenticate, updateCandidateProfile);

// Get profile completeness score and suggestions
router.get('/completeness', authenticate, getProfileCompleteness);

// ============================================
// WORK EXPERIENCE ROUTES (1.1.3 - Experience Timeline)
// ============================================

// Get work experience timeline
router.get('/experiences/timeline', authenticate, getWorkExperienceTimeline);

// Add new work experience
router.post('/experiences', authenticate, addWorkExperience);

// Update work experience
router.put('/experiences/:id', authenticate, updateWorkExperience);

// Delete work experience
router.delete('/experiences/:id', authenticate, deleteWorkExperience);

// ============================================
// EDUCATION ROUTES (1.1.4 - Education Hub)
// ============================================

// Add new education
router.post('/educations', authenticate, addEducation);

// Update education
router.put('/educations/:id', authenticate, updateEducation);

// Delete education
router.delete('/educations/:id', authenticate, deleteEducation);

// ============================================
// CERTIFICATION ROUTES (1.1.4 - Certifications Hub)
// ============================================

// Add new certification
router.post('/certifications', authenticate, addCertification);

// Update certification
router.put('/certifications/:id', authenticate, updateCertification);

// Delete certification
router.delete('/certifications/:id', authenticate, deleteCertification);

// ============================================
// SKILLS ROUTES (1.1.2 - Dynamic Skills Matrix)
// ============================================

// Get skills matrix (grouped by category)
router.get('/skills/matrix', authenticate, getSkillsMatrix);

// Add new skill
router.post('/skills', authenticate, addSkill);

// Bulk add skills
router.post('/skills/bulk', authenticate, bulkAddSkills);

// Update skill
router.put('/skills/:id', authenticate, updateSkill);

// Delete skill
router.delete('/skills/:id', authenticate, deleteSkill);

// Endorse a skill (for other users to endorse)
router.post('/skills/:skillId/endorse', authenticate, endorseSkill);

// ============================================
// PROJECT PORTFOLIO ROUTES (1.1.5 - Project Portfolio)
// ============================================

// Get portfolio with summary
router.get('/projects/portfolio', authenticate, getPortfolio);

// Add new project
router.post('/projects', authenticate, addProject);

// Update project
router.put('/projects/:id', authenticate, updateProject);

// Delete project
router.delete('/projects/:id', authenticate, deleteProject);

// Reorder projects
router.put('/projects/reorder', authenticate, reorderProjects);

export default router;
