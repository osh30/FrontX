const mongoose = require('mongoose');

const classNoteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  department: { type: String, default: '' },
  course: { type: String, default: '' },
  semester: { type: String, default: '' },
  weekOrTopic: { type: String, default: '' },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

classNoteSchema.index({ title: 'text', subject: 'text', course: 'text', description: 'text' });

module.exports = mongoose.model('ClassNote', classNoteSchema);
