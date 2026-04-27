import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cake from '../models/Cake.js';
// Create order from cart (public) with order items
export const createOrder = async (req, res) => {
    try {
        const { address, items, deliveryDate, note } = req.body
        const userId = req.user._id
        
        const cakeIds = items.map(item => item.cakeId)
        const cakes = await Cake.find({ _id: { $in: cakeIds } })

        // map cake prices from DB
        const orderItemsData = items.map(item => {
            const cake = cakes.find(c => c._id.toString() === item.cakeId)
            if (!cake) throw new Error(`Cake not found: ${item.cakeId}`)
            if (!cake.available) throw new Error(`Cake not available: ${cake.name}`)
            
            return {
                cakeId: item.cakeId,
                name: cake.name,          
                price: cake.price,         
                quantity: item.quantity,
                note: item.note
            }
        })

        // calculate total from DB prices, not client
        const totalPrice = orderItemsData.reduce((sum, item) => {
            return sum + (item.price * item.quantity)
        }, 0)

        const orderItems = await OrderItem.insertMany(
            orderItemsData.map(item => ({ ...item, orderId: null }))
        )

        const order = new Order({
            userId,
            address,
            items: orderItems.map(item => item._id),
            totalPrice,
            deliveryDate,
            note
        })

        await order.save()

        await OrderItem.updateMany(
            { _id: { $in: orderItems.map(item => item._id) } },
            { orderId: order._id }
        )


        await Cart.findOneAndDelete({ user: userId })

        res.status(201).json(
          { message: 'Order created successfully', data: order }
        )

    } catch (error) {
        console.error('Error creating order:', error)
        res.status(400).json({ message: error.message })
    }
}
    

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order (Admin only)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order (Admin only)
export const updateOrder = async (req, res) => {
  try {
    console.log('Updating order:', req.params.id);
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order (Admin only)
export const deleteOrder = async (req, res) => {
  try {
    console.log('Deleting order:', req.params.id);
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
