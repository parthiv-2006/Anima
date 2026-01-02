import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getShopItems, 
  purchaseItem, 
  useItem, 
  setBackground, 
  getInventory 
} from '../controllers/shopController.js';

const router = Router();

// All routes require authentication
router.use(auth);

// Shop routes
router.get('/items', getShopItems);
router.post('/purchase', purchaseItem);
router.post('/use', useItem);
router.post('/background', setBackground);
router.get('/inventory', getInventory);

export default router;
