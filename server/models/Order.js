import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  guestEmail: {
    type: String,
    required: false,
  },
  guestPhone: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  items: [
    { type: mongoose.Schema.Types.ObjectId, 
      ref: 'OrderItem' 
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  note:{
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['square', 'cash_on_delivery'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'refunded'],
    default: 'unpaid',
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

export default mongoose.model('Order', orderSchema);
