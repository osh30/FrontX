const mongoose = require('mongoose');

const resourceRatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' }
}, { timestamps: true });

resourceRatingSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('ResourceRating', resourceRatingSchema);
