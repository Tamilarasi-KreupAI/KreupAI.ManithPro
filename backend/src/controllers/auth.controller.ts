import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, phone, bio, skills, location } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CANDIDATE',
        phone,
        bio,
        skills: skills || [],
        location,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        bio: true,
        skills: true,
        location: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check approval status for recruiters
    if (user.role === 'RECRUITER' && user.approvalStatus === 'PENDING') {
      res.status(403).json({
        error: 'Your recruiter account is pending approval. Please wait for admin approval.',
        approvalStatus: 'PENDING'
      });
      return;
    }

    if (user.role === 'RECRUITER' && user.approvalStatus === 'REJECTED') {
      res.status(403).json({
        error: 'Your recruiter account has been rejected.',
        approvalStatus: 'REJECTED',
        rejectionReason: user.rejectionReason || 'No reason provided'
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const registerRecruiter = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      companyName,
      companyWebsite,
      companyEmail
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !companyName || !companyEmail) {
      res.status(400).json({
        error: 'Missing required fields. Please provide email, password, firstName, lastName, companyName, and companyEmail.'
      });
      return;
    }

    // Validate company email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyEmail)) {
      res.status(400).json({ error: 'Invalid company email format' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with RECRUITER role and PENDING approval status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'RECRUITER',
        phone,
        location,
        companyName,
        companyWebsite,
        companyEmail,
        approvalStatus: 'PENDING',
        approvalRequestedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        location: true,
        companyName: true,
        companyWebsite: true,
        companyEmail: true,
        approvalStatus: true,
        approvalRequestedAt: true,
        createdAt: true,
      },
    });

    // Notify admins about new recruiter registration (optional - could send email)
    // For now, just log it
    console.log(`New recruiter registration pending approval: ${user.email} from ${user.companyName}`);

    res.status(201).json({
      message: 'Recruiter registration submitted successfully. Your account is pending admin approval.',
      user,
    });
  } catch (error) {
    console.error('Recruiter registration error:', error);
    res.status(500).json({ error: 'Failed to register recruiter' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        bio: true,
        skills: true,
        experience: true,
        education: true,
        location: true,
        linkedIn: true,
        portfolio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
