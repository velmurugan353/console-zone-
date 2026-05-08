const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  consoleType: { type: String, required: true },
  issue: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'received', 'diagnosing', 'repairing', 'ready', 'delivered'],
    default: 'pending'
  },
  cost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Repair', RepairSchema);
