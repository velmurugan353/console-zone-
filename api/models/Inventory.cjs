const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: String,
  technician: String,
  notes: String,
  cost: Number
});

const RentalHistorySchema = new mongoose.Schema({
  rentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  customer: String,
  startDate: Date,
  endDate: Date,
  revenue: Number
});

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  consoleId: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Rented', 'Maintenance', 'Retired', 'available', 'rented', 'maintenance', 'damaged'], 
    default: 'Available' 
  },
  health: { type: Number, default: 100 },
  lastService: { type: Date, default: Date.now },
  location: { type: String, default: 'Secure_Bay_Alpha' },
  serialNumber: { type: String, required: true, unique: true },
  purchaseDate: { type: Date, default: Date.now },
  maintenanceHistory: [MaintenanceRecordSchema],
  rentalHistory: [RentalHistorySchema],
  usageCount: { type: Number, default: 0 },
  basePricePerDay: { type: Number, default: 0 },
  dynamicPricingEnabled: { type: Boolean, default: true },
  image: String,
  purchasePrice: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  kitRequired: [String],
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InventorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

InventorySchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Inventory', InventorySchema);
