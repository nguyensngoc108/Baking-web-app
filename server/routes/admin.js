import express from 'express';
import { 
  createSignatureCake, 
  updateSignatureCake, 
  createCake, 
  updateCake, 
  deleteCake,
  addIngredient,
  deleteIngredient,
  getIngredients
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/ingredients', verifyAdmin, getIngredients);
// POST /api/admin/signature (Admin only)
router.post('/signature', verifyAdmin, createSignatureCake);

// PUT /api/admin/signature/:id (Admin only)
router.put('/signature/:id', verifyAdmin, updateSignatureCake);

// POST /api/admin/cakes (Admin only)
router.post('/cakes', verifyAdmin, createCake);

// PUT /api/admin/cakes/:id (Admin only)
router.put('/cakes/:id', verifyAdmin, updateCake);

// DELETE /api/admin/cakes/:id (Admin only)
router.delete('/cakes/:id', verifyAdmin, deleteCake);

// POST /api/admin/ingredients (Admin only)
router.post('/ingredients', verifyAdmin, addIngredient);

// DELETE /api/admin/ingredients/:id (Admin only)
router.delete('/ingredients/:id', verifyAdmin, deleteIngredient);

// GET /api/admin/ingredients (Admin only)


export default router;
