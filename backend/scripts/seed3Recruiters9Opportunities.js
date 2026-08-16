const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const ensureRealRecruiters = require('./ensureRealRecruiters');

const SEED_DATA = [
  {
    recruiterEmail: 'recruitment@brac.net',
    companyName: 'BRAC',
    industryType: 'Social Development / Technology / NGO',
    companyWebsite: 'https://www.brac.net',
    companyDescription: 'BRAC is a global development organization working to create opportunities for people living in poverty and to support sustainable social and economic development. Its activities span areas including education, livelihoods, financial inclusion, healthcare, social development, and technology-enabled solutions.',
    companyLogo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80',
    opportunities: [
      {
        title: 'Technology & Digital Solutions Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 4,
        salary: { min: 12000, max: 18000, currency: 'BDT' },
        deadline: new Date('2026-09-30T23:59:59.000Z'),
        joiningDate: new Date('2026-10-15T00:00:00.000Z'),
        description: {
          about: 'Join a technology-focused internship where students can gain practical experience in digital solutions, documentation, research, and technology-supported development activities.',
          responsibilities: 'Support digital solution development activities.\nAssist with research and documentation.\nPrepare reports and presentations.\nSupport user requirement analysis.\nAssist with testing and documentation.\nCollaborate with technical and non-technical teams.',
          requirements: 'Current undergraduate student.\nInterest in technology and digital solutions.\nGood communication skills.\nBasic computer and productivity-tool knowledge.\nStrong willingness to learn.',
          benefits: 'Internship experience.\nProfessional mentorship.\nPractical project exposure.\nNetworking opportunities.\nInternship certificate according to organizational policy.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'No prior experience required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2027', '2028', '2029'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Communication', 'Research', 'Documentation', 'MS Office', 'Problem Solving', 'Teamwork']
      },
      {
        title: 'Junior Digital Project Coordinator',
        opportunityType: 'Private Job',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 2,
        salary: { min: 35000, max: 50000, currency: 'BDT' },
        deadline: new Date('2026-10-15T23:59:59.000Z'),
        joiningDate: new Date('2026-11-01T00:00:00.000Z'),
        description: {
          about: 'Support digital projects by coordinating project activities, documentation, communication, requirements, and progress tracking across different teams.',
          responsibilities: 'Coordinate project activities.\nMaintain project documentation.\nTrack project progress.\nAssist in requirement gathering.\nCommunicate with project stakeholders.\nPrepare project reports.\nSupport testing and implementation.',
          requirements: 'Bachelor\'s degree or final-year student.\nStrong organizational skills.\nGood communication.\nBasic project management knowledge.\nProblem-solving ability.',
          benefits: 'Professional development.\nProject experience.\nMentorship.\nCareer growth opportunities.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: '0–1 year',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2025', '2026', '2027'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Project Management', 'Communication', 'Documentation', 'MS Office', 'Teamwork']
      },
      {
        title: 'Data & Research Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'On-site',
        vacancies: 3,
        salary: { min: 15000, max: 15000, currency: 'BDT' },
        deadline: new Date('2026-11-05T23:59:59.000Z'),
        joiningDate: new Date('2026-11-20T00:00:00.000Z'),
        description: {
          about: 'Support research and data-related activities through data collection, cleaning, analysis, visualization, and documentation.',
          responsibilities: 'Collect and organize data.\nClean datasets.\nPrepare basic analysis.\nCreate charts and reports.\nSupport research documentation.\nAssist research team members.',
          requirements: 'Undergraduate student.\nBasic statistics knowledge.\nInterest in data analysis.\nGood analytical skills.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'Not required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2026', '2027', '2028'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Excel', 'Data Analysis', 'Statistics', 'Research', 'Communication']
      }
    ]
  },
  {
    recruiterEmail: 'recruitment@bkash.com',
    companyName: 'bKash Limited',
    industryType: 'FinTech / Technology',
    companyWebsite: 'https://www.bkash.com',
    companyDescription: 'bKash is a leading mobile financial services company in Bangladesh providing digital financial services that help individuals and businesses send, receive, save, pay, and manage money through technology-enabled financial solutions.',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
    opportunities: [
      {
        title: 'Software Engineering Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 5,
        salary: { min: 20000, max: 25000, currency: 'BDT' },
        deadline: new Date('2026-09-20T23:59:59.000Z'),
        joiningDate: new Date('2026-10-05T00:00:00.000Z'),
        description: {
          about: 'Work with technology teams and gain practical exposure to software development, testing, documentation, and digital product development.',
          responsibilities: 'Assist software development teams.\nSupport testing and debugging.\nDocument technical requirements.\nParticipate in team meetings.\nAssist with software development tasks.\nLearn existing development workflows.',
          requirements: 'Undergraduate student in a technology-related field.\nBasic programming knowledge.\nProblem-solving ability.\nGood teamwork skills.\nWillingness to learn.',
          benefits: 'Software development experience.\nProfessional mentorship.\nExposure to digital financial technology.\nInternship certificate according to company policy.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'No prior experience required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2027', '2028', '2029'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['JavaScript', 'Programming', 'Git', 'Problem Solving', 'Communication']
      },
      {
        title: 'Junior Product Analyst',
        opportunityType: 'Private Job',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 2,
        salary: { min: 40000, max: 55000, currency: 'BDT' },
        deadline: new Date('2026-10-10T23:59:59.000Z'),
        joiningDate: new Date('2026-11-01T00:00:00.000Z'),
        description: {
          about: 'Support product teams by analyzing user requirements, product performance, operational data, and opportunities for improving digital products.',
          responsibilities: 'Analyze product requirements.\nSupport product research.\nPrepare reports.\nAnalyze user and operational data.\nWork with cross-functional teams.\nAssist product improvement initiatives.',
          requirements: 'Bachelor\'s degree or final-year student.\nAnalytical mindset.\nGood communication skills.\nBasic knowledge of data analysis.\nStrong problem-solving ability.',
          benefits: 'Product development exposure.\nProfessional mentorship.\nCareer growth.\nTechnology industry experience.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: '0–1 year',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2025', '2026', '2027'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Data Analysis', 'Product Research', 'Excel', 'Communication', 'Problem Solving']
      },
      {
        title: 'UX Research Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 2,
        salary: { min: 18000, max: 22000, currency: 'BDT' },
        deadline: new Date('2026-10-25T23:59:59.000Z'),
        joiningDate: new Date('2026-11-10T00:00:00.000Z'),
        description: {
          about: 'Support user research and usability activities for digital products by collecting user feedback, analyzing findings, and helping teams improve user experience.',
          responsibilities: 'Support user interviews.\nPrepare research notes.\nAnalyze user feedback.\nAssist usability testing.\nPrepare research reports.\nSupport UX teams with documentation.',
          requirements: 'Interest in UX and digital products.\nGood communication.\nResearch ability.\nAnalytical thinking.\nBasic knowledge of UI/UX concepts.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'Not required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2026', '2027', '2028'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['UX Research', 'Communication', 'Research', 'Documentation', 'UI/UX']
      }
    ]
  },
  {
    recruiterEmail: 'recruitment@grameenphone.com',
    companyName: 'Grameenphone Ltd.',
    industryType: 'Telecommunications / Technology',
    companyWebsite: 'https://www.grameenphone.com',
    companyDescription: 'Grameenphone is a leading telecommunications and digital services company in Bangladesh, providing mobile connectivity, digital services, and technology-enabled solutions to millions of customers across the country.',
    companyLogo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=200&q=80',
    opportunities: [
      {
        title: 'Digital Technology Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 4,
        salary: { min: 15000, max: 20000, currency: 'BDT' },
        deadline: new Date('2026-09-30T23:59:59.000Z'),
        joiningDate: new Date('2026-10-15T00:00:00.000Z'),
        description: {
          about: 'Gain practical experience in digital technology, product development, documentation, testing, and technology-driven business solutions.',
          responsibilities: 'Assist digital technology teams.\nSupport testing and documentation.\nConduct basic research.\nPrepare reports.\nAssist project activities.\nCollaborate with team members.',
          requirements: 'Current undergraduate student.\nTechnology interest.\nGood communication.\nProblem-solving ability.\nTeamwork.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'Not required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2027', '2028', '2029'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Technology', 'Research', 'Documentation', 'Problem Solving', 'Teamwork']
      },
      {
        title: 'Junior Business Technology Analyst',
        opportunityType: 'Private Job',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'Hybrid',
        vacancies: 2,
        salary: { min: 40000, max: 60000, currency: 'BDT' },
        deadline: new Date('2026-10-20T23:59:59.000Z'),
        joiningDate: new Date('2026-11-10T00:00:00.000Z'),
        description: {
          about: 'Support technology-driven business initiatives through requirements analysis, documentation, data interpretation, and coordination with technical and business teams.',
          responsibilities: 'Analyze business and technology requirements.\nPrepare documentation.\nSupport project coordination.\nAnalyze operational data.\nAssist technology implementation activities.\nCommunicate with stakeholders.',
          requirements: 'Bachelor\'s degree or final-year student.\nAnalytical skills.\nGood communication.\nTechnology interest.\nStrong documentation skills.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: '0–1 year',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2025', '2026', '2027'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Business Analysis', 'Data Analysis', 'Documentation', 'Communication', 'Problem Solving']
      },
      {
        title: 'Data Analytics Intern',
        opportunityType: 'Internship',
        department: 'Educational Technology and Engineering',
        location: 'Dhaka, Bangladesh',
        employmentMode: 'On-site',
        vacancies: 3,
        salary: { min: 18000, max: 25000, currency: 'BDT' },
        deadline: new Date('2026-11-05T23:59:59.000Z'),
        joiningDate: new Date('2026-11-20T00:00:00.000Z'),
        description: {
          about: 'Support data analytics activities through data preparation, analysis, visualization, and reporting.',
          responsibilities: 'Collect and prepare datasets.\nPerform basic data analysis.\nCreate visualizations.\nPrepare reports.\nSupport analytics projects.\nDocument findings.',
          requirements: 'Undergraduate student.\nBasic statistics knowledge.\nInterest in data analytics.\nAnalytical thinking.\nGood communication.'
        },
        eligibility: {
          minCgpa: '3.00',
          experienceRequired: 'Not required',
          eligibleDepartments: ['Educational Technology and Engineering'],
          eligibleGraduationYears: ['2026', '2027', '2028'],
          languageRequirements: ['English', 'Bangla']
        },
        skills: ['Python', 'Excel', 'Data Analysis', 'Statistics', 'Data Visualization']
      }
    ]
  }
];

const seed3Recruiters9Opportunities = async () => {
  console.log('🚀 Running 3 Recruiters + Company Profiles + 9 Opportunities Seed...');
  
  // Ensure recruiters exist
  await ensureRealRecruiters();

  for (const cData of SEED_DATA) {
    const recruiter = await User.findOne({ email: cData.recruiterEmail.toLowerCase() });

    if (!recruiter) {
      console.error(`❌ Recruiter for ${cData.companyName} NOT found in database.`);
      continue;
    }

    // Update Company Profile
    recruiter.companyName = cData.companyName;
    recruiter.industryType = cData.industryType;
    recruiter.companyWebsite = cData.companyWebsite;
    recruiter.companyDescription = cData.companyDescription;
    if (!recruiter.companyLogo) recruiter.companyLogo = cData.companyLogo;
    recruiter.role = 'recruiter';
    recruiter.status = 'approved';
    await recruiter.save();

    console.log(`✅ Company Profile Updated for: ${cData.companyName} (Recruiter ID: ${recruiter._id})`);

    // Process Opportunities
    for (const oppInput of cData.opportunities) {
      const oppPayload = {
        ...oppInput,
        recruiter: recruiter._id,
        companyId: recruiter._id,
        companyName: cData.companyName,
        applicationMethod: 'Inside FrontX',
        visibility: ['student', 'alumni'],
        status: 'approved',
        createdByRole: 'recruiter',
        submittedAt: new Date()
      };

      let existingOpp = await Opportunity.findOne({
        recruiter: recruiter._id,
        title: oppInput.title,
        opportunityType: oppInput.opportunityType
      });

      if (existingOpp) {
        Object.assign(existingOpp, oppPayload);
        await existingOpp.save();
        console.log(` ℹ️ Opportunity Updated: ${oppInput.title} (${cData.companyName})`);
      } else {
        await Opportunity.create(oppPayload);
        console.log(` ✨ Opportunity Created: ${oppInput.title} (${cData.companyName})`);
      }
    }
  }

  console.log('🎉 3 Recruiters & 9 Opportunities seeding operation complete.');
};

module.exports = seed3Recruiters9Opportunities;

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
        await seed3Recruiters9Opportunities();
        await mongoose.disconnect();
      } catch (err) {
        console.error(`Connection error for ${uri}:`, err.message);
      }
    }
    process.exit(0);
  })();
}
