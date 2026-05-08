const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['controller', 'game', 'accessory', 'vr', 'console']
  },
  price: {
    type: Number,
    required: true
  },
  rentalPrice: {
    type: Number
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
