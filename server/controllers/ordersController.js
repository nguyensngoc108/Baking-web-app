import crypto from 'crypto';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cake from '../models/Cake.js';
import PackagingOption from '../models/PackagingOption.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import getStripe from '../utils/stripeClient.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

// Create order from cart (public) with order items - supports both logged-in and guest users
export const createOrder = async (req, res) => {
    try {
        const { address: bodyAddress, items, deliveryDate, note, guestEmail, guestPhone, paymentMethod, stripePaymentMethodId } = req.body

        if (!paymentMethod || !['stripe', 'cash_on_delivery'].includes(paymentMethod)) {
            return res.status(400).json({ message: "paymentMethod must be 'stripe' or 'cash_on_delivery'" })
        }
        if (paymentMethod === 'stripe' && !stripePaymentMethodId) {
            return res.status(400).json({ message: 'stripePaymentMethodId is required for card payments' })
        }
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

        // 1. Charge Stripe first — before any DB writes so a DB failure
        //    can't leave an uncharged order. If Stripe succeeds but DB
        //    fails below, the stripePaymentIntentId is logged for reconciliation.
        let stripePaymentIntentId = null
        let stripeReceiptUrl = null
        if (paymentMethod === 'stripe') {
            try {
                const intent = await getStripe().paymentIntents.create({
                    amount: Math.round(totalPrice * 100),
                    currency: 'nzd',
                    payment_method: stripePaymentMethodId,
                    confirm: true,
                    description: 'S2UGAR Order',
                    automatic_payment_methods: {
                        enabled: true,
                        allow_redirects: 'never',
                    },
                })
                stripePaymentIntentId = intent.id
                stripeReceiptUrl = intent.charges?.data?.[0]?.receipt_url || null
            } catch (stripeError) {
                console.error('[Stripe] Payment failed:', stripeError.message)
                return res.status(402).json({ message: stripeError.message || 'Payment processing failed' })
            }
        }

        // 2. Save Order first so we have an _id for OrderItems
        const orderData = {
            address: orderAddress,
            items: [],
            totalPrice,
            deliveryDate,
            note,
            paymentMethod,
            paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'unpaid',
        }
        if (userId) {
            orderData.userId = userId
        } else {
            orderData.guestEmail = orderEmail
            orderData.guestPhone = orderPhone
        }

        const order = new Order(orderData)
        await order.save()

        // 3. Insert OrderItems with the real orderId (schema requires it)
        const orderItems = await OrderItem.insertMany(
            orderItemsData.map(item => ({ ...item, orderId: order._id }))
        )

        // 4. Link items and payment to Order in one final save
        const paymentDoc = new Payment({
            orderId: order._id,
            method: paymentMethod,
            status: paymentMethod === 'stripe' ? 'completed' : 'pending',
            amountCents: Math.round(totalPrice * 100),
            currency: 'NZD',
            stripePaymentIntentId,
            stripeReceiptUrl,
        })
        await paymentDoc.save()

        order.items = orderItems.map(item => item._id)
        order.payment = paymentDoc._id
        await order.save()

        // 5. Clear server-side cart for logged-in users
        if (userId) {
            await Cart.findOneAndDelete({ user: userId })
        }

        // 6. Send confirmation email — failure must not affect the order response
        const deliveryDateFormatted = new Date(deliveryDate).toLocaleDateString('en-NZ', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        sendOrderConfirmation({
            customerName: userId ? `${user.firstName}` : '',
            customerEmail: orderEmail,
            orderId: order._id,
            totalPrice,
            deliveryDate: deliveryDateFormatted,
            items: orderItemsData,
        }).catch(err => console.error('[Email] Order confirmation failed:', err.message));

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
