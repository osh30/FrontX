const User = require('../models/User');
const MentorshipRequest = require('../models/MentorshipRequest');
const Session = require('../models/Session');
const CollaborationPost = require('../models/CollaborationPost');
const CollaborationApplication = require('../models/CollaborationApplication');
const Message = require('../models/Message');
const Resource = require('../models/Resource');

exports.getAlumniAnalytics = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const { filter } = req.query; // '7_days', '30_days', '3_months', '1_year', 'all'

    // 1. Date Filter Construction
    let dateFilter = {};
    if (filter && filter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (filter === '7_days') startDate.setDate(now.getDate() - 7);
      else if (filter === '30_days') startDate.setDate(now.getDate() - 30);
      else if (filter === '3_months') startDate.setMonth(now.getMonth() - 3);
      else if (filter === '1_year') startDate.setFullYear(now.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // --- 2. OVERVIEW METRICS ---
    const alumniRequests = await MentorshipRequest.find({ alumniId, ...dateFilter });
    const acceptedRequests = alumniRequests.filter(r => r.status === 'accepted');
    const uniqueStudents = [...new Set(acceptedRequests.map(r => r.studentId.toString()))];
    
    const activeMentorships = acceptedRequests.length;
    
    const alumniSessions = await Session.find({ alumni: alumniId, ...dateFilter });
    const completedMentorships = alumniSessions.filter(s => s.status === 'Completed').length;
    
    const collaborationProjects = await CollaborationPost.countDocuments({ alumni: alumniId, ...dateFilter });
    
    const totalMessagesExchanged = await Message.countDocuments({ 
      $or: [{ sender: alumniId }, { receiver: alumniId }], 
      ...dateFilter 
    });
    
    const me = await User.findById(alumniId).select('profileViews');
    const profileViews = me.profileViews || 0;
    
    const resourcesShared = await Resource.countDocuments({ alumniId, ...dateFilter });

    // --- 3. CHART 1: Monthly Mentorship Activity ---
    // Group requests received and completed sessions by month
    const monthsMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months to ensure chart looks good even if empty
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      monthsMap[mName] = { month: mName, requests: 0, completed: 0 };
    }

    alumniRequests.forEach(r => {
      const mName = monthNames[new Date(r.createdAt).getMonth()];
      if (monthsMap[mName]) monthsMap[mName].requests++;
    });

    alumniSessions.filter(s => s.status === 'Completed').forEach(s => {
      const mName = monthNames[new Date(s.createdAt || s.date).getMonth()]; // session might not have createdAt if old
      if (monthsMap[mName]) monthsMap[mName].completed++;
    });

    const chart1 = Object.values(monthsMap);

    // --- 4. CHART 2: Research Collaboration Performance ---
    const applications = await CollaborationApplication.find({ alumni: alumniId, ...dateFilter }).populate('post', 'title');
    const collabMap = {};
    applications.forEach(app => {
      if (app.post && app.post.title) {
        if (!collabMap[app.post.title]) collabMap[app.post.title] = 0;
        collabMap[app.post.title]++;
      }
    });
    const chart2 = Object.keys(collabMap).map(topic => ({ topic, interested: collabMap[topic] }));

    // --- 5. RECENT ACTIVITY TIMELINE ---
    const timeline = [];
    alumniRequests.slice(-10).forEach(r => timeline.push({ 
      type: r.status === 'accepted' ? 'Mentorship Accepted' : 'Mentorship Requested', 
      title: `${r.studentName} requested mentorship for ${r.requestType}`, 
      date: r.createdAt || new Date(),
      icon: 'UserPlus'
    }));
    const myCollabs = await CollaborationPost.find({ alumni: alumniId, ...dateFilter }).sort('-createdAt').limit(5);
    myCollabs.forEach(c => timeline.push({
      type: 'Collaboration Posted',
      title: `Posted new research: ${c.title}`,
      date: c.createdAt || new Date(),
      icon: 'Briefcase'
    }));
    const myResources = await Resource.find({ alumniId, ...dateFilter }).sort('-createdAt').limit(5);
    myResources.forEach(r => timeline.push({
      type: 'Resource Uploaded',
      title: `Uploaded resource: ${r.title}`,
      date: r.createdAt || new Date(),
      icon: 'Upload'
    }));
    alumniSessions.filter(s => s.status === 'Completed').slice(-5).forEach(s => timeline.push({
      type: 'Session Completed',
      title: `Completed mentorship session with student`,
      date: s.date || s.createdAt || new Date(),
      icon: 'CheckCircle'
    }));
    
    // Sort descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTimeline = timeline.slice(0, 10); // Keep top 10

    // --- 6. TOP PERFORMING CONTENT ---
    const mostViewedRes = await Resource.findOne({ alumniId, ...dateFilter }).sort({ views: -1 });
    const mostDownloadedRes = await Resource.findOne({ alumniId, ...dateFilter }).sort({ downloads: -1 });
    
    let mostRequestedTopic = { title: 'N/A', requests: 0 };
    if (alumniRequests.length > 0) {
      const topicCount = {};
      alumniRequests.forEach(r => {
        topicCount[r.requestType] = (topicCount[r.requestType] || 0) + 1;
      });
      const topTopic = Object.keys(topicCount).sort((a, b) => topicCount[b] - topicCount[a])[0];
      mostRequestedTopic = { title: topTopic, requests: topicCount[topTopic] };
    }

    let mostPopularResearch = { title: 'N/A', interested: 0 };
    if (chart2.length > 0) {
      mostPopularResearch = chart2.sort((a, b) => b.interested - a.interested)[0];
    }

    // --- 7. STUDENT ENGAGEMENT ---
    const acceptedApps = applications.filter(a => a.status === 'accepted');
    const uniqueCollabStudents = [...new Set(acceptedApps.map(a => a.student.toString()))];
    const totalStudentsConnected = new Set([...uniqueStudents, ...uniqueCollabStudents]).size;

    const pendingRequestsCount = alumniRequests.filter(r => r.status === 'pending').length 
                               + applications.filter(a => a.status === 'pending').length;
                               
    const completedCollabs = await CollaborationPost.countDocuments({ alumni: alumniId, status: 'closed', ...dateFilter });

    // Avg Response Time
    let totalResponseHours = 0;
    let respondedCount = 0;
    alumniRequests.filter(r => r.status !== 'pending' && r.updatedAt && r.createdAt).forEach(r => {
      const diffMs = new Date(r.updatedAt) - new Date(r.createdAt);
      if (diffMs > 0) {
        totalResponseHours += (diffMs / (1000 * 60 * 60));
        respondedCount++;
      }
    });
    let avgResponseTime = "N/A";
    if (respondedCount > 0) {
      const avgH = totalResponseHours / respondedCount;
      if (avgH < 1) avgResponseTime = `${Math.round(avgH * 60)} mins`;
      else if (avgH < 24) avgResponseTime = `${avgH.toFixed(1)} hrs`;
      else avgResponseTime = `${(avgH / 24).toFixed(1)} days`;
    }

    // --- 8. SMART INSIGHTS ---
    const insights = [];
    if (alumniRequests.length > 5) insights.push(`You received ${alumniRequests.length} mentorship requests recently.`);
    if (mostPopularResearch.title !== 'N/A') insights.push(`"${mostPopularResearch.title}" received the highest student interest in research.`);
    if (mostViewedRes) insights.push(`"${mostViewedRes.title}" is your most viewed resource (${mostViewedRes.views} views).`);
    if (avgResponseTime !== "N/A") insights.push(`Your average response time is excellent at ${avgResponseTime}.`);
    if (insights.length === 0) insights.push("Share more resources or post collaborations to generate insights.");

    res.json({
      overview: {
        totalStudentsMentored: uniqueStudents.length,
        activeMentorships,
        completedMentorships,
        collaborationProjects,
        totalMessagesExchanged,
        profileViews,
        resourcesShared
      },
      chart1,
      chart2,
      timeline: recentTimeline,
      topContent: {
        mostViewedResource: mostViewedRes ? { title: mostViewedRes.title, views: mostViewedRes.views } : { title: 'N/A', views: 0 },
        mostPopularResearch,
        mostDownloadedResource: mostDownloadedRes ? { title: mostDownloadedRes.title, downloads: mostDownloadedRes.downloads } : { title: 'N/A', downloads: 0 },
        mostRequestedTopic
      },
      engagement: {
        studentsConnected: totalStudentsConnected,
        avgResponseTime,
        pendingRequests: pendingRequestsCount,
        completedCollaborations: completedCollabs
      },
      insights: insights.slice(0, 4) // Top 4 insights
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Server error retrieving analytics data.' });
  }
};
