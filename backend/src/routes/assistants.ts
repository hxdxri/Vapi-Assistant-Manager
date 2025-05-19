import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all assistants for the authenticated user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all assistants from Vapi without filtering
    const vapiResponse = await axios.get('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Return all assistants without filtering
    res.json(vapiResponse.data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new assistant
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('availability').isObject().withMessage('Invalid availability format'),
    body('voice.provider').notEmpty().withMessage('Voice provider is required'),
    body('voice.language').notEmpty().withMessage('Language code is required'),
    body('initial_message').notEmpty().withMessage('Initial message is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        availability,
        voice,
        initial_message,
        webhook,
        transcriber,
        recording_enabled,
      } = req.body;

      // Create assistant in Vapi.ai with metadata.businessId
      const vapiResponse = await axios.post(
        'https://api.vapi.ai/assistant',
        {
          name,
          availability,
          voice,
          initial_message,
          webhook,
          transcriber,
          recording_enabled,
          metadata: { businessId: req.user!.id },
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.status(201).json(vapiResponse.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update an existing assistant
router.patch(
  '/:id',
  auth,
  [
    body('name').optional(),
    body('availability').optional().isObject(),
    body('voice').optional().isObject(),
    body('initial_message').optional(),
    body('webhook').optional(),
    body('transcriber').optional(),
    body('recording_enabled').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        name,
        availability,
        voice,
        initial_message,
        webhook,
        transcriber,
        recording_enabled,
      } = req.body;

      // Update assistant in Vapi.ai, always set metadata.businessId
      const vapiPatch = await axios.patch(
        `https://api.vapi.ai/assistant/${id}`,
        {
          name,
          availability,
          voice,
          initial_message,
          webhook,
          transcriber,
          recording_enabled,
          metadata: { businessId: req.user!.id },
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.json(vapiPatch.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get a specific assistant
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch directly from Vapi
    const vapiResponse = await axios.get(`https://api.vapi.ai/assistant/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!vapiResponse.data) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json(vapiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 