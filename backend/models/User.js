const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin', 'recruiter'], default: 'student' },
  session: String,
  department: String,
  studentId: String,
  graduationYear: String,
  themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },

  // Recruiter-specific fields
  companyName: { type: String },
  designation: { type: String },
  industryType: { type: String },
  companyWebsite: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  officeAddress: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['unverified', 'verified'], default: 'unverified' },

  // Account status & verification flags
  // In DEMO mode (capstone development), status defaults to 'approved' for instant access.
  // In PRODUCTION, change default to 'pending' so recruiters require admin approval.
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'approved' },

  // Demo-mode flag: marks accounts created during the capstone dev phase.
  // Set to false or remove entirely when switching to production.
  isDemoRecruiter: { type: Boolean, default: false },

  // Account type: 'demo' for capstone dev, 'production' for live.
  // Toggle this via env or config when deploying to production.
  accountType: { type: String, enum: ['demo', 'production'], default: 'demo' },
  
  // Profile Additions
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  profileViews: { type: Number, default: 0 },
  interests: [{ type: String }],
  careerInterest: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  portfolioLink: { type: String, default: '' },
  
  projects: [{
    title: String,
    desc: String,
    tech: String,
    github: String,
    demo: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  research: [{
    title: String,
    desc: String,
    journal: String,
    topic: String,
    pdfUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  certificates: [{
    title: String,
    desc: String,
    org: String,
    link: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // Recruiter: saved candidates
  savedCandidates: [{
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    savedAt: { type: Date, default: Date.now }
  }],

  // Recruiter & Social additions
  linkedinLink: { type: String, default: '' },

  // Notification Preferences
  notificationSettings: {
    inApp: {
      newApplication: { type: Boolean, default: true },
      applicationStatusUpdates: { type: Boolean, default: true },
      interviewScheduled: { type: Boolean, default: true },
      interviewReminder: { type: Boolean, default: true },
      opportunityUpdates: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true }
    },
    email: {
      newApplication: { type: Boolean, default: true },
      interviewScheduled: { type: Boolean, default: true },
      interviewReminder: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      importantAccountNotifications: { type: Boolean, default: true }
    }
  },

  // Privacy & Visibility Settings
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'limited'], default: 'public' },
    showContactInfo: { type: Boolean, default: true },
    showCompanyInfo: { type: Boolean, default: true }
  },

  // Privacy
  recruiterVisible: { type: Boolean, default: true },

  lastLogin: { type: Date, default: null },
  loginCount: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: null },

  // Account deactivation (soft delete)
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Password hash
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);