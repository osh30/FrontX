const mongoose = require('mongoose');

const conversationLabelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  label: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ConversationLabel', conversationLabelSchema);
