const mongoose = require('mongoose');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

const NEXABYTE_RECRUITER = {
  name: 'Jannat Rahaman',
  email: 'znure563@gmail.com',
  companyName: 'NexaByte Solutions',
  role: 'recruiter',
  status: 'approved',
  industryType: 'Technology / Software',
  companyWebsite: 'https://nexabyte.example.com',
  companyAddress: 'Dhaka, Bangladesh',
  officeAddress: 'Dhaka, Bangladesh',
  companyDescription: 'NexaByte Solutions is a technology-focused company profile created for testing FrontX recruiter communication and opportunity workflows. The profile represents a software and digital solutions organization where students can explore technology-related career opportunities.',
  bio: 'Talent Acquisition Lead at NexaByte Solutions sourcing Junior Software Engineers and Product Associates.',
  companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=200&q=80'
};

const NEXABYTE_OPPORTUNITY = {
  title: 'Junior Software & Product Associate',
  opportunityType: 'Private Job',
  type: 'Private Job',
  category: 'Full-Time',
  department: 'Educational Technology and Engineering',
  location: 'Dhaka, Bangladesh',
  employmentMode: 'Hybrid',
  vacancies: 2,
  salary: 'BDT 30,000 – 45,000/month',
  deadline: new Date('2026-10-31'),
  joiningDate: new Date('2026-11-15'),
  minCgpa: 3.00,
  experience: '0–1 year',
  eligibleSessions: ['2025', '2026', '2027'],
  skills: [
    'Communication',
    'Problem Solving',
    'Programming',
    'Product Thinking',
    'Documentation',
    'Teamwork',
    'Basic Data Analysis'
  ],
  languages: ['English', 'Bangla'],
  description: `NexaByte Solutions is looking for a motivated Junior Software & Product Associate to support technology and digital product initiatives. The role provides an opportunity to work with cross-functional teams, contribute to product improvement activities, and gain practical experience in software and technology-driven projects.`,
  responsibilities: [
    'Support software and digital product initiatives.',
    'Assist with product research and documentation.',
    'Participate in testing and quality checks.',
    'Help analyze user requirements.',
    'Prepare technical and project documentation.',
    'Collaborate with development and product teams.',
    'Support day-to-day project activities.'
  ],
  requirements: [
    "Bachelor's degree or final-year undergraduate student in a relevant field.",
    'Minimum CGPA 3.00.',
    'Basic programming and technology knowledge.',
    'Good communication skills.',
    'Strong problem-solving ability.',
    'Ability to work collaboratively.'
  ],
  benefits: [
    'Practical technology experience.',
    'Product development exposure.',
    'Professional mentorship.',
    'Collaborative work environment.',
    'Career development opportunities.'
  ],
  applicationMethod: 'Inside FrontX',
  visibility: ['student', 'alumni'],
  status: 'approved',
  createdByRole: 'recruiter'
};

const seedNexaByteOpportunity = async () => {
  try {
    const emailLower = NEXABYTE_RECRUITER.email.toLowerCase();
    let recruiter = await User.findOne({ email: emailLower });
    let createdOrExisted = 'already existed';

    if (!recruiter) {
      recruiter = new User({
        ...NEXABYTE_RECRUITER,
        email: emailLower,
        password: 'RecruiterPassword123!'
      });
      await recruiter.save();
      createdOrExisted = 'newly created';
      console.log(`✅ Created Recruiter: ${recruiter.name} (${recruiter.companyName}) [${recruiter._id}]`);
    } else {
      recruiter.name = NEXABYTE_RECRUITER.name;
      recruiter.companyName = NEXABYTE_RECRUITER.companyName;
      recruiter.role = 'recruiter';
      recruiter.status = 'approved';
      if (NEXABYTE_RECRUITER.industryType) recruiter.industryType = NEXABYTE_RECRUITER.industryType;
      if (NEXABYTE_RECRUITER.companyWebsite) recruiter.companyWebsite = NEXABYTE_RECRUITER.companyWebsite;
      if (NEXABYTE_RECRUITER.companyDescription) recruiter.companyDescription = NEXABYTE_RECRUITER.companyDescription;
      if (!recruiter.bio) recruiter.bio = NEXABYTE_RECRUITER.bio;
      if (!recruiter.companyLogo) recruiter.companyLogo = NEXABYTE_RECRUITER.companyLogo;
      await recruiter.save();
      console.log(`✅ Verified Recruiter: ${recruiter.name} (${recruiter.companyName}) [${recruiter._id}]`);
    }

    // Check if Opportunity exists for NexaByte
    let existingOpp = await Opportunity.findOne({
      companyName: /NexaByte/i,
      title: /Junior Software & Product Associate/i
    });

    let oppCreatedOrExisted = 'already existed';

    if (!existingOpp) {
      existingOpp = await Opportunity.create({
        ...NEXABYTE_OPPORTUNITY,
        recruiter: recruiter._id,
        companyId: recruiter._id,
        companyName: recruiter.companyName,
        submittedAt: new Date()
      });
      oppCreatedOrExisted = 'newly created';
      console.log(`🚀 Created Opportunity: ${existingOpp.title} for NexaByte Solutions [${existingOpp._id}]`);
    } else {
      existingOpp.recruiter = recruiter._id;
      existingOpp.companyId = recruiter._id;
      existingOpp.status = 'approved';
      await existingOpp.save();
      console.log(`🚀 Verified Opportunity: ${existingOpp.title} for NexaByte Solutions [${existingOpp._id}]`);
    }

    return {
      recruiterStatus: createdOrExisted,
      recruiterId: recruiter._id,
      recruiterEmail: recruiter.email,
      companyName: recruiter.companyName,
      oppStatus: oppCreatedOrExisted,
      oppId: existingOpp._id
    };
  } catch (error) {
    console.error('Error seeding NexaByte recruiter & opportunity:', error.message);
    throw error;
  }
};

module.exports = seedNexaByteOpportunity;

if (require.main === module) {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontx_db';
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB.');
      const res = await seedNexaByteOpportunity();
      console.log('Seed Result:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Mongo Error:', err.message);
      process.exit(1);
    });
}
