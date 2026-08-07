const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Resource = require('../models/Resource');

router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ students: [], alumni: [], resources: [] });
    }

    const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [students, alumni, resources] = await Promise.all([
      User.find({
        role: 'student',
        $or: [
          { name: searchRegex },
          { department: searchRegex },
          { interests: searchRegex },
          { studentId: searchRegex }
        ]
      }).select('name department profilePicture studentId interests session').limit(5),

      User.find({
        role: 'alumni',
        $or: [
          { name: searchRegex },
          { department: searchRegex },
          { bio: searchRegex },
          { careerInterest: searchRegex },
          { interests: searchRegex }
        ]
      }).select('name department profilePicture bio careerInterest interests').limit(5),

      Resource.find({
        $or: [
          { title: searchRegex },
          { tags: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ]
      }).populate('alumniId', 'name').limit(5)
    ]);

    res.json({ students, alumni, resources });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
