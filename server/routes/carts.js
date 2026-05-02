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
router.post('/', addToCart);

// GET /api/cart/:userId (Get cart)
router.get('/:userId', getCart);

// PUT /api/cart/:userId/:cakeId (Update cart item)
router.put('/:userId/:cakeId', updateCartItem);

// DELETE /api/cart/:userId/:cakeId (Remove from cart)
router.delete('/:userId/:cakeId', removeFromCart);

export default router;

