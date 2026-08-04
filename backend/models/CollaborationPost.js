const mongoose = require('mongoose');

const collaborationPostSchema = new mongoose.Schema({
  researchId: {
    type: String,
    unique: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Research Paper',
      'Survey Research',
      'Review Paper',
      'Industrial Research',
      'Capstone Project',
      'Conference Paper',
      'Journal Publication',
      'Other'
    ],
    required: true
  },
  domain: {
    type: String,
    enum: [
      'Artificial Intelligence',
      'Machine Learning',
      'Cyber Security',
      'Data Science',
      'IoT',
      'Web Development',
      'Healthcare Technology',
      'Software Engineering',
      'Other'
    ],
    required: true
  },
  overview: {
    type: String,
    required: true
  },
  whyItMatters: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    default: []
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner Friendly', 'Intermediate', 'Advanced'],
    required: true
  },
  studentCount: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  outcomes: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('CollaborationPost', collaborationPostSchema);
