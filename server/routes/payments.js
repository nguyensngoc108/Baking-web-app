import express from 'express';
import { getPaymentByOrder, updatePaymentStatus } from '../controllers/paymentsController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/payments/:orderId  (Admin only)
router.get('/:orderId', verifyAdmin, getPaymentByOrder);

// PUT /api/payments/:id/status  (Admin only)
router.put('/:id/status', verifyAdmin, updatePaymentStatus);

export default router;
