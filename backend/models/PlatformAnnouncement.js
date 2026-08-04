const mongoose = require('mongoose');

const platformAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Career', 'Internship', 'Scholarship', 'Competition', 'Event', 'Maintenance', 'General Notice'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    description: {
      type: String,
      required: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    attachment: {
      type: String,
      default: '',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

platformAnnouncementSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('PlatformAnnouncement', platformAnnouncementSchema);
