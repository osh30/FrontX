const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

const seedShopUpOpportunities = async () => {
  const recruiterEmail = 'shabnam.m@shopup.com.bd';
  console.log(`🔍 Checking recruiter account for: ${recruiterEmail}`);

  let recruiter = await User.findOne({ email: recruiterEmail.toLowerCase() });

  if (!recruiter) {
    console.error(`❌ STOP: Recruiter account with email '${recruiterEmail}' was NOT found in the database.`);
    return {
      recruiterStatus: 'Not Found',
      companyStatus: 'Skipped',
      opp1Status: 'Skipped',
      opp2Status: 'Skipped'
    };
  }

  console.log(`✅ Found recruiter account: ${recruiter.name} (ID: ${recruiter._id})`);

  // PART 1 — UPDATE COMPANY PROFILE
  recruiter.companyName = 'ShopUp Bangladesh';
  recruiter.industryType = 'Technology / E-commerce / Logistics';
  recruiter.companyWebsite = 'https://shopup.org';
  recruiter.companyDescription = 'ShopUp is a technology-driven commerce platform in Bangladesh that helps businesses and entrepreneurs access digital commerce, logistics, and financial services. The platform focuses on enabling small and medium-sized businesses through technology, supply-chain solutions, and digital commerce infrastructure.';
  if (!recruiter.bio) {
    recruiter.bio = 'Senior HR & Technical Recruiter hiring Full-Stack Developers, Product Operations, and Data Engineers at ShopUp Bangladesh.';
  }
  if (!recruiter.officeAddress) {
    recruiter.officeAddress = 'Dhaka, Bangladesh';
  }
  if (!recruiter.companyAddress) {
    recruiter.companyAddress = 'Dhaka, Bangladesh';
  }
  if (!recruiter.companyLogo) {
    recruiter.companyLogo = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80';
  }
  recruiter.role = 'recruiter';
  recruiter.status = 'approved';

  await recruiter.save();
  console.log(`✅ Company Profile Updated for ShopUp Bangladesh (Recruiter ID: ${recruiter._id})`);

  // PART 2 — OPPORTUNITY 1: INTERNSHIP
  const opp1Data = {
    recruiter: recruiter._id,
    companyId: recruiter._id,
    companyName: 'ShopUp Bangladesh',
    title: 'Product Operations Intern',
    opportunityType: 'Internship',
    department: 'Educational Technology and Engineering',
    location: 'Dhaka, Bangladesh',
    employmentMode: 'Hybrid',
    vacancies: 3,
    salary: {
      min: 15000,
      max: 20000,
      currency: 'BDT'
    },
    deadline: new Date('2026-09-30T23:59:59.000Z'),
    joiningDate: new Date('2026-10-15T00:00:00.000Z'),
    description: {
      about: 'ShopUp is looking for motivated students interested in digital products, technology, business operations, and user-focused solutions. The internship will provide practical exposure to product operations and technology-driven business processes while allowing students to work with a professional team.',
      responsibilities: 'Assist the product and operations team with daily activities.\nSupport product research and documentation.\nAnalyze basic operational and user requirements.\nHelp prepare reports and presentations.\nCoordinate with internal teams when required.\nAssist in testing and documenting product improvements.\nSupport data collection and analysis.',
      requirements: 'Currently enrolled in an undergraduate program.\nInterest in technology and digital products.\nGood communication skills.\nStrong problem-solving ability.\nComfortable working in a team.\nWillingness to learn new tools and technologies.',
      benefits: 'Monthly internship stipend.\nPractical industry experience.\nProfessional mentorship.\nExposure to technology-driven business operations.\nNetworking opportunities.\nInternship certificate according to company policy.',
      additionalInfo: 'Selected candidates may be required to complete an interview or assessment before final selection.'
    },
    eligibility: {
      minCgpa: '3.00',
      eligibleDepartments: ['Educational Technology and Engineering'],
      eligibleGraduationYears: ['2027', '2028', '2029'],
      experienceRequired: 'No prior professional experience required',
      languageRequirements: ['English', 'Bangla']
    },
    skills: ['Communication', 'Problem Solving', 'Research', 'Documentation', 'Teamwork', 'MS Office', 'Basic Technology'],
    applicationMethod: 'Inside FrontX',
    visibility: ['student', 'alumni'],
    status: 'approved',
    createdByRole: 'recruiter',
    submittedAt: new Date()
  };

  let opp1Status = 'Created';
  let existingOpp1 = await Opportunity.findOne({
    recruiter: recruiter._id,
    title: opp1Data.title,
    opportunityType: opp1Data.opportunityType
  });

  if (existingOpp1) {
    console.log(`ℹ️ Opportunity 1 ('${opp1Data.title}') already exists for ShopUp. Updating fields...`);
    Object.assign(existingOpp1, opp1Data);
    await existingOpp1.save();
    opp1Status = 'Updated';
  } else {
    await Opportunity.create(opp1Data);
    console.log(`✅ Opportunity 1 ('${opp1Data.title}') successfully created.`);
  }

  // PART 2 — OPPORTUNITY 2: PRIVATE JOB
  const opp2Data = {
    recruiter: recruiter._id,
    companyId: recruiter._id,
    companyName: 'ShopUp Bangladesh',
    title: 'Junior Product Operations Executive',
    opportunityType: 'Private Job',
    department: 'Educational Technology and Engineering',
    location: 'Dhaka, Bangladesh',
    employmentMode: 'On-site',
    vacancies: 2,
    salary: {
      min: 30000,
      max: 45000,
      currency: 'BDT'
    },
    deadline: new Date('2026-10-15T23:59:59.000Z'),
    joiningDate: new Date('2026-11-01T00:00:00.000Z'),
    description: {
      about: 'ShopUp is looking for a detail-oriented Junior Product Operations Executive to support digital product operations, coordinate with internal teams, analyze operational requirements, and contribute to improving technology-driven business processes.',
      responsibilities: 'Coordinate product and operational activities.\nMonitor product-related issues and requirements.\nCommunicate with internal teams.\nAnalyze operational information and prepare reports.\nAssist in improving product workflows.\nSupport testing and implementation of product improvements.\nDocument operational processes and requirements.\nCollaborate with cross-functional teams.',
      requirements: 'Bachelor\'s degree or final-year undergraduate student in a relevant field.\nStrong communication and organizational skills.\nBasic understanding of digital products.\nAnalytical and problem-solving ability.\nAbility to work effectively in a team.\nGood command of English and Bangla.\nInterest in technology-driven business operations.',
      benefits: 'Competitive monthly salary.\nProfessional development opportunities.\nCareer growth opportunities.\nCollaborative work environment.\nIndustry exposure.\nEmployee benefits according to company policy.',
      additionalInfo: 'Shortlisted candidates may be required to participate in an interview and/or practical assessment.'
    },
    eligibility: {
      minCgpa: '3.00',
      eligibleDepartments: ['Educational Technology and Engineering'],
      eligibleGraduationYears: ['2025', '2026', '2027'],
      experienceRequired: '0–1 year',
      languageRequirements: ['English', 'Bangla']
    },
    skills: ['Communication', 'Product Operations', 'Problem Solving', 'Data Analysis', 'Documentation', 'Teamwork', 'MS Office'],
    applicationMethod: 'Inside FrontX',
    visibility: ['student', 'alumni'],
    status: 'approved',
    createdByRole: 'recruiter',
    submittedAt: new Date()
  };

  let opp2Status = 'Created';
  let existingOpp2 = await Opportunity.findOne({
    recruiter: recruiter._id,
    title: opp2Data.title,
    opportunityType: opp2Data.opportunityType
  });

  if (existingOpp2) {
    console.log(`ℹ️ Opportunity 2 ('${opp2Data.title}') already exists for ShopUp. Updating fields...`);
    Object.assign(existingOpp2, opp2Data);
    await existingOpp2.save();
    opp2Status = 'Updated';
  } else {
    await Opportunity.create(opp2Data);
    console.log(`✅ Opportunity 2 ('${opp2Data.title}') successfully created.`);
  }

  return {
    recruiterStatus: 'Found',
    companyStatus: 'Updated',
    opp1Status,
    opp2Status
  };
};

module.exports = seedShopUpOpportunities;

if (require.main === module) {
  const uris = [
    process.env.MONGODB_URI,
    'mongodb://127.0.0.1:27017/frontx_db'
  ].filter(Boolean);

  (async () => {
    for (const uri of uris) {
      try {
        await mongoose.connect(uri);
        console.log(`🔌 Connected to MongoDB: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        await seedShopUpOpportunities();
        await mongoose.disconnect();
      } catch (err) {
        console.error(`Connection error for ${uri}:`, err.message);
      }
    }
    process.exit(0);
  })();
}
