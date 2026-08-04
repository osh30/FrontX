const mongoose = require('mongoose');

const mentorshipGoalSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  deadline: Date,
  status: { type: String, enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress' }
}, { timestamps: true });

module.exports = mongoose.model('MentorshipGoal', mentorshipGoalSchema);
