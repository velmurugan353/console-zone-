const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  customerId: { type: String },
  customerName: { type: String, default: 'Unknown' },
  customerEmail: { type: String, default: '' },
  customerPhone: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  channels: [{ type: String, enum: ['email', 'sms', 'whatsapp', 'inapp'] }],
  status: { type: String, enum: ['sent', 'failed', 'pending', 'delivered', 'opened'], default: 'sent' },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  rentalId: { type: String },
  trigger: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  deliveryResults: [{
    channel: String,
    status: String,
    messageId: String,
    error: String,
    deliveredAt: Date
  }],
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

NotificationLogSchema.index({ customerId: 1, createdAt: -1 });
NotificationLogSchema.index({ rentalId: 1, createdAt: -1 });
NotificationLogSchema.index({ status: 1 });
NotificationLogSchema.index({ channels: 1 });
NotificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
