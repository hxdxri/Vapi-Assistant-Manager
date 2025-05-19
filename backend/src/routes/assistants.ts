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
    const assistants = await prisma.assistant.findMany({
      where: { userId: req.user!.id },
    });
    res.json(assistants);
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
    body('availabilityJson').isObject().withMessage('Invalid availability format'),
    body('voiceProvider').notEmpty().withMessage('Voice provider is required'),
    body('languageCode').notEmpty().withMessage('Language code is required'),
    body('introMessage').notEmpty().withMessage('Intro message is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        availabilityJson,
        voiceProvider,
        languageCode,
        introMessage,
        webhookUrl,
        transcriptionEnabled,
        recordingEnabled,
      } = req.body;

      // Create assistant in Vapi.ai
      const vapiResponse = await axios.post(
        'https://api.vapi.ai/assistants',
        {
          name,
          availability: availabilityJson,
          voice: {
            provider: voiceProvider,
            language: languageCode,
          },
          initial_message: introMessage,
          webhook_url: webhookUrl,
          transcription_enabled: transcriptionEnabled,
          recording_enabled: recordingEnabled,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Create assistant in our database
      const assistant = await prisma.assistant.create({
        data: {
          userId: req.user!.id,
          vapiAssistantId: vapiResponse.data.id,
          name,
          availabilityJson,
          voiceProvider,
          languageCode,
          introMessage,
          webhookUrl,
          transcriptionEnabled,
          recordingEnabled,
        },
      });

      res.status(201).json(assistant);
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
    body('availabilityJson').optional().isObject(),
    body('voiceProvider').optional(),
    body('languageCode').optional(),
    body('introMessage').optional(),
    body('webhookUrl').optional(),
    body('transcriptionEnabled').optional().isBoolean(),
    body('recordingEnabled').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Get the assistant from our database
      const assistant = await prisma.assistant.findFirst({
        where: {
          id,
          userId: req.user!.id,
        },
      });

      if (!assistant) {
        return res.status(404).json({ error: 'Assistant not found' });
      }

      // Update assistant in Vapi.ai
      await axios.patch(
        `https://api.vapi.ai/assistants/${assistant.vapiAssistantId}`,
        {
          name: updateData.name,
          availability: updateData.availabilityJson,
          voice: updateData.voiceProvider && {
            provider: updateData.voiceProvider,
            language: updateData.languageCode,
          },
          initial_message: updateData.introMessage,
          webhook_url: updateData.webhookUrl,
          transcription_enabled: updateData.transcriptionEnabled,
          recording_enabled: updateData.recordingEnabled,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update assistant in our database
      const updatedAssistant = await prisma.assistant.update({
        where: { id },
        data: updateData,
      });

      res.json(updatedAssistant);
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

    const assistant = await prisma.assistant.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json(assistant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 