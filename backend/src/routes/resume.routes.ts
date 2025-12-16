import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getResumes,
  uploadResume,
  setDefaultResume,
  deleteResume,
  downloadResume,
  upload,
} from '../controllers/resume.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes for the authenticated user
 * @access  Private
 */
router.get('/', getResumes);

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload a new resume
 * @access  Private
 */
router.post('/upload', upload.single('resume'), uploadResume);

/**
 * @route   PUT /api/resumes/:id/set-default
 * @desc    Set a resume as default
 * @access  Private
 */
router.put('/:id/set-default', setDefaultResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete('/:id', deleteResume);

/**
 * @route   GET /api/resumes/:id/download
 * @desc    Download a resume
 * @access  Private
 */
router.get('/:id/download', downloadResume);

export default router;
