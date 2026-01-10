import { Router } from 'express';
import { login, register, updatePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-password', auth, updatePassword);

export default router;
