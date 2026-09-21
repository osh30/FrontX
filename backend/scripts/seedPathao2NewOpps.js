const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');

const OPPORTUNITY_TO_JOB_TYPE = {
  'Government Job': 'full-time',
  'Private Job': 'full-time',
  'Internship': 'internship',
  'Remote Job': 'remote',
  'Part-Time Job': 'part-time',
  'Scholarship': 'full-time',
  'Competition': 'full-time',
};

const PATHAO_OPPORTUNITIES = [
  {
    title: 'Software Engineering Intern',
    opportunityType: 'Internship',
    department: 'Educational Technology and Engineering',
    location: 'Dhaka, Bangladesh',
    employmentMode: 'Hybrid',
    vacancies: 5,
    salary: { min: 15000, max: 25000, currency: 'BDT' },
    deadline: new Date('2026-10-10T23:59:59.000Z'),
    joiningDate: new Date('2026-10-25T00:00:00.000Z'),
    description: {
      about: 'Pathao is looking for motivated Software Engineering Interns who are interested in building technology products and solving real-world problems. The intern will work with engineering and product teams and gain practical experience in software development, debugging, testing, documentation, and collaborative product development.',
      responsibilities: '• Assist in developing and maintaining software features.\n• Work with developers to understand and implement technical requirements.\n• Debug and troubleshoot application issues.\n• Write clean and maintainable code.\n• Participate in code reviews and team discussions.\n• Assist with testing and documentation.\n• Learn and work with modern software development tools and workflows.',
      requirements: '• Currently enrolled in an undergraduate program or recently graduated.\n• Basic programming knowledge.\n• Familiarity with at least one programming language.\n• Basic understanding of databases and web technologies.\n• Good problem-solving ability.\n• Good communication and teamwork skills.\n• Willingness to learn new technologies.',
      benefits: 'Hands-on project experience with real-world scale.\nProfessional mentorship from senior engineers.\nCertificate of internship completion.\nOpportunity for full-time conversion based on performance.'
    },
    eligibility: {
      minCgpa: '3.00',
      experienceRequired: 'No professional experience required.',
      eligibleDepartments: ['Educational Technology and Engineering'],
      eligibleGraduationYears: ['2026', '2027', '2028', '2029'],
      languageRequirements: ['English', 'Bangla']
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git/GitHub', 'MongoDB', 'REST API', 'Problem Solving', 'Communication', 'Teamwork']
  },
  {
    title: 'Junior Data Analyst',
    opportunityType: 'Private Job',
    department: 'Educational Technology and Engineering',
    location: 'Dhaka, Bangladesh',
    employmentMode: 'On-site',
    vacancies: 3,
    salary: { min: 35000, max: 50000, currency: 'BDT' },
    deadline: new Date('2026-10-20T23:59:59.000Z'),
    joiningDate: new Date('2026-11-05T00:00:00.000Z'),
    description: {
      about: 'Pathao is looking for Junior Data Analysts who can work with data to generate useful insights for business and product decisions. The role involves collecting, cleaning, analyzing, and presenting data while working with cross-functional teams.',
      responsibilities: '• Collect and organize business and operational data.\n• Clean and prepare datasets for analysis.\n• Perform exploratory data analysis.\n• Create reports and dashboards.\n• Identify trends and useful patterns from data.\n• Support product and business teams with data-driven insights.\n• Maintain proper documentation of analysis.\n• Collaborate with different teams to understand data requirements.',
      requirements: '• Bachelor\'s degree or final-year undergraduate student in a relevant field.\n• Basic knowledge of statistics and data analysis.\n• Familiarity with Excel or similar spreadsheet tools.\n• Basic SQL knowledge.\n• Understanding of data visualization.\n• Good analytical and problem-solving skills.\n• Good communication and teamwork skills.',
      benefits: 'Competitive entry-level salary.\nHealth & life insurance coverage.\nLearning and development budget.\nMentorship from experienced data science leads.'
    },
    eligibility: {
      minCgpa: '3.00',
      experienceRequired: '0–1 year',
      eligibleDepartments: ['Educational Technology and Engineering'],
      eligibleGraduationYears: ['2025', '2026', '2027'],
      languageRequirements: ['English', 'Bangla']
    },
    skills: ['Python', 'Pandas', 'SQL', 'Excel', 'Data Analysis', 'Statistics', 'Power BI / Tableau', 'Data Visualization', 'Problem Solving', 'Communication']
  }
];

const seedPathao2NewOpps = async () => {
  try {
    const localUri = 'mongodb://127.0.0.1:27017/frontx_db';
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(localUri);
      } catch (err) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
    }

    const recruiter = await User.findOne({ email: 'mahbub.alam@pathao.com' });
    if (!recruiter) {
      console.error('❌ Recruiter mahbub.alam@pathao.com NOT found in database.');
      return { success: false, error: 'Recruiter mahbub.alam@pathao.com not found' };
    }

    console.log(`✅ Found Recruiter: ${recruiter.name} (${recruiter.email}) ID: ${recruiter._id}`);

    const createdOpps = [];

    for (const oppData of PATHAO_OPPORTUNITIES) {
      const oppPayload = {
        ...oppData,
        recruiter: recruiter._id,
        companyId: recruiter._id,
        companyName: recruiter.companyName || 'Pathao Bangladesh',
        applicationMethod: 'Inside FrontX',
        visibility: ['student', 'alumni'],
        status: 'approved',
        createdByRole: 'recruiter',
        submittedAt: new Date()
      };

      let existingOpp = await Opportunity.findOne({
        recruiter: recruiter._id,
        title: oppData.title,
        opportunityType: oppData.opportunityType
      });

      if (existingOpp) {
        Object.assign(existingOpp, oppPayload);
        await existingOpp.save();
        console.log(`ℹ️ Existing Opportunity updated: "${existingOpp.title}" (${existingOpp._id})`);
        createdOpps.push(existingOpp);
      } else {
        existingOpp = await Opportunity.create(oppPayload);
        console.log(`✨ New Opportunity created: "${existingOpp.title}" (${existingOpp._id})`);
        createdOpps.push(existingOpp);
      }

      // Sync with Job model
      const jobPayload = {
        title: existingOpp.title,
        company: existingOpp.companyName,
        description: existingOpp.description?.about || '',
        requirements: existingOpp.skills || [],
        location: existingOpp.location || '',
        salaryRange: {
          min: existingOpp.salary?.min || 0,
          max: existingOpp.salary?.max || 0,
          currency: existingOpp.salary?.currency || 'BDT',
        },
        jobType: OPPORTUNITY_TO_JOB_TYPE[existingOpp.opportunityType] || 'full-time',
        experienceLevel: 'entry',
        postedBy: recruiter._id,
        deadline: existingOpp.deadline || undefined,
        isActive: true,
        linkedOpportunityId: existingOpp._id,
        opportunityType: existingOpp.opportunityType,
        eligibility: existingOpp.eligibility?.experienceRequired || '',
        applicationUrl: existingOpp.applicationUrl || ''
      };

      let existingJob = await Job.findOne({ linkedOpportunityId: existingOpp._id });
      if (existingJob) {
        Object.assign(existingJob, jobPayload);
        await existingJob.save();
      } else {
        await Job.create(jobPayload);
      }
    }

    return {
      success: true,
      recruiterId: recruiter._id,
      opportunities: createdOpps.map(o => ({ id: o._id, title: o.title, type: o.opportunityType }))
    };
  } catch (error) {
    console.error('❌ Error seeding Pathao 2 new opportunities:', error);
    return { success: false, error: error.message };
  }
};

if (require.main === module) {
  seedPathao2NewOpps().then(() => mongoose.disconnect());
}

module.exports = seedPathao2NewOpps;
