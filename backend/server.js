const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('setup', (userData) => {
    const userId = userData && (userData.id || userData._id);
    if (!userId) return;
    socket.join(userId);
    onlineUsers.set(userId, { socketId: socket.id, status: 'online', lastSeen: new Date() });
    socket.emit('connected');
    socket.broadcast.emit('user:online', { userId, status: 'online' });
    console.log(`User ${userId} joined their room`);
  });

  socket.on('message:typing', ({ conversationId, userId, isTyping, receiverId }) => {
    if (receiverId) {
      socket.to(receiverId).emit('message:typing', { conversationId, userId, isTyping });
    }
  });

  socket.on('message:send', async (data) => {
    try {
      const Message = require('./models/Message');
      const Conversation = require('./models/Conversation');
      const Notification = require('./models/Notification');

      const msg = await Message.create({
        conversation: data.conversationId,
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content || '',
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null
      });

      const populated = await msg.populate('sender', 'name profilePicture');

      const conv = await Conversation.findById(data.conversationId);
      if (conv) {
        conv.lastMessage = data.content || data.fileName || '📎 File';
        conv.lastMessageSender = data.senderId;
        conv.lastMessageTime = new Date();
        await conv.save();
      }

      io.to(data.receiverId).emit('message:receive', populated.toObject());
      io.to(data.receiverId).emit('conversation:update', { conversationId: data.conversationId });

      await Notification.create({
        user: data.receiverId,
        senderUserId: data.senderId,
        title: 'New Message',
        message: `${data.senderName || 'Someone'} sent you a message`,
        type: 'message',
        relatedId: msg._id
      });
      io.to(data.receiverId).emit('notification:new', {
        title: 'New Message',
        message: `${data.senderName || 'Someone'} sent you a message`,
        type: 'message'
      });
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, info] of onlineUsers.entries()) {
      if (info.socketId === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user:offline', { userId, status: 'offline', lastSeen: new Date() });
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
// Production CORS: allowlist is driven by the CORS_ORIGINS env (comma-separated)
// so deployed frontends can be configured without redeploying code.
const defaultCorsOrigins = [
  'http://localhost:5173',
  'https://front-x-git-main-nures-projects-2f9a3173.vercel.app',
  'https://front-x-alpha.vercel.app'
];
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : defaultCorsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const initMeetings = require('./meetings');
initMeetings({ app, io });

// Import Models
const User = require('./models/User');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/alumni', require('./routes/alumniRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/collaboration', require('./routes/collaborationRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/deadlines', require('./routes/deadlineRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/mentorship-sessions', require('./routes/mentorshipSessionRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/learnings', require('./routes/learningRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/community-posts', require('./routes/communityPostRoutes'));
app.use('/api/ai-analysis', require('./routes/aiAnalysisRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/discussion', require('./routes/discussionRoutes'));
app.use('/api/study-planner', require('./routes/studyPlannerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/platform-announcements', require('./routes/platformAnnouncementRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));
app.use('/api/student/interviews', require('./routes/studentInterviewRoutes'));
app.use('/api/company-reviews', require('./routes/companyReviewRoutes'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/opportunities', require('./routes/opportunityDetails'));
app.use('/api/admin-resources', require('./routes/adminResourceRoutes'));

// Test Users Route
app.get("/api/test-users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "FrontX Server Running", status: "active" });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Turnstile Verification
app.post('/api/verify-turnstile', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token required' });
  }
  
  try {
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    
    const outcome = await result.json();
    
    if (outcome.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontx_db')
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");

    // Auto-seed 20 Alumni accounts if missing
    try {
      const autoSeedAlumni = require('./scripts/autoSeedAlumni');
      await autoSeedAlumni();
    } catch (seedErr) {
      console.error('Auto seed alumni failed (non-blocking):', seedErr.message);
    }

    // Backfill: sync unsynced admin-created Opportunities to Job model
    try {
      const Opportunity = require('./models/Opportunity');
      const Job = require('./models/Job');

      const OPPORTUNITY_TO_JOB_TYPE = {
        'Government Job': 'full-time',
        'Private Job': 'full-time',
        'Internship': 'internship',
        'Remote Job': 'remote',
        'Part-Time Job': 'part-time',
        'Scholarship': 'full-time',
        'Competition': 'full-time',
      };

      // Find admin users so we can migrate old opps they created (before createdByRole existed)
      const adminUsers = await User.find({ role: 'admin' }).select('_id').lean();
      const adminIds = adminUsers.map(u => u._id);

      if (adminIds.length > 0) {
        // Migrate old opps: any opp where recruiter is an admin but createdByRole is missing/wrong
        await Opportunity.updateMany(
          { recruiter: { $in: adminIds }, createdByRole: { $ne: 'admin' } },
          { $set: { createdByRole: 'admin', visibility: ['student', 'alumni'] } }
        );
      }

      // Now sync all admin opps (including newly migrated ones) to Job model
      const adminOpps = await Opportunity.find({ createdByRole: 'admin', status: 'active' }).lean();
      let synced = 0;

      for (const opp of adminOpps) {
        const existing = await Job.findOne({ linkedOpportunityId: opp._id }).lean();
        if (existing) continue;

        await Job.create({
          title: opp.title?.trim() || '',
          company: opp.companyName || 'Admin Posted',
          description: opp.description?.about || '',
          requirements: opp.skills || [],
          location: opp.location || '',
          salaryRange: {
            min: opp.salary?.min || 0,
            max: opp.salary?.max || 0,
            currency: opp.salary?.currency || 'BDT',
          },
          jobType: OPPORTUNITY_TO_JOB_TYPE[opp.opportunityType] || 'full-time',
          experienceLevel: 'entry',
          postedBy: opp.recruiter || opp.companyId,
          deadline: opp.deadline || undefined,
          isActive: true,
          linkedOpportunityId: opp._id,
        });
        synced++;
      }

      if (synced > 0) {
        console.log(`✅ Backfilled ${synced} admin opportunity/opportunities to Job model`);
      }
    } catch (backfillErr) {
      console.error('Backfill sync failed (non-blocking):', backfillErr.message);
    }
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    await transporter.sendMail({
      from: `"FrontX" <${process.env.EMAIL_USER}>`,
      to: 'your_test_email@gmail.com',  // আপনার ইমেইল দিন
      subject: 'Test Email from FrontX',
      html: '<h1>Test Successful!</h1><p>Your email configuration is working.</p>'
    });
    res.json({ success: true, message: 'Email sent!' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});