const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  type: { type: String, enum: ['buy', 'rent'] },
  rentalDuration: Number,
  image: String
});

const OrderTimelineSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String
});

const OrderSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [OrderItemSchema],
  paymentMethod: String,
  shippingAddress: String,
  trackingNumber: String,
  internalNotes: String,
  timeline: [OrderTimelineSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

OrderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Order', OrderSchema);
