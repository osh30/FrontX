const ClassNote = require('../models/ClassNote');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Create new class note
// @route   POST /api/notes
// @access  Private (Students only)
const createNote = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: "Only students can publish class notes." });
    }

    const { title, subject, description, department, course, semester, weekOrTopic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    const result = await uploadToCloudinary(req.file, 'frontx/notes');
    
    const newNote = new ClassNote({
      studentId: req.user.id,
      title,
      subject,
      description,
      pdfUrl: result.secure_url,
      department: department || '',
      course: course || '',
      semester: semester || '',
      weekOrTopic: weekOrTopic || ''
    });

    await newNote.save();
    
    const io = req.app.get('io');
    if (io) {
      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(req.user.id);
      io.emit('progress_updated', { userId: req.user.id });
      io.emit('new_note_uploaded', newNote);
    }
    
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

// @desc    Get all class notes with filtering, searching, and sorting
// @route   GET /api/notes
// @access  Private
const getAllNotes = async (req, res) => {
  try {
    const { search, department, semester, course, weekOrTopic, sort } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (department && department !== 'All') {
      query.department = department;
    }
    if (semester && semester !== 'All') {
      query.semester = semester;
    }
    if (course && course !== 'All') {
      query.course = course;
    }
    if (weekOrTopic && weekOrTopic !== 'All') {
      query.weekOrTopic = weekOrTopic;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'downloads') {
      sortOption = { downloads: -1 };
    } else if (sort === 'views') {
      sortOption = { views: -1 };
    }

    const notes = await ClassNote.find(query)
      .populate('studentId', 'name profilePicture department')
      .sort(sortOption);

    res.json(notes);
  } catch (error) {
    console.error("Error fetching all notes:", error);
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await ClassNote.findById(req.params.id)
      .populate('studentId', 'name profilePicture department studentId');
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note', error: error.message });
  }
};

// @desc    Increment view count for a note
// @route   POST /api/notes/:id/view
// @access  Private
const incrementViews = async (req, res) => {
  try {
    const note = await ClassNote.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json({ views: note.views });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update views', error: error.message });
  }
};

// @desc    Increment download count for a note
// @route   POST /api/notes/:id/download
// @access  Private
const incrementDownloads = async (req, res) => {
  try {
    const note = await ClassNote.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json({ downloads: note.downloads });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update downloads', error: error.message });
  }
};

// @desc    Get notes by student ID
// @route   GET /api/notes/student/:id
// @access  Private
const getNotesByStudent = async (req, res) => {
  try {
    const notes = await ClassNote.find({ studentId: req.params.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
};

// @desc    Get distinct filter values for dropdowns
// @route   GET /api/notes/filters/meta
// @access  Private
const getFilterMeta = async (req, res) => {
  try {
    const [departments, semesters, courses, weekOrTopics] = await Promise.all([
      ClassNote.distinct('department'),
      ClassNote.distinct('semester'),
      ClassNote.distinct('course'),
      ClassNote.distinct('weekOrTopic')
    ]);
    res.json({
      departments: departments.filter(Boolean).sort(),
      semesters: semesters.filter(Boolean).sort(),
      courses: courses.filter(Boolean).sort(),
      weekOrTopics: weekOrTopics.filter(Boolean).sort()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch filter metadata', error: error.message });
  }
};

// @desc    Delete a class note
// @route   DELETE /api/notes/:id
// @access  Private (Owner only)
const deleteNote = async (req, res) => {
  try {
    const note = await ClassNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    
    if (note.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this note." });
    }

    await note.deleteOne();
    
    if (req.app.get('io')) {
      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(req.user.id);
      req.app.get('io').emit('progress_updated', { userId: req.user.id });
    }
    
    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  incrementViews,
  incrementDownloads,
  getNotesByStudent,
  getFilterMeta,
  deleteNote
};
