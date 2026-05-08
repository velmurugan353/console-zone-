const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  photoUrl: {
    type: String // Path to the uploaded photo
  },
  documentUrl: {
    type: String // Path to the uploaded form/document
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'completed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
