import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Register new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('businessName').optional(),
    body('fullName').optional(),
    body('phoneNumber').optional(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, businessName, fullName, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          businessName: businessName || null,
          fullName: fullName || null,
          phoneNumber: phoneNumber || null,
        },
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        businessName: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        logoUrl: true,
        businessType: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.patch(
  '/profile',
  auth,
  [
    body('businessName').optional(),
    body('fullName').optional(),
    body('phoneNumber').optional(),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('zipCode').optional(),
    body('country').optional(),
    body('logoUrl').optional(),
    body('businessType').optional(),
    body('theme').optional(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        businessName,
        fullName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        logoUrl,
        businessType,
        theme,
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          businessName,
          fullName,
          phoneNumber,
          address,
          city,
          state,
          zipCode,
          country,
          logoUrl,
          businessType,
          theme,
        },
        select: {
          id: true,
          email: true,
          businessName: true,
          fullName: true,
          phoneNumber: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          logoUrl: true,
          businessType: true,
          theme: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Test token endpoint
router.get('/test-token', async (req: Request, res: Response) => {
  try {
    // Generate a test token
    const testUser = { id: 'test-user-id', email: 'test@example.com' };
    const token = jwt.sign(testUser, process.env.JWT_SECRET!, { expiresIn: '1h' });
    
    // Verify the token immediately to ensure it works
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
      
      res.json({
        message: 'JWT token generation and verification successful',
        token,
        decoded,
        jwt_secret_length: process.env.JWT_SECRET?.length || 0
      });
    } catch (verifyError) {
      res.status(500).json({
        error: 'JWT verification failed immediately after generation',
        details: verifyError
      });
    }
  } catch (error) {
    console.error('Test token error:', error);
    res.status(500).json({ error: 'Server error during token test' });
  }
});

export default router; 