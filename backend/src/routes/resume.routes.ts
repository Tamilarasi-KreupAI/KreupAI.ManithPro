import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getResumes,
  uploadResume,
  setDefaultResume,
  deleteResume,
  downloadResume,
  upload,
  validateFileSignature,
  handleUploadError,
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
 *
 * Middleware chain:
 *   1. upload.single('resume')   — multer: size-limit + MIME-type filter
 *   2. validateFileSignature     — magic-byte check (400 on bad content)
 *   3. uploadResume              — controller: DB record + text extraction
 *   4. handleUploadError         — error handler: 413/400/500 mapping
 */
router.post(
  '/upload',
  upload.single('resume'),
  validateFileSignature(['pdf', 'doc', 'docx']),
  uploadResume,
  handleUploadError,
);

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
