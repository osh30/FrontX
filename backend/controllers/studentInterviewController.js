const Interview = require('../models/Interview');

const getStudentInterviews = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { student: req.user.id };

    if (status && status !== 'all') query.status = status;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interviews, total, stats] = await Promise.all([
      Interview.find(query)
        .populate('recruiter', 'name companyName companyLogo')
        .populate('opportunity', 'title opportunityType companyName')
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Interview.countDocuments(query),
      Interview.aggregate([
        { $match: { student: req.user.id } },
        {
          $facet: {
            scheduled: [{ $match: { status: 'scheduled' } }, { $count: 'count' }],
            today: [{ $match: { date: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } } }, { $count: 'count' }],
            completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
            cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }]
          }
        }
      ])
    ]);

    const statDocs = stats[0] || {};
    res.json({
      interviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: {
        scheduled: statDocs.scheduled?.[0]?.count || 0,
        today: statDocs.today?.[0]?.count || 0,
        completed: statDocs.completed?.[0]?.count || 0,
        cancelled: statDocs.cancelled?.[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get student interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentInterviewById = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const interview = await Interview.findOne({ _id: req.params.id, student: req.user.id })
      .populate('recruiter', 'name companyName companyLogo email')
      .populate('opportunity', 'title opportunityType companyName location')
      .lean();

    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    res.json(interview);
  } catch (error) {
    console.error('Get student interview by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentInterviews, getStudentInterviewById };
