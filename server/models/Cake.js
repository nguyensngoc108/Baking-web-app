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
    required: true,
  },
  category: {
    type: String,
    enum: ['Chocolate', 'Vanilla', 'Fruit', 'Special'],
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CakeIngredient',
      required: true
    },
    totalCost: {
      type: Number,
      required: true
    },
    measure: {
      type: String,
      required: true
    },
    each: {
      type: Number,
      required: true
    },
    totalEach: {
      type: Number,
      required: true
    }
  }],
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
