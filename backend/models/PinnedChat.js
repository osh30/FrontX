const mongoose = require('mongoose');

const pinnedChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PinnedChat', pinnedChatSchema);
