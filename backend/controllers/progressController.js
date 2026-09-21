const Progress = require('../models/Progress');
const { recalculateProgress } = require('../utils/progressCalculator');

const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    let data = await recalculateProgress(userId);

    if (!data) {
      data = await Progress.findOne({ userId });
    }

    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Progress Tracker Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCareerGrowth = async (req, res) => {
  try {
    const userId = req.user.id;
    let data = await recalculateProgress(userId);

    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }

    const timeline = (data.growthTimeline || []).map(item => ({
      month: item.name || item.month,
      activities: item.total || item.activities || 0
    }));

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Career Growth Analytics Error:', error);
    res.status(500).json({ message: 'Server error retrieving career growth data', error: error.message });
  }
};

const refreshProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await recalculateProgress(userId);
    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }
    const io = req.app.get('io');
    if (io) {
      io.emit('progress_updated', { userId, ...data });
    }
    res.json(data);
  } catch (error) {
    console.error('Progress Refresh Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProgress, getCareerGrowth, refreshProgress };
