const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const CommunityReaction = require('../models/CommunityReaction');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const Resource = require('../models/Resource');
const ResourceInteraction = require('../models/ResourceInteraction');
const ClassNote = require('../models/ClassNote');
const Opportunity = require('../models/Opportunity');
const Session = require('../models/Session');
const MentorshipSession = require('../models/MentorshipSession');
const StudyPlanner = require('../models/StudyPlanner');
const PlatformAnnouncement = require('../models/PlatformAnnouncement');
const Notification = require('../models/Notification');
const CollaborationPost = require('../models/CollaborationPost');
const CollaborationApplication = require('../models/CollaborationApplication');

const buildDayLabels = (days) => {
  const labels = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
};

const buildMonthLabels = (months) => {
  const labels = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return labels;
};

const safeCount = async (Model, query = {}) => {
  try { return await Model.countDocuments(query); } catch { return 0; }
};

const safeFindOne = async (Model, query = {}, sort = null, select = '', populate = null) => {
  try {
    let q = Model.findOne(query);
    if (sort) q = q.sort(sort);
    if (select) q = q.select(select);
    if (populate) q = q.populate(populate.field, populate.select);
    return await q.lean();
  } catch { return null; }
};

const safeAggregate = async (Model, pipeline = []) => {
  try { return await Model.aggregate(pipeline); } catch { return []; }
};

const getDateRange = (req) => {
  const { range = '30d', startDate, endDate } = req.query;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  let dateStart;
  if (startDate && endDate) {
    dateStart = new Date(startDate);
  } else {
    switch (range) {
      case 'today': dateStart = todayStart; break;
      case '7d': dateStart = weekAgo; break;
      case '30d': dateStart = monthAgo; break;
      case '6m': dateStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); break;
      case '1y': dateStart = yearAgo; break;
      default: dateStart = monthAgo;
    }
  }

  return { now, todayStart, weekAgo, monthAgo, yearAgo, dateStart, range };
};

// ─── MAIN ANALYTICS (combined) ───
const getAnalytics = async (req, res) => {
  try {
    const { now, todayStart, weekAgo, monthAgo, yearAgo, dateStart, range } = getDateRange(req);

    // ── User counts ──
    const [totalStudents, totalAlumni, totalAdmins] = await Promise.all([
      safeCount(User, { role: 'student' }),
      safeCount(User, { role: 'alumni' }),
      safeCount(User, { role: 'admin' }),
    ]);

    const [todayStudents, todayAlumni, weekStudents, weekAlumni, monthStudents, monthAlumni] = await Promise.all([
      safeCount(User, { role: 'student', createdAt: { $gte: todayStart } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: todayStart } }),
      safeCount(User, { role: 'student', createdAt: { $gte: weekAgo } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: weekAgo } }),
      safeCount(User, { role: 'student', createdAt: { $gte: monthAgo } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: monthAgo } }),
    ]);

    // ── Login stats ──
    const [dailyLogins, weeklyLogins, monthlyLogins, activeUsersToday, totalLogins] = await Promise.all([
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: todayStart } }),
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: weekAgo } }),
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: monthAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: todayStart } }).catch(() => 0),
      safeCount(LoginHistory, { action: 'login', success: true }),
    ]);

    // ── Content counts ──
    const [totalPosts, totalComments, totalReactions, totalBlogs, totalBlogLikes, totalBlogComments, totalClassNotes] = await Promise.all([
      safeCount(CommunityPost),
      safeCount(CommunityComment),
      safeCount(CommunityReaction),
      safeCount(Blog),
      safeCount(BlogLike),
      safeCount(BlogComment),
      safeCount(ClassNote),
    ]);

    const [todayPosts, todayComments, weekPosts, weekComments, monthPosts, monthComments, todayBlogs] = await Promise.all([
      safeCount(CommunityPost, { createdAt: { $gte: todayStart } }),
      safeCount(CommunityComment, { createdAt: { $gte: todayStart } }),
      safeCount(CommunityPost, { createdAt: { $gte: weekAgo } }),
      safeCount(CommunityComment, { createdAt: { $gte: weekAgo } }),
      safeCount(CommunityPost, { createdAt: { $gte: monthAgo } }),
      safeCount(CommunityComment, { createdAt: { $gte: monthAgo } }),
      safeCount(Blog, { createdAt: { $gte: todayStart } }),
    ]);

    // ── Top blogs ──
    const [mostViewedBlog, mostLikedBlog] = await Promise.all([
      safeFindOne(Blog, {}, { views: -1 }, 'title views', { field: 'author', select: 'name' }),
      safeFindOne(Blog, {}, { likeCount: -1 }, 'title likeCount', { field: 'author', select: 'name' }),
    ]);

    // ── Most active community authors ──
    const mostActiveStudentPostAuthors = await safeAggregate(CommunityPost, [
      { $lookup: { from: 'users', localField: 'originalAuthor', foreignField: '_id', as: 'authorDoc' } },
      { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
      { $match: { 'authorDoc.role': 'student' } },
      { $group: { _id: '$originalAuthor', name: { $first: '$authorDoc.name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostActiveAlumniPostAuthors = await safeAggregate(CommunityPost, [
      { $lookup: { from: 'users', localField: 'originalAuthor', foreignField: '_id', as: 'authorDoc' } },
      { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
      { $match: { 'authorDoc.role': 'alumni' } },
      { $group: { _id: '$originalAuthor', name: { $first: '$authorDoc.name' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // ── Opportunity counts ──
    const [governmentJobs, privateJobs, scholarships, competitions] = await Promise.all([
      safeCount(Opportunity, { type: 'Government Job' }),
      safeCount(Opportunity, { type: 'Private Job' }),
      safeCount(Opportunity, { type: 'Scholarship' }),
      safeCount(Opportunity, { type: 'Competition' }),
    ]);

    // ── Resource stats ──
    const [recentUploads, totalResourceDownloads, totalResourceViews, mostDownloadedResource] = await Promise.all([
      safeCount(Resource, { createdAt: { $gte: weekAgo } }),
      safeAggregate(Resource, [{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      safeAggregate(Resource, [{ $group: { _id: null, total: { $sum: '$views' } } }]),
      safeFindOne(Resource, {}, { downloads: -1 }, 'title downloads uploadType category'),
    ]);

    const resourceStats = totalResourceDownloads.length > 0 ? totalResourceDownloads[0].total : 0;
    const resourceViews = totalResourceViews.length > 0 ? totalResourceViews[0].total : 0;

    // ── Mentorship counts ──
    const [completedSessions, upcomingSessions, activeMentors, studentsMentored, mentorshipCompleted, mentorshipUpcoming] = await Promise.all([
      safeCount(Session, { status: 'Completed' }),
      safeCount(Session, { status: { $in: ['Upcoming', 'Scheduled'] } }),
      Session.distinct('alumni', { status: { $ne: 'Cancelled' } }).then(ids => ids.length).catch(() => 0),
      Session.distinct('student').then(ids => ids.length).catch(() => 0),
      safeCount(MentorshipSession, { status: 'Completed' }),
      safeCount(MentorshipSession, { status: 'Upcoming' }),
    ]);

    const totalMentorSessions = completedSessions + mentorshipCompleted;
    const totalUpcomingMentorSessions = upcomingSessions + mentorshipUpcoming;

    // ── Collaboration stats ──
    const [totalCollabPosts, activeCollabs, completedCollabs] = await Promise.all([
      safeCount(CollaborationPost),
      safeCount(CollaborationPost, { status: 'active' }),
      safeCount(CollaborationPost, { status: 'closed' }),
    ]);

    // ── Notification stats ──
    const [totalNotifications, readNotifications, unreadNotifications] = await Promise.all([
      safeCount(Notification),
      safeCount(Notification, { isRead: true }),
      safeCount(Notification, { isRead: false }),
    ]);

    // ── Announcement stats ──
    const [totalAnnouncements, activeAnnouncements, expiredAnnouncements] = await Promise.all([
      safeCount(PlatformAnnouncement),
      safeCount(PlatformAnnouncement, { isActive: true }),
      safeCount(PlatformAnnouncement, { isActive: false }),
    ]);

    // ── Study Planner stats ──
    let studyPlannerData = { totalStudents: 0, totalCourses: 0, totalWeeks: 0, completedWeeks: 0, pendingWeeks: 0, missedWeeks: 0, notesUploadedThisWeek: 0, mostActiveCourse: 'N/A' };

    try {
      const planners = await StudyPlanner.find({ isSetupComplete: true }).lean();
      studyPlannerData.totalStudents = planners.length;

      const courseMap = {};
      planners.forEach(planner => {
        planner.courses.forEach(course => {
          studyPlannerData.totalCourses++;
          const courseKey = course.courseName;
          let courseWeekCount = 0;
          (course.weeks || []).forEach(week => {
            studyPlannerData.totalWeeks++;
            if (week.status === 'completed' || week.notePdfUrl) {
              studyPlannerData.completedWeeks++;
              courseWeekCount++;
            } else if (week.endDate && new Date(week.endDate) < new Date()) {
              studyPlannerData.missedWeeks++;
            } else {
              studyPlannerData.pendingWeeks++;
            }
            if (week.noteUploadedAt && new Date(week.noteUploadedAt) >= weekAgo) {
              studyPlannerData.notesUploadedThisWeek++;
            }
          });
          courseMap[courseKey] = (courseMap[courseKey] || 0) + courseWeekCount;
        });
      });

      let maxCount = 0;
      Object.entries(courseMap).forEach(([name, count]) => {
        if (count > maxCount) { maxCount = count; studyPlannerData.mostActiveCourse = name; }
      });
    } catch (e) {
      console.error('StudyPlanner aggregation error:', e.message);
    }

    const weeklyCompletionRate = studyPlannerData.totalWeeks > 0
      ? Math.round((studyPlannerData.completedWeeks / studyPlannerData.totalWeeks) * 100)
      : 0;

    // ── Charts ──
    let dailyActivity = [];
    try {
      const labels = buildDayLabels(30);
      const loginData = await safeAggregate(LoginHistory, [
        { $match: { action: 'login', success: true, createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      ]);
      const loginMap = {};
      loginData.forEach(d => { loginMap[d._id] = d.count; });
      dailyActivity = labels.map(l => ({ date: l, count: loginMap[l] || 0 }));
    } catch (e) {
      dailyActivity = buildDayLabels(30).map(l => ({ date: l, count: 0 }));
    }

    let monthlyRegistrations = [];
    try {
      const labels = buildMonthLabels(12);
      const [studentDocs, alumniDocs] = await Promise.all([
        User.find({ role: 'student', createdAt: { $gte: yearAgo } }).select('createdAt').lean(),
        User.find({ role: 'alumni', createdAt: { $gte: yearAgo } }).select('createdAt').lean(),
      ]);
      const sMap = {}; const aMap = {};
      labels.forEach(l => { sMap[l] = 0; aMap[l] = 0; });
      studentDocs.forEach(doc => {
        const d = new Date(doc.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (sMap[key] !== undefined) sMap[key]++;
      });
      alumniDocs.forEach(doc => {
        const d = new Date(doc.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (aMap[key] !== undefined) aMap[key]++;
      });
      monthlyRegistrations = labels.map(l => ({ month: l, students: sMap[l], alumni: aMap[l] }));
    } catch (e) {
      monthlyRegistrations = buildMonthLabels(12).map(l => ({ month: l, students: 0, alumni: 0 }));
    }

    const userDistribution = [
      { name: 'Students', value: totalStudents, fill: '#3B82F6' },
      { name: 'Alumni', value: totalAlumni, fill: '#8B5CF6' },
    ];

    const opportunityDistribution = [
      { name: 'Government Jobs', value: governmentJobs, fill: '#3B82F6' },
      { name: 'Private Jobs', value: privateJobs, fill: '#8B5CF6' },
      { name: 'Scholarships', value: scholarships, fill: '#22C55E' },
      { name: 'Competitions', value: competitions, fill: '#F59E0B' },
    ];

    let communityActivityData = [];
    try {
      const labels = buildDayLabels(30);
      const [recentPosts, recentComments] = await Promise.all([
        CommunityPost.find({ createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }).select('createdAt').lean(),
        CommunityComment.find({ createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }).select('createdAt').lean(),
      ]);
      const pMap = {}; const cMap = {};
      labels.forEach(l => { pMap[l] = 0; cMap[l] = 0; });
      recentPosts.forEach(doc => {
        const key = new Date(doc.createdAt).toISOString().slice(0, 10);
        if (pMap[key] !== undefined) pMap[key]++;
      });
      recentComments.forEach(doc => {
        const key = new Date(doc.createdAt).toISOString().slice(0, 10);
        if (cMap[key] !== undefined) cMap[key]++;
      });
      communityActivityData = labels.map(l => ({ date: l, posts: pMap[l], comments: cMap[l] }));
    } catch (e) {
      communityActivityData = buildDayLabels(30).map(l => ({ date: l, posts: 0, comments: 0 }));
    }

    const studyPlannerCompletion = [
      { name: 'Completed', value: studyPlannerData.completedWeeks, fill: '#22C55E' },
      { name: 'Pending', value: studyPlannerData.pendingWeeks, fill: '#3B82F6' },
      { name: 'Missed', value: studyPlannerData.missedWeeks, fill: '#EF4444' },
    ];

    // ── AI Insights ──
    const insights = [];
    try {
      const [inactiveUsers30d, prevWeekPosts, thisWeekPosts, prevWeekComments, thisWeekComments, topDepartment, mostDownloadedNote, unplannedStudents] = await Promise.all([
        safeCount(User, { lastActiveAt: { $lt: monthAgo, $ne: null }, role: { $in: ['student', 'alumni'] } }),
        safeCount(CommunityPost, { createdAt: { $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), $lt: weekAgo } }),
        safeCount(CommunityPost, { createdAt: { $gte: weekAgo } }),
        safeCount(CommunityComment, { createdAt: { $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), $lt: weekAgo } }),
        safeCount(CommunityComment, { createdAt: { $gte: weekAgo } }),
        safeAggregate(User, [
          { $match: { department: { $exists: true, $ne: '' } } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),
        safeFindOne(ClassNote, {}, { downloads: -1 }, 'title downloads'),
        User.countDocuments({ role: 'student' }).then(async (total) => {
          try { const plannerUsers = await StudyPlanner.distinct('userId'); return total - plannerUsers.length; }
          catch { return 0; }
        }),
      ]);

      if (unplannedStudents > 0) {
        insights.push({ type: 'warning', title: 'Students Without Study Planner', message: `${unplannedStudents} student${unplannedStudents !== 1 ? 's have' : ' has'} not set up a Study Planner yet.` });
      }

      if (prevWeekPosts > 0 || thisWeekPosts > 0) {
        const growth = prevWeekPosts > 0 ? Math.round(((thisWeekPosts - prevWeekPosts) / prevWeekPosts) * 100) : 100;
        if (growth !== 0) {
          insights.push({ type: growth > 0 ? 'positive' : 'warning', title: 'Community Activity Trend', message: `Community posts are ${growth > 0 ? 'up' : 'down'} ${Math.abs(growth)}% this week vs last week.` });
        }
      }

      const mostEngagedOppType = [...(await safeAggregate(Opportunity, [{ $group: { _id: '$type', count: { $sum: 1 } } }]))].sort((a, b) => b.count - a.count)[0];
      if (mostEngagedOppType) {
        insights.push({ type: 'info', title: 'Top Opportunity Category', message: `"${mostEngagedOppType._id}" leads with ${mostEngagedOppType.count} listings.` });
      }

      if (mostDownloadedNote) {
        insights.push({ type: 'positive', title: 'Most Downloaded Note', message: `"${mostDownloadedNote.title}" has ${mostDownloadedNote.downloads} downloads.` });
      }

      if (topDepartment && topDepartment.length > 0) {
        insights.push({ type: 'info', title: 'Most Active Department', message: `${topDepartment[0]._id} has the most users with ${topDepartment[0].count} members.` });
      }

      if (inactiveUsers30d > 0) {
        insights.push({ type: 'warning', title: 'Inactive Users', message: `${inactiveUsers30d} user${inactiveUsers30d !== 1 ? 's have' : ' has'} been inactive for over 30 days.` });
      }

      if (totalMentorSessions > 0 && completedSessions > 0) {
        const mentorshipRate = totalMentorSessions > 0 ? Math.round((completedSessions / totalMentorSessions) * 100) : 0;
        insights.push({ type: 'info', title: 'Mentorship Participation', message: `${mentorshipRate}% of mentorship sessions completed. ${totalUpcomingMentorSessions} upcoming.` });
      }

      if (studyPlannerData.totalWeeks > 0) {
        insights.push({ type: weeklyCompletionRate >= 50 ? 'positive' : 'warning', title: 'Study Planner Completion', message: `Completion rate is ${weeklyCompletionRate}% across ${studyPlannerData.totalWeeks} planned weeks.` });
      }

      const latestMonth = monthlyRegistrations[monthlyRegistrations.length - 1];
      if (latestMonth) {
        const totalThisMonth = latestMonth.students + latestMonth.alumni;
        if (totalThisMonth > 0) {
          insights.push({ type: 'positive', title: 'Monthly Registrations', message: `${totalThisMonth} new users this month (${latestMonth.students} students, ${latestMonth.alumni} alumni).` });
        }
      }

      if (dailyLogins > 0) {
        insights.push({ type: 'info', title: 'Daily Logins', message: `${dailyLogins} login${dailyLogins !== 1 ? 's' : ''} today across all users.` });
      }
    } catch (e) {
      console.error('Insights generation error:', e.message);
    }

    res.json({
      overview: {
        totalUsers: totalStudents + totalAlumni + totalAdmins,
        totalStudents, totalAlumni, totalAdmins,
        todayRegistrations: todayStudents + todayAlumni,
        todayStudents, todayAlumni,
        weekRegistrations: weekStudents + weekAlumni,
        monthRegistrations: monthStudents + monthAlumni,
        todayPosts, todayComments, todayReactions: 0,
        dailyLogins, weeklyLogins, monthlyLogins, activeUsersToday, totalLogins,
      },
      community: {
        totalPosts, totalComments, totalReactions,
        todayPosts, todayComments,
        weekPosts, weekComments,
        monthPosts, monthComments,
        mostActiveStudent: mostActiveStudentPostAuthors[0] || null,
        mostActiveAlumni: mostActiveAlumniPostAuthors[0] || null,
      },
      blogs: {
        totalBlogs, todayBlogs,
        weekBlogs: await safeCount(Blog, { createdAt: { $gte: weekAgo } }),
        monthBlogs: await safeCount(Blog, { createdAt: { $gte: monthAgo } }),
        totalBlogLikes, totalBlogComments,
        mostViewedBlog: mostViewedBlog ? { title: mostViewedBlog.title, views: mostViewedBlog.views, author: mostViewedBlog.author?.name || 'Unknown' } : null,
        mostLikedBlog: mostLikedBlog ? { title: mostLikedBlog.title, likes: mostLikedBlog.likeCount, author: mostLikedBlog.author?.name || 'Unknown' } : null,
      },
      opportunities: {
        total: governmentJobs + privateJobs + scholarships + competitions,
        governmentJobs, privateJobs, scholarships, competitions,
      },
      resources: {
        total: await safeCount(Resource),
        totalClassNotes,
        totalDownloads: resourceStats,
        totalViews: resourceViews,
        mostDownloaded: mostDownloadedResource ? { title: mostDownloadedResource.title, downloads: mostDownloadedResource.downloads, uploadType: mostDownloadedResource.uploadType, category: mostDownloadedResource.category } : null,
        recentUploads,
      },
      mentorship: {
        totalSessions: totalMentorSessions,
        completedSessions,
        upcomingSessions: totalUpcomingMentorSessions,
        activeMentors,
        studentsMentored,
      },
      collaboration: {
        totalPosts: totalCollabPosts,
        active: activeCollabs,
        completed: completedCollabs,
      },
      notifications: {
        total: totalNotifications,
        read: readNotifications,
        unread: unreadNotifications,
        readRate: totalNotifications > 0 ? Math.round((readNotifications / totalNotifications) * 100) : 0,
      },
      announcements: {
        total: totalAnnouncements,
        active: activeAnnouncements,
        expired: expiredAnnouncements,
      },
      studyPlanner: {
        ...studyPlannerData,
        weeklyCompletionRate,
      },
      charts: {
        dailyActivity,
        monthlyRegistrations,
        userDistribution,
        opportunityDistribution,
        communityActivity: communityActivityData,
        studyPlannerCompletion,
      },
      insights,
      meta: {
        range,
        startDate: dateStart.toISOString(),
        endDate: now.toISOString(),
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics critical error:', error);
    res.status(500).json({ error: 'Failed to load analytics data', details: error.message });
  }
};

// ─── SECTION: Users ───
const getAnalyticsUsers = async (req, res) => {
  try {
    const { todayStart, weekAgo, monthAgo } = getDateRange(req);

    const [totalStudents, totalAlumni, totalAdmins, todayStudents, todayAlumni, weekStudents, weekAlumni, monthStudents, monthAlumni, dailyLogins, weeklyLogins, monthlyLogins, activeUsersToday, totalLogins] = await Promise.all([
      safeCount(User, { role: 'student' }),
      safeCount(User, { role: 'alumni' }),
      safeCount(User, { role: 'admin' }),
      safeCount(User, { role: 'student', createdAt: { $gte: todayStart } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: todayStart } }),
      safeCount(User, { role: 'student', createdAt: { $gte: weekAgo } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: weekAgo } }),
      safeCount(User, { role: 'student', createdAt: { $gte: monthAgo } }),
      safeCount(User, { role: 'alumni', createdAt: { $gte: monthAgo } }),
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: todayStart } }),
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: weekAgo } }),
      safeCount(LoginHistory, { action: 'login', success: true, createdAt: { $gte: monthAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: todayStart } }).catch(() => 0),
      safeCount(LoginHistory, { action: 'login', success: true }),
    ]);

    const topDepartments = await safeAggregate(User, [
      { $match: { department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const recentLogins = await safeAggregate(LoginHistory, [
      { $match: { action: 'login', success: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      { $project: { userName: '$userDoc.name', role: 1, device: 1, browser: 1, os: 1, createdAt: 1 } },
    ]);

    const loginByDevice = await safeAggregate(LoginHistory, [
      { $match: { action: 'login', success: true, createdAt: { $gte: monthAgo } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      overview: {
        totalStudents, totalAlumni, totalAdmins,
        totalUsers: totalStudents + totalAlumni + totalAdmins,
        todayRegistrations: todayStudents + todayAlumni,
        todayStudents, todayAlumni,
        weekRegistrations: weekStudents + weekAlumni,
        monthRegistrations: monthStudents + monthAlumni,
        dailyLogins, weeklyLogins, monthlyLogins, activeUsersToday, totalLogins,
      },
      topDepartments,
      recentLogins,
      loginByDevice,
    });
  } catch (error) {
    console.error('Analytics users error:', error);
    res.status(500).json({ error: 'Failed to load user analytics' });
  }
};

// ─── SECTION: Community ───
const getAnalyticsCommunity = async (req, res) => {
  try {
    const { todayStart, weekAgo, monthAgo } = getDateRange(req);

    const [totalPosts, totalComments, totalReactions, todayPosts, todayComments, weekPosts, weekComments, monthPosts, monthComments] = await Promise.all([
      safeCount(CommunityPost),
      safeCount(CommunityComment),
      safeCount(CommunityReaction),
      safeCount(CommunityPost, { createdAt: { $gte: todayStart } }),
      safeCount(CommunityComment, { createdAt: { $gte: todayStart } }),
      safeCount(CommunityPost, { createdAt: { $gte: weekAgo } }),
      safeCount(CommunityComment, { createdAt: { $gte: weekAgo } }),
      safeCount(CommunityPost, { createdAt: { $gte: monthAgo } }),
      safeCount(CommunityComment, { createdAt: { $gte: monthAgo } }),
    ]);

    const [mostActiveStudent, mostActiveAlumni] = await Promise.all([
      safeAggregate(CommunityPost, [
        { $lookup: { from: 'users', localField: 'originalAuthor', foreignField: '_id', as: 'authorDoc' } },
        { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
        { $match: { 'authorDoc.role': 'student' } },
        { $group: { _id: '$originalAuthor', name: { $first: '$authorDoc.name' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 1 },
      ]),
      safeAggregate(CommunityPost, [
        { $lookup: { from: 'users', localField: 'originalAuthor', foreignField: '_id', as: 'authorDoc' } },
        { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
        { $match: { 'authorDoc.role': 'alumni' } },
        { $group: { _id: '$originalAuthor', name: { $first: '$authorDoc.name' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 1 },
      ]),
    ]);

    const categoryBreakdown = await safeAggregate(CommunityPost, [
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    let dailyActivity = [];
    try {
      const labels = buildDayLabels(30);
      const [recentPosts, recentComments] = await Promise.all([
        CommunityPost.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).select('createdAt').lean(),
        CommunityComment.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).select('createdAt').lean(),
      ]);
      const pMap = {}; const cMap = {};
      labels.forEach(l => { pMap[l] = 0; cMap[l] = 0; });
      recentPosts.forEach(doc => { const key = new Date(doc.createdAt).toISOString().slice(0, 10); if (pMap[key] !== undefined) pMap[key]++; });
      recentComments.forEach(doc => { const key = new Date(doc.createdAt).toISOString().slice(0, 10); if (cMap[key] !== undefined) cMap[key]++; });
      dailyActivity = labels.map(l => ({ date: l, posts: pMap[l], comments: cMap[l] }));
    } catch { dailyActivity = buildDayLabels(30).map(l => ({ date: l, posts: 0, comments: 0 })); }

    res.json({
      totalPosts, totalComments, totalReactions,
      todayPosts, todayComments,
      weekPosts, weekComments,
      monthPosts, monthComments,
      mostActiveStudent: mostActiveStudent[0] || null,
      mostActiveAlumni: mostActiveAlumni[0] || null,
      categoryBreakdown,
      dailyActivity,
    });
  } catch (error) {
    console.error('Analytics community error:', error);
    res.status(500).json({ error: 'Failed to load community analytics' });
  }
};

// ─── SECTION: Blogs ───
const getAnalyticsBlogs = async (req, res) => {
  try {
    const { todayStart, weekAgo, monthAgo } = getDateRange(req);

    const [totalBlogs, totalBlogLikes, totalBlogComments, todayBlogs, weekBlogs, monthBlogs] = await Promise.all([
      safeCount(Blog),
      safeCount(BlogLike),
      safeCount(BlogComment),
      safeCount(Blog, { createdAt: { $gte: todayStart } }),
      safeCount(Blog, { createdAt: { $gte: weekAgo } }),
      safeCount(Blog, { createdAt: { $gte: monthAgo } }),
    ]);

    const [mostViewedBlog, mostLikedBlog] = await Promise.all([
      safeFindOne(Blog, {}, { views: -1 }, 'title views', { field: 'author', select: 'name' }),
      safeFindOne(Blog, {}, { likeCount: -1 }, 'title likeCount', { field: 'author', select: 'name' }),
    ]);

    const categoryBreakdown = await safeAggregate(Blog, [
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalViews = await safeAggregate(Blog, [{ $group: { _id: null, total: { $sum: '$views' } } }]);

    let dailyActivity = [];
    try {
      const labels = buildDayLabels(30);
      const data = await safeAggregate(Blog, [
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      ]);
      const map = {};
      data.forEach(d => { map[d._id] = d.count; });
      dailyActivity = labels.map(l => ({ date: l, count: map[l] || 0 }));
    } catch { dailyActivity = buildDayLabels(30).map(l => ({ date: l, count: 0 })); }

    res.json({
      totalBlogs, totalBlogLikes, totalBlogComments,
      todayBlogs, weekBlogs, monthBlogs,
      totalViews: totalViews[0]?.total || 0,
      mostViewedBlog: mostViewedBlog ? { title: mostViewedBlog.title, views: mostViewedBlog.views, author: mostViewedBlog.author?.name || 'Unknown' } : null,
      mostLikedBlog: mostLikedBlog ? { title: mostLikedBlog.title, likes: mostLikedBlog.likeCount, author: mostLikedBlog.author?.name || 'Unknown' } : null,
      categoryBreakdown,
      dailyActivity,
    });
  } catch (error) {
    console.error('Analytics blogs error:', error);
    res.status(500).json({ error: 'Failed to load blog analytics' });
  }
};

// ─── SECTION: Resources ───
const getAnalyticsResources = async (req, res) => {
  try {
    const { weekAgo, monthAgo } = getDateRange(req);

    const [total, totalClassNotes, totalDownloads, totalViews, recentUploads, mostDownloaded] = await Promise.all([
      safeCount(Resource),
      safeCount(ClassNote),
      safeAggregate(Resource, [{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      safeAggregate(Resource, [{ $group: { _id: null, total: { $sum: '$views' } } }]),
      safeCount(Resource, { createdAt: { $gte: weekAgo } }),
      safeFindOne(Resource, {}, { downloads: -1 }, 'title downloads uploadType category'),
    ]);

    const categoryBreakdown = await safeAggregate(Resource, [
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const typeBreakdown = await safeAggregate(Resource, [
      { $group: { _id: '$uploadType', count: { $sum: 1 } } },
    ]);

    const topResources = await safeAggregate(Resource, [
      { $sort: { downloads: -1 } },
      { $limit: 5 },
      { $project: { title: 1, downloads: 1, views: 1, category: 1, uploadType: 1 } },
    ]);

    res.json({
      total, totalClassNotes,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      recentUploads,
      mostDownloaded: mostDownloaded ? { title: mostDownloaded.title, downloads: mostDownloaded.downloads, uploadType: mostDownloaded.uploadType, category: mostDownloaded.category } : null,
      categoryBreakdown,
      typeBreakdown,
      topResources,
    });
  } catch (error) {
    console.error('Analytics resources error:', error);
    res.status(500).json({ error: 'Failed to load resource analytics' });
  }
};

// ─── SECTION: Opportunities ───
const getAnalyticsOpportunities = async (req, res) => {
  try {
    const [governmentJobs, privateJobs, scholarships, competitions] = await Promise.all([
      safeCount(Opportunity, { type: 'Government Job' }),
      safeCount(Opportunity, { type: 'Private Job' }),
      safeCount(Opportunity, { type: 'Scholarship' }),
      safeCount(Opportunity, { type: 'Competition' }),
    ]);

    const recentOpportunities = await safeAggregate(Opportunity, [
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $project: { title: 1, type: 1, organization: 1, deadline: 1, createdAt: 1 } },
    ]);

    const expiringSoon = await safeAggregate(Opportunity, [
      { $match: { deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } } },
      { $sort: { deadline: 1 } },
      { $limit: 5 },
      { $project: { title: 1, type: 1, organization: 1, deadline: 1 } },
    ]);

    res.json({
      total: governmentJobs + privateJobs + scholarships + competitions,
      governmentJobs, privateJobs, scholarships, competitions,
      distribution: [
        { name: 'Government Jobs', value: governmentJobs, fill: '#3B82F6' },
        { name: 'Private Jobs', value: privateJobs, fill: '#8B5CF6' },
        { name: 'Scholarships', value: scholarships, fill: '#22C55E' },
        { name: 'Competitions', value: competitions, fill: '#F59E0B' },
      ],
      recentOpportunities,
      expiringSoon,
    });
  } catch (error) {
    console.error('Analytics opportunities error:', error);
    res.status(500).json({ error: 'Failed to load opportunity analytics' });
  }
};

// ─── SECTION: Study Planner ───
const getAnalyticsStudyPlanner = async (req, res) => {
  try {
    const { weekAgo } = getDateRange(req);

    let data = { totalStudents: 0, totalCourses: 0, totalWeeks: 0, completedWeeks: 0, pendingWeeks: 0, missedWeeks: 0, notesUploadedThisWeek: 0, mostActiveCourse: 'N/A' };

    try {
      const planners = await StudyPlanner.find({ isSetupComplete: true }).lean();
      data.totalStudents = planners.length;

      const courseMap = {};
      planners.forEach(planner => {
        planner.courses.forEach(course => {
          data.totalCourses++;
          const courseKey = course.courseName;
          let courseWeekCount = 0;
          (course.weeks || []).forEach(week => {
            data.totalWeeks++;
            if (week.status === 'completed' || week.notePdfUrl) {
              data.completedWeeks++;
              courseWeekCount++;
            } else if (week.endDate && new Date(week.endDate) < new Date()) {
              data.missedWeeks++;
            } else {
              data.pendingWeeks++;
            }
            if (week.noteUploadedAt && new Date(week.noteUploadedAt) >= weekAgo) {
              data.notesUploadedThisWeek++;
            }
          });
          courseMap[courseKey] = (courseMap[courseKey] || 0) + courseWeekCount;
        });
      });

      let maxCount = 0;
      Object.entries(courseMap).forEach(([name, count]) => {
        if (count > maxCount) { maxCount = count; data.mostActiveCourse = name; }
      });
    } catch (e) {
      console.error('StudyPlanner aggregation error:', e.message);
    }

    const weeklyCompletionRate = data.totalWeeks > 0 ? Math.round((data.completedWeeks / data.totalWeeks) * 100) : 0;

    res.json({
      ...data,
      weeklyCompletionRate,
      completion: [
        { name: 'Completed', value: data.completedWeeks, fill: '#22C55E' },
        { name: 'Pending', value: data.pendingWeeks, fill: '#3B82F6' },
        { name: 'Missed', value: data.missedWeeks, fill: '#EF4444' },
      ],
    });
  } catch (error) {
    console.error('Analytics study planner error:', error);
    res.status(500).json({ error: 'Failed to load study planner analytics' });
  }
};

// ─── SECTION: Mentorship ───
const getAnalyticsMentorship = async (req, res) => {
  try {
    const [completedSessions, upcomingSessions, activeMentors, studentsMentored, mentorshipCompleted, mentorshipUpcoming] = await Promise.all([
      safeCount(Session, { status: 'Completed' }),
      safeCount(Session, { status: { $in: ['Upcoming', 'Scheduled'] } }),
      Session.distinct('alumni', { status: { $ne: 'Cancelled' } }).then(ids => ids.length).catch(() => 0),
      Session.distinct('student').then(ids => ids.length).catch(() => 0),
      safeCount(MentorshipSession, { status: 'Completed' }),
      safeCount(MentorshipSession, { status: 'Upcoming' }),
    ]);

    const totalSessions = completedSessions + mentorshipCompleted;
    const totalUpcoming = upcomingSessions + mentorshipUpcoming;

    const topMentors = await safeAggregate(Session, [
      { $match: { status: 'Completed' } },
      { $group: { _id: '$alumni', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDoc' } },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$userDoc.name', sessionsCompleted: '$count' } },
    ]);

    res.json({
      totalSessions, completedSessions: completedSessions + mentorshipCompleted,
      upcomingSessions: totalUpcoming, activeMentors, studentsMentored,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      topMentors,
    });
  } catch (error) {
    console.error('Analytics mentorship error:', error);
    res.status(500).json({ error: 'Failed to load mentorship analytics' });
  }
};

// ─── SECTION: Collaboration ───
const getAnalyticsCollaboration = async (req, res) => {
  try {
    const [totalPosts, activePosts, closedPosts, totalApplications, acceptedApplications, pendingApplications] = await Promise.all([
      safeCount(CollaborationPost),
      safeCount(CollaborationPost, { status: 'active' }),
      safeCount(CollaborationPost, { status: 'closed' }),
      safeCount(CollaborationApplication),
      safeCount(CollaborationApplication, { status: 'accepted' }),
      safeCount(CollaborationApplication, { status: 'pending' }),
    ]);

    const domainBreakdown = await safeAggregate(CollaborationPost, [
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalPosts, activePosts, closedPosts,
      totalApplications, acceptedApplications, pendingApplications,
      domainBreakdown,
    });
  } catch (error) {
    console.error('Analytics collaboration error:', error);
    res.status(500).json({ error: 'Failed to load collaboration analytics' });
  }
};

// ─── SECTION: Notifications ───
const getAnalyticsNotifications = async (req, res) => {
  try {
    const [total, readCount, unreadCount] = await Promise.all([
      safeCount(Notification),
      safeCount(Notification, { isRead: true }),
      safeCount(Notification, { isRead: false }),
    ]);

    const typeBreakdown = await safeAggregate(Notification, [
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      total, read: readCount, unread: unreadCount,
      readRate: total > 0 ? Math.round((readCount / total) * 100) : 0,
      typeBreakdown,
    });
  } catch (error) {
    console.error('Analytics notifications error:', error);
    res.status(500).json({ error: 'Failed to load notification analytics' });
  }
};

// ─── SECTION: Announcements ───
const getAnalyticsAnnouncements = async (req, res) => {
  try {
    const [total, active, expired] = await Promise.all([
      safeCount(PlatformAnnouncement),
      safeCount(PlatformAnnouncement, { isActive: true }),
      safeCount(PlatformAnnouncement, { isActive: false }),
    ]);

    const categoryBreakdown = await safeAggregate(PlatformAnnouncement, [
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentAnnouncements = await safeAggregate(PlatformAnnouncement, [
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $project: { title: 1, category: 1, priority: 1, isPinned: 1, createdAt: 1 } },
    ]);

    res.json({
      total, active, expired,
      categoryBreakdown,
      recentAnnouncements,
    });
  } catch (error) {
    console.error('Analytics announcements error:', error);
    res.status(500).json({ error: 'Failed to load announcement analytics' });
  }
};

module.exports = {
  getAnalytics,
  getAnalyticsUsers,
  getAnalyticsCommunity,
  getAnalyticsBlogs,
  getAnalyticsResources,
  getAnalyticsOpportunities,
  getAnalyticsStudyPlanner,
  getAnalyticsMentorship,
  getAnalyticsCollaboration,
  getAnalyticsNotifications,
  getAnalyticsAnnouncements,
};
