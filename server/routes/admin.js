import express from 'express';
import { 
  createSignatureCake, 
  updateSignatureCake, 
  createCake, 
  updateCake, 
  deleteCake,
  addIngredient,
  deleteIngredient,
  getIngredients,
  getCakesAndIngredients,
  createPackagingOption,
  getPackagingOptions,
  updatePackagingOption,
  deletePackagingOption
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/cakes-ingredients', verifyAdmin, getCakesAndIngredients);

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

// Packaging Options Routes
// GET /api/admin/packaging-options
router.get('/packaging-options', verifyAdmin, getPackagingOptions);

// POST /api/admin/packaging-options (Admin only)
router.post('/packaging-options', verifyAdmin, createPackagingOption);

// PUT /api/admin/packaging-options/:id (Admin only)
router.put('/packaging-options/:id', verifyAdmin, updatePackagingOption);

// DELETE /api/admin/packaging-options/:id (Admin only)
router.delete('/packaging-options/:id', verifyAdmin, deletePackagingOption);


export default router;
