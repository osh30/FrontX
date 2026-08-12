const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const updateDepartments = async () => {
  try {
    const uris = [
      process.env.MONGODB_URI,
      process.env.MONGO_URI,
      'mongodb://127.0.0.1:27017/frontx_db'
    ].filter(Boolean);

    for (const uri of uris) {
      try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        break;
      } catch (e) {}
    }

    // 1. Find Shanta
    const shantaUsers = await User.find({ name: { $regex: 'shanta', $options: 'i' } });
    console.log(`Found ${shantaUsers.length} user(s) matching 'shanta':`);
    for (const u of shantaUsers) {
      console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Dept: ${u.department}`);
      u.department = 'Educational Technology and Engineering';
      await u.save();
      console.log(`  └─ Updated ${u.name}'s department to Educational Technology and Engineering`);
    }

    // 2. Find any users with department 'EEE', 'CS', 'CSE' and update to 'Educational Technology and Engineering'
    const resEEE = await User.updateMany(
      { department: { $in: ['EEE', 'CS', 'CSE', 'Computer Science'] } },
      { $set: { department: 'Educational Technology and Engineering' } }
    );
    console.log(`Updated ${resEEE.modifiedCount} user(s) with EEE/CS departments to Educational Technology and Engineering.`);

    // 3. Verify distinct departments among alumni
    const distinctDepts = await User.distinct('department', { role: 'alumni' });
    console.log('Distinct Alumni Departments in DB:', distinctDepts);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
};

updateDepartments();
