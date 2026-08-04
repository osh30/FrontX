const mongoose = require('mongoose');

const SessionAttendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attended: { type: Boolean, default: false },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SessionAttendanceSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('SessionAttendance', SessionAttendanceSchema);
