const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['holiday', 'break', 'exam', 'other'], default: 'holiday' }
}, { _id: true });

const teachingWeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  label: { type: String, default: '' }
}, { _id: true });

const academicCalendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicPeriod: { type: String, required: true, trim: true }, // e.g. "Spring 2026", "January 2026", "6th Semester"
  title: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  holidays: [holidaySchema],
  teachingWeeks: [teachingWeekSchema],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Index for fast lookup by user + academicPeriod
academicCalendarSchema.index({ userId: 1, academicPeriod: 1 });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
