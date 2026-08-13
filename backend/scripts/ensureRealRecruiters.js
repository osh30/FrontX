const mongoose = require('mongoose');
const User = require('../models/User');

const REAL_RECRUITERS = [
  {
    name: 'Nusrat Jahan',
    email: 'nusrat2414@gmail.com',
    companyName: 'Robi Axiata PLC',
    role: 'recruiter',
    status: 'approved',
    bio: 'Talent Acquisition Partner connecting top tech candidates with career opportunities at Robi Axiata PLC.',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Zannatul Mawa',
    email: 'zannatul.mawa@technova.com',
    companyName: 'TechNova Solutions',
    role: 'recruiter',
    status: 'approved',
    bio: 'Talent Acquisition Partner connecting top tech candidates with career opportunities at TechNova Solutions.',
    companyLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  }
];

const ensureRealRecruiters = async () => {
  try {
    for (const rData of REAL_RECRUITERS) {
      let r = await User.findOne({
        $or: [
          { email: rData.email.toLowerCase() },
          { name: { $regex: new RegExp(`^${rData.name}$`, 'i') } }
        ]
      });

      if (!r) {
        r = await User.create({
          ...rData,
          password: 'RecruiterPassword123!'
        });
        console.log(`✅ Created Real Recruiter: ${r.name} (${r.companyName})`);
      } else {
        r.name = rData.name;
        r.companyName = rData.companyName;
        r.role = 'recruiter';
        r.status = 'approved';
        if (!r.bio) r.bio = rData.bio;
        if (!r.companyLogo) r.companyLogo = rData.companyLogo;
        await r.save();
        console.log(`✅ Verified Real Recruiter: ${r.name} (${r.companyName})`);
      }
    }
  } catch (error) {
    console.error('Error ensuring real recruiters:', error);
  }
};

module.exports = ensureRealRecruiters;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await ensureRealRecruiters();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
