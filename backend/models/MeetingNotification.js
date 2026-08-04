const mongoose = require('mongoose');

const MeetingNotificationSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['invite', 'created', 'started', 'ended', 'reminder', 'cancelled'],
      default: 'invite',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MeetingNotification', MeetingNotificationSchema);
