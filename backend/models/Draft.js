const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  category: { type: String, default: 'General Discussion' },
  tags: [{ type: String }],
  isAnonymous: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  imageUrl: { type: String, default: null },
  documentUrl: { type: String, default: null },
  documentName: { type: String, default: null },
  pollOptions: [{ type: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

draftSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Draft', draftSchema);
