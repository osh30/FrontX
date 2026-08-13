const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const cleanupDemoRecruiters = async () => {
  try {
    const uris = [
      process.env.MONGODB_URI,
      process.env.MONGO_URI,
      'mongodb://127.0.0.1:27017/frontx_db'
    ].filter(Boolean);

    for (const uri of uris) {
      try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

        // Delete demo recruiters created by seed script
        const demoEmails = [
          'hr@brainstation23.com',
          'careers@enosisbd.com',
          'recruitment@tigerit.com',
          'talent@bjitgroup.com',
          'e2e.recruiter@frontx.test'
        ];

        const res = await User.deleteMany({
          $or: [
            { email: { $in: demoEmails } },
            { isDemoRecruiter: true }
          ]
        });

        console.log(`✅ Removed ${res.deletedCount} demo recruiter account(s) from database.`);
        await mongoose.disconnect();
      } catch (err) {
        console.error('Cleanup error for URI:', err.message);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during demo recruiter cleanup:', error);
    process.exit(1);
  }
};

cleanupDemoRecruiters();
