const axios = require('axios');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const StudyPlanner = require('../models/StudyPlanner');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

const MARK_DISTRIBUTION = {
  '1.0': [
    { component: 'Attendance & Class Performance', marks: 10 },
    { component: 'Continuous Assessment', marks: 30 },
    { component: 'Midterm Evaluation', marks: 24 },
    { component: 'Final Evaluation', marks: 36 },
    { component: 'Total', marks: 100 }
  ],
  '3.0': [
    { component: 'Attendance & Class Performance', marks: 30 },
    { component: 'Continuous Assessment', marks: 90 },
    { component: 'Midterm Evaluation', marks: 72 },
    { component: 'Final Evaluation', marks: 108 },
    { component: 'Total', marks: 300 }
  ]
};

const GRADE_TABLE = [
  { grade: 'A+', min: 80, max: 100 },
  { grade: 'A', min: 70, max: 79.99 },
  { grade: 'A-', min: 65, max: 69.99 },
  { grade: 'B+', min: 60, max: 64.99 },
  { grade: 'B', min: 55, max: 59.99 },
  { grade: 'B-', min: 50, max: 54.99 },
  { grade: 'C+', min: 45, max: 49.99 },
  { grade: 'C', min: 40, max: 44.99 },
  { grade: 'D', min: 33, max: 39.99 },
  { grade: 'F', min: 0, max: 32.99 }
];

const getGradeTableForCredit = (credit) => {
  const total = credit === 3.0 ? 300 : 100;
  return GRADE_TABLE.map(g => ({
    grade: g.grade,
    minMarks: Math.round((g.min / 100) * total * 10) / 10,
    maxMarks: Math.round((g.max / 100) * total * 10) / 10
  }));
};

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables.');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const extractTextFromBuffer = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  return data.text;
};

// Calculate week date ranges from semester start date
const calculateWeekDates = (semesterStartDate, weeks) => {
  const start = new Date(semesterStartDate);
  start.setHours(0, 0, 0, 0);

  return weeks.map(w => {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (w.weekNumber - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      ...w,
      startDate: weekStart,
      endDate: weekEnd
    };
  });
};

// Determine the current academic week number based on semester start date
const getCurrentWeekNumber = (semesterStartDate) => {
  if (!semesterStartDate) return 0;
  const start = new Date(semesterStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7) + 1;
};

// Check if a week is unlocked (current date >= week's start date)
const isWeekUnlocked = (weekStartDate, semesterStartDate) => {
  if (!weekStartDate || !semesterStartDate) return true;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);
  return now >= weekStart;
};

// @desc    Get or create study planner for current user
// @route   GET /api/study-planner
exports.getPlanner = async (req, res) => {
  try {
    let planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) {
      planner = await StudyPlanner.create({ userId: req.user.id, semester: '', courses: [] });
    }

    const plannerObj = planner.toObject();
    const currentWeek = getCurrentWeekNumber(planner.semesterStartDate);

    // Enrich each week with lock status
    for (const course of plannerObj.courses) {
      for (const week of course.weeks) {
        week.locked = week.status !== 'completed' && !isWeekUnlocked(week.startDate, planner.semesterStartDate);
        week.isActive = !week.locked && week.status === 'pending' &&
          week.startDate && new Date().setHours(0,0,0,0) >= new Date(week.startDate).setHours(0,0,0,0) &&
          week.endDate && new Date().setHours(0,0,0,0) <= new Date(week.endDate).setHours(0,0,0,0);
      }
    }

    plannerObj.currentWeek = currentWeek;
    res.json(plannerObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch planner', error: error.message });
  }
};

// @desc    Save initial setup (semester + courses + dates)
// @route   POST /api/study-planner/setup
exports.saveSetup = async (req, res) => {
  try {
    const { semester, courses, semesterStartDate, semesterEndDate } = req.body;
    if (!semester || !courses || courses.length === 0) {
      return res.status(400).json({ message: 'Semester and at least one course are required.' });
    }
    if (!semesterStartDate || !semesterEndDate) {
      return res.status(400).json({ message: 'Semester start and end dates are required.' });
    }
    if (courses.length > 7) {
      return res.status(400).json({ message: 'Maximum 7 courses allowed.' });
    }

    const formattedCourses = courses.map(c => ({
      courseCode: c.courseCode,
      courseName: c.courseName,
      credit: c.credit,
      outlinePdfUrl: null,
      weeks: [],
      outlineUploaded: false,
      weeksGenerated: false
    }));

    const planner = await StudyPlanner.findOneAndUpdate(
      { userId: req.user.id },
      {
        semester,
        semesterStartDate: new Date(semesterStartDate),
        semesterEndDate: new Date(semesterEndDate),
        courses: formattedCourses,
        isSetupComplete: true
      },
      { new: true, upsert: true }
    );

    res.json(planner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save setup', error: error.message });
  }
};

// @desc    Get mark distribution reference
// @route   GET /api/study-planner/marks
exports.getMarkDistribution = (req, res) => {
  res.json(MARK_DISTRIBUTION);
};

// @desc    Get grade table for a credit value
// @route   GET /api/study-planner/grades/:credit
exports.getGradeTable = (req, res) => {
  const credit = parseFloat(req.params.credit);
  if (credit !== 1.0 && credit !== 3.0) {
    return res.status(400).json({ message: 'Credit must be 1.0 or 3.0' });
  }
  res.json(getGradeTableForCredit(credit));
};

// @desc    Add a new course to an existing planner (self-development)
// @route   POST /api/study-planner/courses
exports.addCourse = async (req, res) => {
  try {
    const { courseCode, courseName, credit } = req.body;
    if (!courseCode || !courseName) {
      return res.status(400).json({ message: 'Course code and name are required.' });
    }
    if (credit !== 1.0 && credit !== 3.0) {
      return res.status(400).json({ message: 'Credit must be 1.0 or 3.0' });
    }

    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });
    if (planner.courses.length >= 7) {
      return res.status(400).json({ message: 'Maximum 7 courses allowed.' });
    }

    planner.courses.push({
      courseCode: String(courseCode).trim(),
      courseName: String(courseName).trim(),
      credit,
      outlinePdfUrl: null,
      weeks: [],
      outlineUploaded: false,
      weeksGenerated: false
    });

    await planner.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('planner_updated', { userId: req.user.id });
    }

    res.json(planner);
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ message: 'Failed to add course', error: error.message });
  }
};

// @desc    Delete a course from the planner
// @route   DELETE /api/study-planner/courses/:courseId
exports.deleteCourse = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });

    const courseIndex = planner.courses.findIndex(c => c._id.toString() === req.params.courseId);
    if (courseIndex === -1) return res.status(404).json({ message: 'Course not found.' });

    const [removed] = planner.courses.splice(courseIndex, 1);
    await planner.save();

    if (removed.outlinePdfUrl) {
      try { await deleteFromCloudinary(removed.outlinePdfUrl); } catch (e) {}
    }
    for (const week of removed.weeks) {
      if (week.notePdfUrl) {
        try { await deleteFromCloudinary(week.notePdfUrl); } catch (e) {}
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('planner_updated', { userId: req.user.id });
    }

    res.json(planner);
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};

// @desc    Upload course outline PDF and extract weeks via Gemini, auto-map to calendar
// @route   POST /api/study-planner/courses/:courseId/outline
exports.uploadOutline = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });

    const course = planner.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    if (!req.file) return res.status(400).json({ message: 'PDF file is required.' });

    const result = await uploadToCloudinary(req.file, 'frontx/study-planner');
    course.outlinePdfUrl = result.secure_url;
    course.outlineUploaded = true;

    const buffer = Buffer.from(req.file.buffer);
    const extractedText = await extractTextFromBuffer(buffer);

    if (extractedText.trim().length < 20) {
      await planner.save();
      return res.status(400).json({ message: 'Could not extract enough text from the outline PDF.' });
    }

    const model = initGemini();
    const prompt = `You are an academic assistant. The following is the extracted text from a university course outline/syllabus.

Extract the weekly topics from this outline. Return ONLY a JSON array of objects with this exact format:
[
  { "weekNumber": 1, "topic": "<topic name>" },
  { "weekNumber": 2, "topic": "<topic name>" },
  ...
]

If you cannot determine exact weeks, create 14 weeks with reasonable topic breakdowns based on the content.
If the outline mentions specific week-to-topic mappings, use those exactly.
Return ONLY the JSON array, no explanation.`;

    const aiResult = await model.generateContent(`${prompt}\n\nCourse Outline Text:\n"""\n${extractedText}\n"""`);
    let responseText = aiResult.response.text();

    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(json)?\n/i, '').replace(/\n```$/i, '');
    }

    let weeks;
    try {
      weeks = JSON.parse(responseText);
    } catch (parseErr) {
      weeks = [];
      for (let i = 1; i <= 14; i++) {
        weeks.push({ weekNumber: i, topic: `Week ${i}` });
      }
    }

    // Auto-map week dates from semester start date
    const rawWeeks = weeks.map(w => ({
      weekNumber: w.weekNumber,
      topic: w.topic || `Week ${w.weekNumber}`,
      status: 'pending',
      notePdfUrl: null,
      noteUploadedAt: null,
      geminiVerification: { matched: false, confidence: 0, feedback: '', verifiedAt: null }
    }));

    const weeksWithDates = planner.semesterStartDate
      ? calculateWeekDates(planner.semesterStartDate, rawWeeks)
      : rawWeeks;

    course.weeks = weeksWithDates;
    course.weeksGenerated = true;

    await planner.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('planner_updated', { userId: req.user.id });
    }

    res.json({ course, weeksGenerated: true });
  } catch (error) {
    console.error('Outline upload error:', error);
    res.status(500).json({ message: 'Failed to process course outline', error: error.message });
  }
};

// @desc    Upload weekly note and verify topic with Gemini
// @route   POST /api/study-planner/courses/:courseId/weeks/:weekId/note
exports.uploadWeekNote = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });

    const course = planner.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const week = course.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ message: 'Week not found.' });

    // Smart week unlock check
    if (week.startDate && !isWeekUnlocked(week.startDate, planner.semesterStartDate)) {
      return res.status(403).json({ message: `This week is locked. Upload will be available from ${new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.` });
    }

    if (!req.file) return res.status(400).json({ message: 'PDF file is required.' });

    const result = await uploadToCloudinary(req.file, 'frontx/study-planner/notes');
    week.notePdfUrl = result.secure_url;
    week.noteUploadedAt = new Date();

    const buffer = Buffer.from(req.file.buffer);
    const extractedText = await extractTextFromBuffer(buffer);

    const model = initGemini();
    const prompt = `You are an academic topic verifier. You must ONLY check if the uploaded note matches the assigned week topic. Do NOT analyze quality, do NOT score, do NOT summarize.

Week Topic: "${week.topic}"
Uploaded Note Text (first 2000 chars):
"""
${extractedText.substring(0, 2000)}
"""

Return ONLY a JSON object in this exact format:
{
  "matched": true or false,
  "confidence": <number 0-100>,
  "feedback": "<one sentence about whether it matches>"
}

Only check topic relevance. Nothing else.`;

    try {
      const aiResult = await model.generateContent(prompt);
      let responseText = aiResult.response.text();
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```(json)?\n/i, '').replace(/\n```$/i, '');
      }
      const verification = JSON.parse(responseText);

      week.geminiVerification = {
        matched: verification.matched || false,
        confidence: verification.confidence || 0,
        feedback: verification.feedback || '',
        verifiedAt: new Date()
      };

      if (verification.matched) {
        week.status = 'completed';
      }
    } catch (aiErr) {
      console.error('Gemini verification error:', aiErr);
      week.geminiVerification = {
        matched: false,
        confidence: 0,
        feedback: 'AI verification could not be completed.',
        verifiedAt: new Date()
      };
    }

    await planner.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('planner_updated', { userId: req.user.id });
    }

    res.json({ week, courseName: course.courseName });
  } catch (error) {
    console.error('Week note upload error:', error);
    res.status(500).json({ message: 'Failed to upload note', error: error.message });
  }
};

// @desc    Check for overdue/missing notes using semester calendar and generate reminders
// @route   POST /api/study-planner/reminders
exports.generateReminders = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.status(404).json({ message: 'Planner not found.' });

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const reminders = [];

    for (const course of planner.courses) {
      for (const week of course.weeks) {
        if (week.status === 'completed' || week.notePdfUrl) continue;

        const weekEnd = week.endDate ? new Date(week.endDate) : null;
        if (weekEnd) weekEnd.setHours(23, 59, 59, 999);

        const weekStart = week.startDate ? new Date(week.startDate) : null;
        if (weekStart) weekStart.setHours(0, 0, 0, 0);

        let message = '';
        let isOverdue = false;

        if (weekEnd && now > weekEnd) {
          // Week's deadline has passed
          message = `Week ${week.weekNumber} study note is overdue for ${course.courseName}. Topic: ${week.topic}`;
          isOverdue = true;
        } else if (weekStart && now >= weekStart && weekEnd && now <= weekEnd) {
          // Currently in this week
          message = `You haven't uploaded your Week ${week.weekNumber} note for ${course.courseName} yet. Topic: ${week.topic}`;
        } else if (weekStart && now < weekStart) {
          // Future week — skip (locked)
          continue;
        } else {
          // No date info, generic reminder
          message = `You haven't uploaded your Week ${week.weekNumber} note for ${course.courseName} yet. Topic: ${week.topic}`;
        }

        if (!message) continue;

        const title = isOverdue
          ? `Overdue: ${course.courseName} — Week ${week.weekNumber}`
          : `${course.courseName} — Week ${week.weekNumber}`;

        const existing = await Notification.findOne({
          user: req.user.id,
          title,
          type: 'system'
        });

        if (!existing) {
          const notification = await Notification.create({
            user: req.user.id,
            title,
            message,
            type: 'system',
            relatedId: planner._id
          });
          reminders.push(notification);
        }
      }
    }

    if (reminders.length > 0) {
      const io = req.app.get('io');
      if (io) {
        io.to(req.user.id).emit('notification:new', {
          title: 'Study Planner Reminder',
          message: `You have ${reminders.length} pending/overdue note${reminders.length > 1 ? 's' : ''}.`
        });
      }
    }

    res.json({ remindersCreated: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate reminders', error: error.message });
  }
};

// @desc    Get planner stats (completed/pending counts + current week)
// @route   GET /api/study-planner/stats
exports.getStats = async (req, res) => {
  try {
    const planner = await StudyPlanner.findOne({ userId: req.user.id });
    if (!planner) return res.json({ totalWeeks: 0, completed: 0, pending: 0, courses: 0 });

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let totalWeeks = 0;
    let completed = 0;
    let unlocked = 0;
    let locked = 0;

    for (const course of planner.courses) {
      totalWeeks += course.weeks.length;
      completed += course.weeks.filter(w => w.status === 'completed').length;
      for (const week of course.weeks) {
        if (week.status === 'completed' || (week.startDate && isWeekUnlocked(week.startDate, planner.semesterStartDate))) {
          unlocked++;
        } else {
          locked++;
        }
      }
    }

    const currentWeek = getCurrentWeekNumber(planner.semesterStartDate);

    res.json({
      totalWeeks,
      completed,
      pending: totalWeeks - completed,
      unlocked,
      locked,
      courses: planner.courses.length,
      semester: planner.semester,
      currentWeek,
      semesterStartDate: planner.semesterStartDate,
      semesterEndDate: planner.semesterEndDate,
      percentage: totalWeeks > 0 ? Math.round((completed / totalWeeks) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
