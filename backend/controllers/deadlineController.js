const Deadline = require('../models/Deadline');

// @desc    Get upcoming deadlines for logged in user
// @route   GET /api/deadlines
// @access  Private
const getDeadlines = async (req, res) => {
  try {
    // Return deadlines from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlines = await Deadline.find({ 
      user: req.user._id,
      date: { $gte: today }
    })
      .sort({ date: 1 })
      .limit(20);
      
    res.json(deadlines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDeadlines
};
