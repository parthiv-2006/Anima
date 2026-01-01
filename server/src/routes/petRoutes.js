import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { applyDecay, getPet, updatePet } from '../controllers/petController.js';

const router = Router();

router.get('/', auth, getPet);
router.post('/update', auth, updatePet);
router.post('/decay', auth, applyDecay);

export default router;
