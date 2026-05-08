const mongoose = require('mongoose');

const SellRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  productName: { type: String, required: true },
  condition: { type: String, required: true },
  askingPrice: { type: Number },
  offeredPrice: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'offered', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SellRequest', SellRequestSchema);
