import Cart from '../models/Cart.js';
import Cake from '../models/Cake.js';


export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { cakeId, quantity } = req.body;
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = new Cart({ userId, items: [] });
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
        const { userId } = req.params;
        const cart = await Cart
            .findOne({ userId })
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
        const { userId, cakeId } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId });
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
        const { userId, cakeId } = req.params;
        const cart = await Cart
            .findOneAndUpdate(
                { userId },
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
        const { userId } = req.params;  
        const cart = await Cart.findOneAndUpdate(
            { userId },
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


