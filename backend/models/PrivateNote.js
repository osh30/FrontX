const mongoose = require('mongoose');

const privateNoteSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('PrivateNote', privateNoteSchema);
