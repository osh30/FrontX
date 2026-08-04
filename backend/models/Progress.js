const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  careerScore: { type: Number, default: 0 },
  careerLevel: { type: String, default: 'Beginner' },
  xp: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  todaysProductivity: { type: Number, default: 0 },
  nextLevelXp: { type: Number, default: 500 },
  scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  growthTimeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  skillRadar: { type: mongoose.Schema.Types.Mixed, default: {} },
  weeklyProductivity: { type: [mongoose.Schema.Types.Mixed], default: [] },
  monthlyActivity: { type: [mongoose.Schema.Types.Mixed], default: [] },
  careerScoreTrend: { type: [mongoose.Schema.Types.Mixed], default: [] },
  heatmap: { type: mongoose.Schema.Types.Mixed, default: {} },
  milestones: { type: [mongoose.Schema.Types.Mixed], default: [] },
  achievements: { type: [mongoose.Schema.Types.Mixed], default: [] },
  careerJourney: { type: [mongoose.Schema.Types.Mixed], default: [] },
  thisMonth: { type: mongoose.Schema.Types.Mixed, default: {} },
  growth: { type: mongoose.Schema.Types.Mixed, default: {} },
  monthlySummary: { type: mongoose.Schema.Types.Mixed, default: {} },
  nextAction: { type: mongoose.Schema.Types.Mixed, default: null },
  performanceBreakdown: { type: [mongoose.Schema.Types.Mixed], default: [] },
  aiInsights: { type: [String], default: [] },
  learningAnalytics: { type: mongoose.Schema.Types.Mixed, default: {} },
  productivityCalendar: { type: [mongoose.Schema.Types.Mixed], default: [] },
  totalMilestones: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 },
  totalCertificates: { type: Number, default: 0 },
  timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  userProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastCalculated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
