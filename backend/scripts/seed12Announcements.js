const mongoose = require('mongoose');
const PlatformAnnouncement = require('../models/PlatformAnnouncement');
const User = require('../models/User');

const announcementsList = [
  {
    title: 'Semester Registration Notice',
    category: 'Academic',
    priority: 'Important',
    description: 'Students are requested to complete their semester registration within the announced registration period. Please verify all course selections and contact the department office if any correction is required.',
    isPinned: true
  },
  {
    title: 'Midterm Examination Schedule',
    category: 'Academic',
    priority: 'Urgent',
    description: 'The midterm examination schedule has been published. Students should check their course-wise examination dates, prepare accordingly, and follow all examination guidelines.',
    isPinned: false
  },
  {
    title: 'Final Examination Preparation Notice',
    category: 'Academic',
    priority: 'Important',
    description: 'Students are advised to complete their course preparation, submit pending academic work, and regularly check the official examination updates before the final examination.',
    isPinned: false
  },
  {
    title: 'Career Development Workshop',
    category: 'Event',
    priority: 'Normal',
    description: 'FrontX is organizing a career development workshop covering CV preparation, interview skills, professional communication, and internship preparation. Students and alumni are encouraged to participate.',
    isPinned: false
  },
  {
    title: 'Research Collaboration Opportunity',
    category: 'General Notice',
    priority: 'Normal',
    description: 'Students interested in research are encouraged to explore the Research and Collaboration section, review available projects, and apply to suitable collaboration opportunities before the deadline.',
    isPinned: false
  },
  {
    title: 'Alumni Mentorship Session Update',
    category: 'Career',
    priority: 'Important',
    description: 'Students can connect with registered alumni through the mentorship section. Review available alumni profiles, send suitable connection requests, and attend scheduled mentorship sessions on time.',
    isPinned: false
  },
  {
    title: 'Internship Application Reminder',
    category: 'Internship',
    priority: 'Urgent',
    description: 'Students are reminded to review available internship opportunities and submit applications before the respective deadlines. Make sure that your profile, CV, and required documents are updated.',
    isPinned: false
  },
  {
    title: 'Student Profile Completion Notice',
    category: 'General Notice',
    priority: 'Normal',
    description: 'All students are requested to complete their FrontX profiles by adding academic information, skills, interests, CV, projects, and other relevant details to improve career and mentorship recommendations.',
    isPinned: false
  },
  {
    title: 'Study Planner and Weekly Notes Update',
    category: 'Academic',
    priority: 'Normal',
    description: 'Students should regularly check their Study Planner, follow weekly course requirements, and upload required notes within the assigned deadlines. Published notes may be visible to other registered students.',
    isPinned: false
  },
  {
    title: 'Resource Sharing Guidelines',
    category: 'General Notice',
    priority: 'Normal',
    description: 'Students and alumni can share useful academic resources through the Resource section. Upload only relevant educational materials and provide accurate titles, course information, and descriptions.',
    isPinned: false
  },
  {
    title: 'FrontX Community Guidelines',
    category: 'General Notice',
    priority: 'Important',
    description: 'All users are requested to maintain respectful communication, share meaningful content, avoid misleading information, and follow the FrontX community guidelines while interacting with other members.',
    isPinned: false
  },
  {
    title: 'Platform Maintenance and Update Notice',
    category: 'Maintenance',
    priority: 'Urgent',
    description: 'FrontX may occasionally undergo maintenance or feature updates to improve performance, security, and user experience. Users are advised to check the announcement section for important updates.',
    isPinned: false
  }
];

const seed12Announcements = async () => {
  let createdCount = 0;
  let skippedCount = 0;

  try {
    // Find an Admin user to assign as author/postedBy
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ email: /admin/i });
    }

    if (!admin) {
      console.log('⚠️ No admin account found. Skipping announcement seeding.');
      return { createdCount: 0, skippedCount: 0 };
    }

    for (const item of announcementsList) {
      const existing = await PlatformAnnouncement.findOne({
        title: { $regex: new RegExp(`^${item.title.trim()}$`, 'i') }
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      await PlatformAnnouncement.create({
        title: item.title,
        category: item.category,
        priority: item.priority,
        description: item.description,
        isPinned: item.isPinned,
        isActive: true,
        publishDate: new Date(),
        expiryDate: null,
        postedBy: admin._id
      });

      createdCount++;
      console.log(`📢 Created Platform Announcement: "${item.title}"`);
    }

    console.log(`📊 Announcements Seeding Complete: ${createdCount} created, ${skippedCount} skipped.`);
    return { createdCount, skippedCount };
  } catch (error) {
    console.error('❌ Error seeding announcements:', error.message);
    throw error;
  }
};

module.exports = seed12Announcements;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seed12Announcements();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
