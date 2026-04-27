import express from 'express';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartsController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

// POST /api/cart (Add to cart)
router.post('/', verifyAdmin, addToCart);

// GET /api/cart/:userId (Get cart)
router.get('/:userId', verifyAdmin, getCart);

// PUT /api/cart/:userId/:cakeId (Update cart item)
router.put('/:userId/:cakeId', verifyAdmin, updateCartItem);

// DELETE /api/cart/:userId/:cakeId (Remove from cart)
router.delete('/:userId/:cakeId', verifyAdmin, removeFromCart);

export default router;

