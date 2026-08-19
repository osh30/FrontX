const mongoose = require('mongoose');
const User = require('../models/User');
const MentorshipRequest = require('../models/MentorshipRequest');

const seedMubasshihraConnections = async () => {
  try {
    // 1. Find Alumni Mubasshihra Nahian
    const alumni = await User.findOne({
      $or: [
        { email: 'mubasshihra.nahian@std.uftb.ac.bd' },
        { name: { $regex: /Mubasshihra/i } }
      ]
    });

    if (!alumni) {
      console.log('⚠️ Alumni Mubasshihra Nahian not found. Skipping connections seed.');
      return;
    }

    console.log(`📌 Found Alumni: ${alumni.name} (${alumni._id})`);

    // 2. Ensure connection with Nur E Jannat is deleted so she can send new mentorship requests
    const jannatStudent = await User.findOne({ name: { $regex: /Nur E|Jannat/i } });
    if (jannatStudent) {
      const deleted = await MentorshipRequest.deleteMany({
        studentId: jannatStudent._id,
        alumniId: alumni._id
      });
      if (deleted.deletedCount > 0) {
        console.log(`🗑️ Removed ${deleted.deletedCount} connection(s) between ${alumni.name} and ${jannatStudent.name}`);
      }
    }

    // 3. Target Connected Students
    const studentQueries = [
      { key: 'Fariha Tasnim Nuha', regex: /Fariha/i }
    ];

    for (const item of studentQueries) {
      const student = await User.findOne({
        name: { $regex: item.regex }
      });

      if (!student) {
        console.log(`⚠️ Student "${item.key}" not found in User collection.`);
        continue;
      }

      console.log(`👤 Found User/Student: ${student.name} (${student._id})`);

      // Check existing connection
      const existing = await MentorshipRequest.findOne({
        studentId: student._id,
        alumniId: alumni._id
      });

      if (existing) {
        if (existing.status !== 'accepted') {
          existing.status = 'accepted';
          await existing.save();
          console.log(`✅ Updated existing connection status to ACCEPTED: ${alumni.name} ↔ ${student.name}`);
        } else {
          console.log(`✔ Connection already ACCEPTED: ${alumni.name} ↔ ${student.name}`);
        }
      } else {
        await MentorshipRequest.create({
          studentId: student._id,
          alumniId: alumni._id,
          studentName: student.name,
          studentDepartment: student.department || 'Educational Technology and Engineering',
          studentSession: student.session || '21-22',
          requestType: 'Career Guidance & Mentorship',
          message: 'Connected for career mentorship and guidance.',
          status: 'accepted',
          time: 'Anytime'
        });
        console.log(`🎉 Created new ACCEPTED connection: ${alumni.name} ↔ ${student.name}`);
      }
    }

    console.log('✅ Mubasshihra Nahian connections seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error seeding Mubasshihra Nahian connections:', error.message);
  }
};

module.exports = seedMubasshihraConnections;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seedMubasshihraConnections();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
