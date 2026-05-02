import Cart from '../models/Cart.js';
import Cake from '../models/Cake.js';


export const addToCart = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { cakeId, quantity, cartId } = req.body;
        
        // Use userId for logged-in users, sessionId for guest users
        const searchCriteria = userId ? { userId } : { sessionId: cartId };
        
        let cart = await Cart.findOne(searchCriteria);
        
        if (!cart) {
            const cartData = { items: [] };
            if (userId) {
                cartData.userId = userId;
            } else {
                cartData.sessionId = cartId;
            }
            cart = new Cart(cartData);
        }
        
        const existingItemIndex = cart.items.findIndex(item => item.cakeId.toString() === cakeId);
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            const cake = await Cake.find({ _id: { $in: [cakeId] } });
            if (!cake || cake.length === 0) {
                return res.status(404).json({ message: 'Cake not found' });
            }
            cart.items.push({ cakeId, quantity });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId = req.user?._id;
        
        // Search by userId if logged in, otherwise by sessionId
        const searchCriteria = userId ? { userId } : { sessionId: cartId };
        const cart = await Cart
            .findOne(searchCriteria)
            .populate('items.cakeId', 'name price');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
   
export const updateCartItem = async (req, res) => {
    try {
        const { cartId, cakeId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?._id;
        
        // Search by userId if logged in, otherwise by sessionId
        const searchCriteria = userId ? { userId } : { sessionId: cartId };
        const cart = await Cart.findOne(searchCriteria);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        const itemIndex = cart.items.findIndex(item => item.cakeId.toString() === cakeId);
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { cartId, cakeId } = req.params;
        const userId = req.user?._id;
        
        // Search by userId if logged in, otherwise by sessionId
        const searchCriteria = userId ? { userId } : { sessionId: cartId };
        const cart = await Cart
            .findOneAndUpdate(
                searchCriteria,
                { $pull: { items: { cakeId } } },
                { new: true }
            );
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const { cartId } = req.params;  
        const userId = req.user?._id;
        
        // Search by userId if logged in, otherwise by sessionId
        const searchCriteria = userId ? { userId } : { sessionId: cartId };
        const cart = await Cart.findOneAndUpdate(
            searchCriteria,
            { $set: { items: [] } },
            { new: true }
        );
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


