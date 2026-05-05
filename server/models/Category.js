import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '', trim: true },
  color: { type: String, default: '#6366f1' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Category', categorySchema);
