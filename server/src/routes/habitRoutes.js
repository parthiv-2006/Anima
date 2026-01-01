import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { addHabit, completeHabit, listHabits } from '../controllers/habitController.js';

const router = Router();

router.get('/', auth, listHabits);
router.post('/', auth, addHabit);
router.post('/:id/complete', auth, completeHabit);

export default router;
