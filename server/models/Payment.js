import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  method: {
    type: String,
    enum: ['square', 'cash_on_delivery'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  amountCents: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'NZD',
  },
  squarePaymentId: {
    type: String,
    default: null,
  },
  squareReceiptUrl: {
    type: String,
    default: null,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
