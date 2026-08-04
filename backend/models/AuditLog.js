const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'mentorship_request_sent',
      'mentorship_request_accepted',
      'mentorship_request_declined',
      'conversation_auto_created',
      'notification_sent'
    ]
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
