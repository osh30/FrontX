const mongoose = require('mongoose');

const MeetingSettingSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true },
    waitingRoomEnabled: { type: Boolean, default: true },
    allowChat: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: true },
    recordMeeting: { type: Boolean, default: false },
    muteOnJoin: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 50 },
    roomLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MeetingSetting', MeetingSettingSchema);
