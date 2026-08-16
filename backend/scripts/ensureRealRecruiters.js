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
  },
  {
    name: 'Mahbub Alam',
    email: 'mahbub.alam@pathao.com',
    companyName: 'Pathao Bangladesh',
    role: 'recruiter',
    status: 'approved',
    bio: 'Lead Engineering Recruiter sourcing Software Engineers and Product Leads for Pathao.',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Shabnam Mustafa',
    email: 'shabnam.m@shopup.com.bd',
    companyName: 'ShopUp Bangladesh',
    role: 'recruiter',
    status: 'approved',
    bio: 'Senior HR & Technical Recruiter hiring Full-Stack Developers and Data Engineers.',
    companyLogo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'BRAC Recruitment Team',
    email: 'recruitment@brac.net',
    companyName: 'BRAC',
    role: 'recruiter',
    status: 'approved',
    industryType: 'Social Development / Technology / NGO',
    companyWebsite: 'https://www.brac.net',
    companyDescription: 'BRAC is a global development organization working to create opportunities for people living in poverty and to support sustainable social and economic development. Its activities span areas including education, livelihoods, financial inclusion, healthcare, social development, and technology-enabled solutions.',
    bio: 'Talent Acquisition & People Team driving social development and technology innovation at BRAC.',
    companyLogo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'bKash Recruitment Team',
    email: 'recruitment@bkash.com',
    companyName: 'bKash Limited',
    role: 'recruiter',
    status: 'approved',
    industryType: 'FinTech / Technology',
    companyWebsite: 'https://www.bkash.com',
    companyDescription: 'bKash is a leading mobile financial services company in Bangladesh providing digital financial services that help individuals and businesses send, receive, save, pay, and manage money through technology-enabled financial solutions.',
    bio: 'Engineering & HR Talent Lead for Mobile Financial Services at bKash Limited.',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Grameenphone Recruitment Team',
    email: 'recruitment@grameenphone.com',
    companyName: 'Grameenphone Ltd.',
    role: 'recruiter',
    status: 'approved',
    industryType: 'Telecommunications / Technology',
    companyWebsite: 'https://www.grameenphone.com',
    companyDescription: 'Grameenphone is a leading telecommunications and digital services company in Bangladesh, providing mobile connectivity, digital services, and technology-enabled solutions to millions of customers across the country.',
    bio: 'Technology & People Acquisition Lead for Digital Services at Grameenphone Ltd.',
    companyLogo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=200&q=80'
  }
];

const ensureRealRecruiters = async () => {
  try {
    for (const rData of REAL_RECRUITERS) {
      let r = await User.findOne({
        $or: [
          { email: rData.email.toLowerCase() },
          { name: { $regex: new RegExp(`^${rData.name}$`, 'i') } },
          { companyName: { $regex: new RegExp(`^${rData.companyName}$`, 'i') } }
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
        if (rData.industryType) r.industryType = rData.industryType;
        if (rData.companyWebsite) r.companyWebsite = rData.companyWebsite;
        if (rData.companyDescription) r.companyDescription = rData.companyDescription;
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
