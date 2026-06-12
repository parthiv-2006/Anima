import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { petChat, generateNarratives, agentChat } from '../controllers/aiController.js';

const router = Router();

router.use(auth);
router.post('/chat', petChat);
router.post('/narrate', generateNarratives);
router.post('/agent', agentChat);

export default router;
