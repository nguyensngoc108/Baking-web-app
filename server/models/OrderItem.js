import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    cakeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cake',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    note:{
        type: String,
    }
});

export default mongoose.model('OrderItem', OrderItemSchema);