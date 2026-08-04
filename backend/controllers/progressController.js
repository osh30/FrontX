const Progress = require('../models/Progress');
const { recalculateProgress } = require('../utils/progressCalculator');

const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      const data = await recalculateProgress(userId);
      if (!data) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(data);
    }

    res.json(progress);
  } catch (error) {
    console.error('Progress Tracker Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

module.exports = { getProgress, refreshProgress };
