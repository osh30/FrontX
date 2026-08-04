const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['host', 'participant', 'guest'], default: 'participant' },
    status: {
      type: String,
      enum: ['invited', 'joined', 'left', 'rejected'],
      default: 'invited',
    },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
    device: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

ParticipantSchema.index({ meetingId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Participant', ParticipantSchema);
