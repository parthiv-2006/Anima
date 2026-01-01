import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { dailyReset } from '../middleware/dailyReset.js';
import { addHabit, completeHabit, deleteHabit, listHabits, resetHabit } from '../controllers/habitController.js';

const router = Router();

// Apply daily reset check to all habit routes
router.use(auth, dailyReset);

router.get('/', listHabits);
router.post('/', addHabit);
router.post('/:id/complete', completeHabit);
router.post('/:id/reset', resetHabit);
router.delete('/:id', deleteHabit);

export default router;
