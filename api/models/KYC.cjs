const mongoose = require('mongoose');

const AgentReportSchema = new mongoose.Schema({
  agentName: String,
  status: { type: String, enum: ['PASS', 'FAIL', 'WARNING', 'WARN'] },
  message: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
});

const KYCSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  phone: String,
  secondaryPhone: String,
  drivingLicenseNumber: String,
  secondaryIdType: String,
  secondaryIdNumber: String,
  secondaryIdFrontUrl: String,
  secondaryIdBackUrl: String,
  address: String,
  idFrontUrl: String,
  idBackUrl: String,
  selfieUrl: String,
  selfieVideoUrl: String,
  livenessCheck: { type: String, enum: ['PASSED', 'FAILED', 'PENDING'], default: 'PENDING' },
  trustScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW', 'REVERIFICATION_REQUESTED'], 
    default: 'PENDING' 
  },
  adminNotes: String,
  rejectionReason: String,
  resubmissionAllowed: { type: Boolean, default: true },
  verifiedBy: String,
  verifiedAt: Date,
  addressRequiredForDelivery: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  agentReports: [AgentReportSchema],
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

KYCSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

KYCSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('KYC', KYCSchema);
