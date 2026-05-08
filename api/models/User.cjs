const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  consolezone_id: {
    type: String,
    unique: true,
    sparse: true
  },
  kyc_status: {
    type: String,
    enum: [null, 'PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW', 'REVERIFICATION_REQUESTED'],
    default: null
  },
  kyc_resubmissions: {
    type: Number,
    default: 0
  },
  last_kyc_submission: {
    type: Date
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('User', UserSchema);
