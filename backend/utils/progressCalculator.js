const User = require('../models/User');
const ClassNote = require('../models/ClassNote');
const MentorshipRequest = require('../models/MentorshipRequest');
const Session = require('../models/Session');
const MentorshipSession = require('../models/MentorshipSession');
const CommunityPost = require('../models/CommunityPost');
const SkillAnalysis = require('../models/SkillAnalysis');
const CollaborationApplication = require('../models/CollaborationApplication');
const Progress = require('../models/Progress');

const recalculateProgress = async (userId) => {
  try {
    const [user, notes, mentorships, sessions, groupSessions, communityPosts, analysis, acceptedCollaborations] = await Promise.all([
      User.findById(userId).select('-password'),
      ClassNote.find({ studentId: userId }),
      MentorshipRequest.find({ studentId: userId, status: { $in: ['accepted', 'completed'] } }),
      Session.find({ student: userId, status: 'Completed' }),
      MentorshipSession.find({ selectedStudents: userId, status: 'Completed' }),
      CommunityPost.find({ originalAuthor: userId }),
      SkillAnalysis.findOne({ userId }),
      CollaborationApplication.find({ student: userId, status: 'accepted' })
    ]);

    if (!user) return null;

    let activities = [];

    user.projects.forEach(p => {
      activities.push({ type: 'project', title: p.title, date: p.createdAt || user.createdAt });
    });
    user.certificates.forEach(c => {
      activities.push({ type: 'certificate', title: c.title, date: c.createdAt || user.createdAt });
    });
    acceptedCollaborations.forEach(ac => {
      activities.push({ type: 'research', title: 'Accepted Collaboration', date: ac.updatedAt || ac.createdAt });
    });
    notes.forEach(n => {
      activities.push({ type: 'note', title: n.title, date: n.createdAt });
    });
    mentorships.forEach(m => {
      activities.push({ type: 'mentorship', title: m.requestType || 'Mentorship Session', date: m.createdAt });
    });
    sessions.forEach(s => {
      activities.push({ type: 'session', title: s.title, date: s.createdAt || s.date });
    });
    groupSessions.forEach(gs => {
      activities.push({ type: 'group_session', title: gs.sessionTitle, date: gs.createdAt || gs.sessionDate });
    });
    communityPosts.forEach(cp => {
      activities.push({ type: 'community', title: 'Community Post', date: cp.createdAt });
    });

    activities.sort((a, b) => new Date(a.date) - new Date(b.date));
    activities = activities.filter(a => {
      const d = new Date(a.date);
      return !isNaN(d.getTime()) && d <= new Date();
    });

    const projectCount = user.projects.length;
    const certCount = user.certificates.length;
    const researchCount = acceptedCollaborations.length;
    const sessionCount = sessions.length + groupSessions.length;
    const mentorshipCount = mentorships.length;
    const noteCount = notes.length;
    const communityCount = communityPosts.length;

    const maxPerCategory = { projects: 200, certificates: 160, research: 160, sessions: 120, community: 100, notes: 80, aiAnalysis: 60, profileCompletion: 60, learningEngagement: 60 };
    const scores = {
      projects: Math.min(projectCount * 50, maxPerCategory.projects),
      certificates: Math.min(certCount * 40, maxPerCategory.certificates),
      research: Math.min(researchCount * 40, maxPerCategory.research),
      sessions: Math.min(sessionCount * 30, maxPerCategory.sessions),
      community: Math.min(communityCount * 20, maxPerCategory.community),
      notes: Math.min(noteCount * 20, maxPerCategory.notes),
      aiAnalysis: analysis ? 60 : 0,
      profileCompletion: Math.round(((user.bio ? 1 : 0) + (user.profilePicture ? 1 : 0) + (user.careerInterest ? 1 : 0) + (user.resumeUrl ? 1 : 0)) / 4 * 60),
      learningEngagement: Math.round(((user.careerInterest ? 1 : 0) + (user.resumeUrl ? 1 : 0)) / 2 * 60)
    };
    const careerScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const xp =
      projectCount * 100 +
      certCount * 75 +
      researchCount * 120 +
      sessionCount * 50 +
      mentorshipCount * 40 +
      communityCount * 30 +
      noteCount * 40 +
      (user.bio && user.profilePicture && user.resumeUrl && user.careerInterest ? 200 : 0) +
      (analysis ? 150 : 0);

    const levels = [
      { name: 'Beginner', minXp: 0 },
      { name: 'Explorer', minXp: 500 },
      { name: 'Contributor', minXp: 1000 },
      { name: 'Researcher', minXp: 2000 },
      { name: 'Collaborator', minXp: 3500 },
      { name: 'Leader', minXp: 5000 },
      { name: 'Mentor', minXp: 7500 }
    ];
    let careerLevel = levels[0].name;
    let nextLevel = levels[1];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].minXp) {
        careerLevel = levels[i].name;
        nextLevel = levels[i + 1] || levels[i];
        break;
      }
    }
    const nextLevelXp = nextLevel.minXp;

    const allStudents = await User.find({ role: 'student' }).select('projects certificates research');
    const studentXps = allStudents.map(s => {
      return (
        (s.projects?.length || 0) * 100 +
        (s.certificates?.length || 0) * 75 +
        (s.research?.length || 0) * 120
      );
    });
    studentXps.sort((a, b) => b - a);
    const rank = studentXps.findIndex(sxp => sxp <= xp) + 1;
    const totalStudents = studentXps.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysProductivity = activities.filter(a => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timelineMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      timelineMap[key] = { projects: 0, certificates: 0, research: 0, sessions: 0, community: 0, notes: 0, total: 0 };
    }
    activities.forEach(act => {
      const d = new Date(act.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (timelineMap[key]) {
        const cat = act.type === 'project' ? 'projects' :
                   act.type === 'certificate' ? 'certificates' :
                   act.type === 'research' ? 'research' :
                   (act.type === 'session' || act.type === 'group_session') ? 'sessions' :
                   act.type === 'community' ? 'community' :
                   act.type === 'note' ? 'notes' : null;
        if (cat && timelineMap[key][cat] !== undefined) {
          timelineMap[key][cat]++;
          timelineMap[key].total++;
        }
      }
    });
    const growthTimeline = Object.keys(timelineMap).map(key => ({ name: key, ...timelineMap[key] }));

    const skillRadar = analysis ? {
      communication: Math.min(Math.round((analysis.strengths?.filter(s => /communicat|present|speak|write/i.test(s)).length || 0) * 20 + 40), 100),
      programming: Math.min(Math.round((analysis.strengths?.filter(s => /program|code|develop|software|python|javascript|java/i.test(s)).length || 0) * 15 + 30), 100),
      leadership: Math.min(Math.round((analysis.strengths?.filter(s => /lead|manage|coordinat|supervis/i.test(s)).length || 0) * 20 + 30), 100),
      problemSolving: Math.min(Math.round((analysis.strengths?.filter(s => /problem|analyti|critical|solve/i.test(s)).length || 0) * 15 + 40), 100),
      research: Math.min(Math.round((analysis.strengths?.filter(s => /research|analy|data|experiment/i.test(s)).length || 0) * 15 + 30), 100),
      teamwork: Math.min(Math.round((analysis.strengths?.filter(s => /team|collaborat|cooperat/i.test(s)).length || 0) * 20 + 35), 100)
    } : { communication: 40, programming: 30, leadership: 25, problemSolving: 35, research: 20, teamwork: 30 };

    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const label = `W${Math.ceil((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / 604800000)}`;
      const weekActs = activities.filter(a => {
        const d = new Date(a.date);
        return d >= start && d < end;
      });
      weeks.push({
        week: label,
        projects: weekActs.filter(a => a.type === 'project').length,
        research: weekActs.filter(a => a.type === 'research').length,
        sessions: weekActs.filter(a => a.type === 'session' || a.type === 'group_session' || a.type === 'mentorship').length,
        resources: weekActs.filter(a => a.type === 'note').length,
        applications: weekActs.filter(a => a.type === 'community').length,
        certificates: weekActs.filter(a => a.type === 'certificate').length
      });
    }
    const weeklyProductivity = weeks;

    const monthlyActivityMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyActivityMap[key] = 0;
    }
    activities.forEach(act => {
      const d = new Date(act.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyActivityMap[key] !== undefined) monthlyActivityMap[key]++;
    });
    const monthlyActivity = Object.keys(monthlyActivityMap).map(key => ({ month: key, value: monthlyActivityMap[key] }));

    const scoreTrendMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      scoreTrendMap[key] = 0;
    }
    let cumulativeScore = 0;
    const sortedActivities = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));
    const monthKeys = Object.keys(scoreTrendMap);
    let actIdx = 0;
    monthKeys.forEach(key => {
      const parts = key.split(' ');
      const mIdx = monthNames.indexOf(parts[0]);
      const yr = 2000 + parseInt(parts[1]);
      const mStart = new Date(yr, mIdx, 1);
      const mEnd = new Date(yr, mIdx + 1, 1);
      while (actIdx < sortedActivities.length && new Date(sortedActivities[actIdx].date) < mEnd) {
        const a = sortedActivities[actIdx];
        if (a.type === 'project') cumulativeScore += 50;
        else if (a.type === 'certificate') cumulativeScore += 40;
        else if (a.type === 'research') cumulativeScore += 40;
        else if (a.type === 'session' || a.type === 'group_session') cumulativeScore += 30;
        else if (a.type === 'community') cumulativeScore += 20;
        else if (a.type === 'note') cumulativeScore += 20;
        actIdx++;
      }
      scoreTrendMap[key] = Math.min(cumulativeScore, 1000);
    });
    const careerScoreTrend = Object.keys(scoreTrendMap).map(key => ({ month: key, score: scoreTrendMap[key] }));

    const heatmapMap = {};
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    activities.forEach(act => {
      const actDate = new Date(act.date);
      if (actDate >= ninetyDaysAgo) {
        const dateStr = actDate.toISOString().split('T')[0];
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
      }
    });

    const milestones = [
      { id: 'profile-complete', title: 'Profile 100% Completed', completed: !!(user.bio && user.resumeUrl && user.profilePicture), icon: 'user' },
      { id: 'first-project', title: 'First Project', completed: projectCount > 0, icon: 'briefcase' },
      { id: 'first-certificate', title: 'First Certificate', completed: certCount > 0, icon: 'award' },
      { id: 'first-note', title: 'First Class Note', completed: noteCount > 0, icon: 'file' },
      { id: 'first-mentorship', title: 'First Mentorship Session', completed: mentorshipCount > 0 || sessionCount > 0, icon: 'users' },
      { id: 'research-contributor', title: 'Research Contributor', completed: researchCount > 0, icon: 'microscope' },
      { id: 'community-contributor', title: 'Community Contributor', completed: communityCount > 0, icon: 'message' },
      { id: 'five-projects', title: 'Five Projects', completed: projectCount >= 5, icon: 'target' }
    ];
    const totalMilestones = milestones.filter(m => m.completed).length;

    const achievements = [
      { id: 'first-project', title: 'First Project', desc: 'Upload your first project to your portfolio', unlocked: projectCount >= 1, date: user.projects[0]?.createdAt || null, icon: 'trophy' },
      { id: 'fast-learner', title: 'Fast Learner', desc: 'Complete 5 activities in your first month', unlocked: activities.filter(a => {
        const d = new Date(a.date);
        const firstMonth = new Date(user.createdAt);
        firstMonth.setMonth(firstMonth.getMonth() + 1);
        return d <= firstMonth;
      }).length >= 5, icon: 'rocket' },
      { id: 'profile-star', title: 'Profile Star', desc: 'Complete your profile with all details', unlocked: !!(user.bio && user.profilePicture && user.resumeUrl && user.careerInterest), icon: 'star' },
      { id: 'streak-30', title: '30 Day Streak', desc: 'Maintain activity for 30 consecutive days', unlocked: false, icon: 'flame' },
      { id: 'first-research', title: 'First Research', desc: 'Contribute to your first research', unlocked: researchCount >= 1, date: user.research[0]?.createdAt || null, icon: 'target' },
      { id: 'top-contributor', title: 'Top Contributor', desc: 'Reach top 10% among all students', unlocked: rank <= Math.ceil(totalStudents * 0.1), icon: 'crown' },
      { id: 'first-cert', title: 'Certificate Earned', desc: 'Earn your first certificate', unlocked: certCount >= 1, date: user.certificates[0]?.createdAt || null, icon: 'badge' },
      { id: 'mentorship-beginner', title: 'Mentorship Beginner', desc: 'Attend your first mentorship session', unlocked: sessionCount >= 1 || mentorshipCount >= 1, icon: 'handshake' }
    ];

    const careerJourney = levels.map((l, i) => ({
      level: l.name,
      minXp: l.minXp,
      completed: xp >= l.minXp,
      current: careerLevel === l.name
    }));

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    let pTm = 0, cTm = 0, sTm = 0, rTm = 0, nTm = 0, coTm = 0;
    let pLm = 0, cLm = 0, sLm = 0, rLm = 0, nLm = 0, coLm = 0;

    activities.forEach(act => {
      const actDate = new Date(act.date);
      const isThisMonth = actDate >= thisMonthStart;
      const isLastMonth = actDate >= lastMonthStart && actDate <= lastMonthEnd;
      const cat = act.type;
      if (isThisMonth) {
        if (cat === 'project') pTm++;
        else if (cat === 'certificate') cTm++;
        else if (cat === 'research') rTm++;
        else if (cat === 'session' || cat === 'group_session' || cat === 'mentorship') sTm++;
        else if (cat === 'note') nTm++;
        else if (cat === 'community') coTm++;
      } else if (isLastMonth) {
        if (cat === 'project') pLm++;
        else if (cat === 'certificate') cLm++;
        else if (cat === 'research') rLm++;
        else if (cat === 'session' || cat === 'group_session' || cat === 'mentorship') sLm++;
        else if (cat === 'note') nLm++;
        else if (cat === 'community') coLm++;
      }
    });

    const thisMonth = {
      projects: pTm, certificates: cTm, sessions: sTm, research: rTm, notes: nTm, community: coTm
    };
    const growth = {
      projects: pTm - pLm, certificates: cTm - cLm, sessions: sTm - sLm,
      research: rTm - rLm, notes: nTm - nLm, community: coTm - coLm
    };
    const monthlySummary = { projects: pTm, certificates: cTm, notes: nTm, mentorships: sTm };

    const meaningfulActivities = [...activities];
    if (user.updatedAt) {
      meaningfulActivities.push({ type: 'profile_update', date: user.updatedAt });
    }
    const activityDaysArray = Array.from(new Set(meaningfulActivities.map(act => {
      const d = new Date(act.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))).sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    if (activityDaysArray.length > 0) {
      let tempStreak = 1;
      let maxStreak = 1;
      for (let i = 0; i < activityDaysArray.length - 1; i++) {
        const diff = (activityDaysArray[i] - activityDaysArray[i + 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) { tempStreak++; if (tempStreak > maxStreak) maxStreak = tempStreak; }
        else tempStreak = 1;
      }
      longestStreak = maxStreak;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasToday = activityDaysArray.includes(todayStart.getTime());
      const hasYesterday = activityDaysArray.includes(yesterday.getTime());
      if (hasToday || hasYesterday) {
        let checkDate = hasToday ? todayStart : yesterday;
        currentStreak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (activityDaysArray.includes(checkDate.getTime())) currentStreak++;
          else break;
        }
      }
    }

    if (longestStreak >= 30) {
      const streakAchievement = achievements.find(a => a.id === 'streak-30');
      if (streakAchievement) streakAchievement.unlocked = true;
    }

    let nextAction = null;
    if (!user.bio || !user.profilePicture) {
      nextAction = { title: 'Complete Your Profile', desc: 'Add a profile picture and bio to improve your visibility.', buttonText: 'Go to Profile', target: 'profile' };
    } else if (!user.resumeUrl) {
      nextAction = { title: 'Upload Your CV', desc: 'A CV helps mentors and recruiters understand your background.', buttonText: 'Upload CV', target: 'profile' };
    } else if (projectCount === 0) {
      nextAction = { title: 'Add Your First Project', desc: 'Projects strengthen your portfolio and improve career opportunities.', buttonText: 'Add Project', target: 'profile' };
    } else if (certCount === 0) {
      nextAction = { title: 'Add Your Certifications', desc: 'Showcase your learning achievements and skills.', buttonText: 'Add Certificate', target: 'profile' };
    } else if (noteCount === 0) {
      nextAction = { title: 'Publish Your First Class Note', desc: 'Help other students by sharing useful academic notes.', buttonText: 'Publish Note', target: 'profile' };
    } else if (researchCount === 0) {
      nextAction = { title: 'Explore Research Collaborations', desc: 'Join active research opportunities and build experience.', buttonText: 'Explore', target: 'collaboration' };
    } else {
      nextAction = { title: "You're All Caught Up!", desc: 'You are doing an excellent job maintaining an active profile.', buttonText: 'Keep Exploring', target: 'dashboard' };
    }

    const breakdownTotal = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const performanceBreakdown = Object.entries(scores).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value,
      percentage: Math.round((value / breakdownTotal) * 100),
      color: key === 'projects' ? '#8b5cf6' :
             key === 'certificates' ? '#06b6d4' :
             key === 'research' ? '#f59e0b' :
             key === 'sessions' ? '#10b981' :
             key === 'community' ? '#ec4899' :
             key === 'notes' ? '#f97316' :
             key === 'aiAnalysis' ? '#6366f1' :
             key === 'profileCompletion' ? '#14b8a6' :
             '#a855f7'
    }));

    const aiInsights = [];
    if (user.profileViews > 0) aiInsights.push(`Your profile has been viewed ${user.profileViews} times. Visibility is growing!`);
    if (xp > 0) {
      const toNext = nextLevelXp - xp;
      if (toNext > 0) {
        aiInsights.push(`Complete ${Math.ceil(toNext / 100)} more projects or equivalent activities to unlock ${nextLevel.name} level.`);
      } else {
        aiInsights.push(`You've reached the ${careerLevel} level! Keep up the great work.`);
      }
    }
    if (projectCount > 0) aiInsights.push(`Upload another project to increase your Career Score by up to 50 points.`);
    if (rank > 0 && totalStudents > 0) {
      const percentile = Math.round((1 - rank / totalStudents) * 100);
      aiInsights.push(`You are among the top ${percentile}% active students.`);
    }
    if (analysis && analysis.careerReadinessScore > 0) {
      aiInsights.push(`Your AI Career Readiness Score is ${analysis.careerReadinessScore}%. ${analysis.careerReadinessScore >= 70 ? 'You are well-prepared for the job market!' : 'Focus on building more skills to improve readiness.'}`);
    }
    if (aiInsights.length === 0) aiInsights.push('Start adding activities to receive personalized career insights.');

    const totalSessionMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) +
      groupSessions.reduce((sum, gs) => sum + (gs.sessionDuration || 0), 0);
    const learningAnalytics = {
      hoursLearned: Math.round(totalSessionMinutes / 60) || 0,
      resourcesDownloaded: noteCount,
      sessionsAttended: sessionCount + mentorshipCount,
      certificatesEarned: certCount,
      researchParticipation: researchCount
    };

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const productivityCalendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayActs = activities.filter(a => {
        const d = new Date(a.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
      });
      const types = {};
      dayActs.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
      productivityCalendar.push({
        date: dateStr,
        day,
        count: dayActs.length,
        types: Object.keys(types).map(t => ({ type: t, count: types[t] }))
      });
    }

    const totalProjects = projectCount;
    const totalCertificates = certCount;

    const timeline = Object.keys(timelineMap).map(key => ({
      name: key,
      activities: timelineMap[key].total
    }));

    const progressData = {
      userId,
      careerScore,
      careerLevel,
      xp,
      rank,
      totalStudents,
      currentStreak,
      longestStreak,
      todaysProductivity,
      nextLevelXp,
      scoreBreakdown: scores,
      growthTimeline,
      skillRadar,
      weeklyProductivity,
      monthlyActivity,
      careerScoreTrend,
      heatmap: heatmapMap,
      milestones: milestones.map(m => ({
        title: m.title,
        status: m.completed ? 'Done' : 'Incomplete',
        unlocked: m.completed,
        icon: m.icon,
        color: m.completed ? 'text-emerald-500' : 'text-gray-400',
        bg: m.completed ? 'bg-emerald-100' : 'bg-gray-100'
      })),
      achievements,
      careerJourney,
      thisMonth,
      growth,
      monthlySummary,
      nextAction,
      performanceBreakdown,
      aiInsights,
      learningAnalytics,
      productivityCalendar,
      totalMilestones,
      totalProjects,
      totalCertificates,
      timeline,
      userProfile: {
        name: user.name,
        profilePicture: user.profilePicture,
        department: user.department,
        careerInterest: user.careerInterest,
        bio: user.bio
      },
      lastCalculated: new Date()
    };

    await Progress.findOneAndUpdate(
      { userId },
      { $set: progressData },
      { upsert: true, new: true }
    );

    return progressData;
  } catch (error) {
    console.error('Progress Recalculation Error:', error);
    return null;
  }
};

module.exports = { recalculateProgress };
