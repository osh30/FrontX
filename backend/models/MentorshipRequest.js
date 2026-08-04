const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentDepartment: { type: String, default: '' },
  studentSession: { type: String, default: '' },
  requestType: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  time: { type: String, default: 'Anytime' },
}, { timestamps: true });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
