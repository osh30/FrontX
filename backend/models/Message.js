const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: { type: String, enum: ['text', 'image', 'file', 'link'], default: 'text' },
  content: { type: String, default: '' },
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  fileSize: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  editHistory: [{ content: String, editedAt: Date }],
  isDeletedForEveryone: { type: Boolean, default: false },
  deletedForEveryoneAt: Date,
  isDeletedForSender: { type: Boolean, default: false },
  isDeletedForReceiver: { type: Boolean, default: false },
  reactions: [{
    emoji: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
