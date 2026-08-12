const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  topic: { type: String, default: '' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['not-applicable', 'pending', 'completed', 'missed', 'upcoming'], default: 'pending' },
  notePdfUrl: { type: String, default: null },
  noteUploadedAt: { type: Date, default: null },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  publishedNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassNote', default: null },
  missedAt: { type: Date, default: null },
  reminderSent: { type: Boolean, default: false },
  notificationSent: { type: Boolean, default: false },
  geminiVerification: {
    matched: { type: Boolean, default: false },
    confidence: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    verifiedAt: { type: Date, default: null }
  }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
  credit: { type: Number, required: true, enum: [1.0, 3.0] },
  addedAt: { type: Date, default: Date.now },
  outlinePdfUrl: { type: String, default: null },
  weeks: [weekSchema],
  outlineUploaded: { type: Boolean, default: false },
  weeksGenerated: { type: Boolean, default: false }
}, { _id: true });


const studyPlannerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  semester: { type: String, default: 'Spring 2026' },
  semesterStartDate: { type: Date, default: null },
  semesterEndDate: { type: Date, default: null },
  courses: [courseSchema],
  isSetupComplete: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlanner', studyPlannerSchema);
