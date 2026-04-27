import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cake from '../models/Cake.js';
import PackagingOption from '../models/PackagingOption.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

// Create order from cart (public) with order items - supports both logged-in and guest users
export const createOrder = async (req, res) => {
    try {
        const { address: bodyAddress, items, deliveryDate, note, guestEmail, guestPhone } = req.body
        const userId = req.user ? req.user._id : null
        
        let orderAddress, orderEmail, orderPhone
        
        if (userId) {
            // Logged-in user: fetch data from User schema
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            
            // Check if user has required fields
            if (!user.address) {
                return res.status(400).json({ 
                    message: 'Please update your address in your profile before placing an order' 
                })
            }
            if (!user.email) {
                return res.status(400).json({ 
                    message: 'Email is missing from your profile' 
                })
            }
            if (!user.phone) {
                return res.status(400).json({ 
                    message: 'Please add your phone number to your profile before placing an order' 
                })
            }
            
            orderAddress = user.address
            orderEmail = user.email
            orderPhone = user.phone
        } else {
            // Guest user: require email and phone from request
            if (!guestEmail || !guestPhone) {
                return res.status(400).json({ 
                    message: 'For guest checkout, email and phone are required' 
                })
            }
            if (!bodyAddress) {
                return res.status(400).json({ 
                    message: 'Address is required for checkout' 
                })
            }
            
            orderAddress = bodyAddress
            orderEmail = guestEmail
            orderPhone = guestPhone
        }
        
        const cakeIds = items.map(item => item.cakeId)
        const cakes = await Cake.find({ _id: { $in: cakeIds } })

        // map cake prices from DB and handle packaging options
        let totalPrice = 0
        const orderItemsData = await Promise.all(
            items.map(async (item) => {
                const cake = cakes.find(c => c._id.toString() === item.cakeId)
                if (!cake) throw new Error(`Cake not found: ${item.cakeId}`)
                if (!cake.available) throw new Error(`Cake not available: ${cake.name}`)
                
                let packagingPrice = 0
                let packagingOptionId = null
                
                // Validate packaging option if provided
                if (item.packagingOptionId) {
                    const packagingOption = await PackagingOption.findById(item.packagingOptionId)
                    if (!packagingOption) {
                        throw new Error(`Packaging option not found: ${item.packagingOptionId}`)
                    }
                    if (!packagingOption.isActive) {
                        throw new Error(`Packaging option is not available: ${packagingOption.name}`)
                    }
                    packagingPrice = packagingOption.price
                    packagingOptionId = packagingOption._id
                }
                
                const itemTotal = (cake.price * item.quantity) + (packagingPrice * item.quantity)
                totalPrice += itemTotal
                
                return {
                    cakeId: item.cakeId,
                    name: cake.name,          
                    price: cake.price,         
                    quantity: item.quantity,
                    packagingOptionId,
                    packagingPrice,
                    note: item.note
                }
            })
        )

        const orderItems = await OrderItem.insertMany(
            orderItemsData.map(item => ({ ...item, orderId: null }))
        )

        const orderData = {
            address: orderAddress,
            items: orderItems.map(item => item._id),
            totalPrice,
            deliveryDate,
            note
        }
        
        // Add user info or guest info
        if (userId) {
            orderData.userId = userId
        } else {
            orderData.guestEmail = orderEmail
            orderData.guestPhone = orderPhone
        }

        const order = new Order(orderData)
        await order.save()

        await OrderItem.updateMany(
            { _id: { $in: orderItems.map(item => item._id) } },
            { orderId: order._id }
        )

        // Delete cart for logged-in users
        if (userId) {
            await Cart.findOneAndDelete({ user: userId })
        }

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
