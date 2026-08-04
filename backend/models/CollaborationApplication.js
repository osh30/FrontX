const mongoose = require('mongoose');

const collaborationApplicationSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationPost',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motivation: {
    type: String,
    required: true
  },
  relevantSkills: {
    type: String,
    required: true
  },
  githubLink: {
    type: String
  },
  portfolioLink: {
    type: String
  },
  cvUrl: {
    type: String, // This will store the base64 string of the PDF
    required: true
  },
  weeklyAvailability: {
    type: String,
    enum: ['5 Hours', '10 Hours', '15 Hours', '20+ Hours'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('CollaborationApplication', collaborationApplicationSchema);
