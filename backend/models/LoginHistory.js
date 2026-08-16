const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['login', 'logout'], required: true },
  role: { type: String, enum: ['student', 'alumni', 'recruiter', 'admin'], required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  device: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  success: { type: Boolean, default: true },
  failReason: { type: String, default: '' }
}, { timestamps: true });

loginHistorySchema.index({ createdAt: -1 });
loginHistorySchema.index({ user: 1, createdAt: -1 });
loginHistorySchema.index({ role: 1, createdAt: -1 });
loginHistorySchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
