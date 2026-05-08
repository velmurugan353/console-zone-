const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: String,
  email: String,
  phone: String,
  // Product info
  name: String,
  product: String,
  productId: String,
  slug: String,
  unitId: String,
  image: String,
  available: Number,
  dailyRate: Number,
  deposit: Number,
  specs: [String],
  included: [String],
  condition: { type: String, default: 'Excellent' },
  enabled: { type: Boolean, default: true },
  
  // Booking info
  startDate: { type: Date },
  endDate: { type: Date },
  totalPrice: Number,
  status: { type: String, default: 'pending' },
  paymentId: String,
  returnedAt: Date,
  returnCondition: String,
  repairCost: { type: Number, default: 0 },
  
  // Time slot booking
  pickupSlot: {
    slotId: String,
    label: String,
    startTime: String,
    endTime: String
  },
  returnSlot: {
    slotId: String,
    label: String,
    startTime: String,
    endTime: String
  },
  deliveryMethod: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  
  createdAt: { type: Date, default: Date.now },
  timeline: [{
    status: String,
    timestamp: String,
    note: String
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

RentalSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Rental', RentalSchema);
