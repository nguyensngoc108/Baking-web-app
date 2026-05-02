import mongoose from 'mongoose';

const cakeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  category: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
  servings: Number,
  isSignature: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Cake', cakeSchema);
