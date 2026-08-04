const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    title: { type: String, required: true, trim: true },
    meetingType: {
      type: String,
      enum: ['general', 'session', 'interview'],
      default: 'general',
    },
    duration: { type: Number, default: 60 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled', 'expired'],
      default: 'scheduled',
    },
    linkedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    settings: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingSetting', default: null },
    recording: {
      isRecording: { type: Boolean, default: false },
      egressId: { type: String, default: '' },
      url: { type: String, default: '' },
      startedAt: { type: Date, default: null },
      endedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', MeetingSchema);
