const Activity = require('../models/Activity');

// @desc    Get activities for logged in user
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10); // Fetch top 10 recent activities
      
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGlobalActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isGlobal: true })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getActivities,
  getGlobalActivities
};
