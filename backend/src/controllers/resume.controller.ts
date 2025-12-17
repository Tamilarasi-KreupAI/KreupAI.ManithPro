import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const prisma = new PrismaClient();
const unlinkAsync = promisify(fs.unlink);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * Get all resumes for the authenticated user
 */
export const getResumes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: [
        { isDefault: 'desc' },
        { uploadedAt: 'desc' }
      ],
    });

    return res.status(200).json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

/**
 * Upload a new resume
 */
export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;

    // Check if this is the first resume for the user
    const existingResumes = await prisma.resume.findMany({
      where: { userId: req.user.userId },
    });

    const isFirstResume = existingResumes.length === 0;

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        userId: req.user.userId,
        fileName: file.originalname,
        filePath: `/uploads/resumes/${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype,
        isDefault: isFirstResume, // Set as default if it's the first resume
      },
    });

    return res.status(201).json({
      message: 'Resume uploaded successfully',
      resume,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);

    // Clean up uploaded file if database operation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/resumes', req.file.filename);
      try {
        await unlinkAsync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    return res.status(500).json({ error: 'Failed to upload resume' });
  }
};

/**
 * Set a resume as default
 */
export const setDefaultResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify the resume belongs to the user
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Use a transaction to update all resumes
    await prisma.$transaction([
      // Set all user's resumes to non-default
      prisma.resume.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      }),
      // Set the selected resume as default
      prisma.resume.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    return res.status(200).json({ message: 'Default resume updated successfully' });
  } catch (error) {
    console.error('Error setting default resume:', error);
    return res.status(500).json({ error: 'Failed to set default resume' });
  }
};

/**
 * Delete a resume
 */
export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify the resume belongs to the user
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, '../..', resume.filePath);
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.resume.delete({
      where: { id },
    });

    // If the deleted resume was the default, set another resume as default
    if (resume.isDefault) {
      const remainingResumes = await prisma.resume.findMany({
        where: { userId: req.user.userId },
        orderBy: { uploadedAt: 'desc' },
        take: 1,
      });

      if (remainingResumes.length > 0) {
        await prisma.resume.update({
          where: { id: remainingResumes[0].id },
          data: { isDefault: true },
        });
      }
    }

    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return res.status(500).json({ error: 'Failed to delete resume' });
  }
};

/**
 * Download a resume
 */
export const downloadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify the resume belongs to the user
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get the file path
    const filePath = path.join(__dirname, '../..', resume.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send the file
    return res.download(filePath, resume.fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download resume' });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading resume:', error);
    return res.status(500).json({ error: 'Failed to download resume' });
  }
};
