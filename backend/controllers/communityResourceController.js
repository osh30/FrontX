const Resource = require('../models/Resource');

exports.getCommunityResources = async (req, res) => {
  try {
    const { search, category, fileType, sort } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'most-downloaded') sortOption = { downloads: -1 };
    else if (sort === 'most-viewed') sortOption = { views: -1 };
    else if (sort === 'alphabetical') sortOption = { title: 1 };
    else if (sort === 'popular') sortOption = { downloads: -1, views: -1 };

    const resources = await Resource.find(query)
      .populate('alumniId', 'name profilePicture department role')
      .sort(sortOption);

    const enriched = resources.map(r => {
      const obj = r.toObject();
      const url = obj.fileUrl || obj.externalLink || '';
      const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
      if (obj.uploadType === 'ExternalLink') obj.fileType = 'LINK';
      else if (['pdf'].includes(ext)) obj.fileType = 'PDF';
      else if (['ppt', 'pptx'].includes(ext)) obj.fileType = 'PPT';
      else if (['doc', 'docx'].includes(ext)) obj.fileType = 'DOCX';
      else if (['zip', 'rar', '7z'].includes(ext)) obj.fileType = 'ZIP';
      else obj.fileType = 'FILE';

      const daysSinceUpload = Math.floor((Date.now() - new Date(obj.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      obj.badges = [];
      if (daysSinceUpload <= 7) obj.badges.push('NEW');
      if (obj.downloads >= 5) obj.badges.push('Most Downloaded');
      if ((obj.downloads + obj.views) >= 20) obj.badges.push('Popular');

      return obj;
    });

    const filtered = fileType && fileType !== 'All'
      ? enriched.filter(r => r.fileType === fileType)
      : enriched;

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching community resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trackCommunityDownload = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloads += 1;
    await resource.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('resource_downloaded', { resourceId: resource._id, downloads: resource.downloads });
      io.emit('resource_updated');
    }

    res.json({ downloads: resource.downloads });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trackCommunityView = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.views += 1;
    await resource.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('resource_viewed', { resourceId: resource._id, views: resource.views });
    }

    res.json({ views: resource.views });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
