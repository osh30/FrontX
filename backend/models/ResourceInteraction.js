const mongoose = require('mongoose');

const resourceInteractionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  viewedAt: { type: Date, default: null },
  downloadedAt: { type: Date, default: null },
  readingProgress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

resourceInteractionSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('ResourceInteraction', resourceInteractionSchema);
