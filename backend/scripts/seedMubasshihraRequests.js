const mongoose = require('mongoose');
const User = require('../models/User');
const MentorshipRequest = require('../models/MentorshipRequest');

const seedMubasshihraRequests = async () => {
  try {
    // 1. Find Alumni Mubasshihra Nahian
    const alumni = await User.findOne({
      $or: [
        { email: 'mubasshihra.nahian@std.uftb.ac.bd' },
        { name: { $regex: /Mubasshihra/i } }
      ]
    });

    if (!alumni) {
      console.log('⚠️ Alumni Mubasshihra Nahian not found. Skipping pending requests seed.');
      return;
    }

    console.log(`📌 Found Alumni: ${alumni.name} (${alumni._id})`);

    // 2. Pending Request Definitions
    const pendingRequestsData = [
      {
        regex: /Goita/i,
        keyName: 'Goita Roy',
        message: 'Hello Apu, I would like to connect with you for mentorship and guidance regarding my academic and career goals.',
        requestType: 'Mentorship'
      },
      {
        regex: /Shuvo/i,
        keyName: 'Shuvo Kumar Achajro',
        message: 'Hello Apu, I would like to connect with you for mentorship and learn from your experience and career journey.',
        requestType: 'Mentorship'
      }
    ];

    for (const item of pendingRequestsData) {
      const student = await User.findOne({
        name: { $regex: item.regex }
      });

      if (!student) {
        console.log(`⚠️ Student "${item.keyName}" not found in User collection.`);
        continue;
      }

      console.log(`👤 Found Student: ${student.name} (${student._id})`);

      // Check existing mentorship request
      const existing = await MentorshipRequest.findOne({
        studentId: student._id,
        alumniId: alumni._id
      });

      if (existing) {
        if (existing.status !== 'pending' && existing.status !== 'accepted') {
          existing.status = 'pending';
          existing.message = item.message;
          existing.requestType = item.requestType;
          await existing.save();
          console.log(`✅ Updated mentorship request to PENDING: ${student.name} ➔ ${alumni.name}`);
        } else {
          console.log(`✔ Mentorship request already exists with status "${existing.status}": ${student.name} ➔ ${alumni.name}`);
        }
      } else {
        await MentorshipRequest.create({
          studentId: student._id,
          alumniId: alumni._id,
          studentName: student.name,
          studentDepartment: student.department || 'Educational Technology and Engineering',
          studentSession: student.session || '21-22',
          requestType: item.requestType,
          message: item.message,
          status: 'pending',
          time: 'Anytime'
        });
        console.log(`🎉 Created new PENDING mentorship request: ${student.name} ➔ ${alumni.name}`);
      }
    }

    // 3. Verify total pending requests for Mubasshihra
    const totalPending = await MentorshipRequest.countDocuments({
      alumniId: alumni._id,
      status: 'pending'
    });
    console.log(`📊 Total Pending Requests for ${alumni.name}: ${totalPending}`);

  } catch (error) {
    console.error('❌ Error seeding Mubasshihra pending requests:', error.message);
  }
};

module.exports = seedMubasshihraRequests;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seedMubasshihraRequests();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
