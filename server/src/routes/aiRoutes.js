import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { petChat, generateNarratives } from '../controllers/aiController.js';

const router = Router();

router.use(auth);
router.post('/chat', petChat);
router.post('/narrate', generateNarratives);

export default router;
