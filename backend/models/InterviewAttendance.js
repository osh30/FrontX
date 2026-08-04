const mongoose = require('mongoose');

const InterviewAttendanceSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attended: { type: Boolean, default: false },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InterviewAttendanceSchema.index({ interviewId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('InterviewAttendance', InterviewAttendanceSchema);
