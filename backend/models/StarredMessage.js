const mongoose = require('mongoose');

const starredMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StarredMessage', starredMessageSchema);
