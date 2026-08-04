const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
  lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessageTime: Date,
  lastMessageType: { type: String, default: 'text' },
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
