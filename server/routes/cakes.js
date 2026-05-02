import express from 'express';
import { 
  getSignatureCake, 
  getAllCakes, 
  getCakeById, 

} from '../controllers/cakesController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/cakes/signature
router.get('/signature', getSignatureCake);

// GET /api/cakes
router.get('/', getAllCakes);

// GET /api/cakes/:id
router.get('/:id', getCakeById);



export default router;
