const mongoose = require('mongoose');

const followUpReminderSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  title: { type: String, required: true },
  reminderDate: { type: String, required: true },
  reminderTime: { type: String, default: '12:00' },
  isNotified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('FollowUpReminder', followUpReminderSchema);
