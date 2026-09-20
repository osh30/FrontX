const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const User = require('../models/User');

const GOVT_JOB_RECORDS = [
  {
    title: "Chittagong Port Authority (CPA) — 19 Posts",
    organization: "Chittagong Port Authority",
    opportunityType: "Government Job",
    description: "Chittagong Port Authority (CPA), under the Ministry of Shipping, operates the country's main sea port. This recruitment circular covers 19 vacancies across 9 categories, including Senior Medical Officer, Finance Officer, Lecturer (Bangla, History of Islam, and Statistics), Sub-Assistant Engineer, Senior Staff Nurse, and Pharmacist.",
    eligibility: "Education requirements vary by position, ranging from SSC to MBBS/Master's degree depending on the post.\n\nSalary: BDT 12,500–67,010 (Grade 6–11).\n\nAge limit: Maximum 35 years as of 19 October 2026.\n\nApplication fee: BDT 150/200 depending on the position.\n\nTotal vacancies: 19 posts across 9 categories.",
    deadlineDate: new Date("2026-10-19"),
    applyLink: "https://cpadigital.gov.bd/jobs"
  },
  {
    title: "Bangladesh Agricultural Research Institute (BARI) — 301 Posts",
    organization: "Bangladesh Agricultural Research Institute",
    opportunityType: "Government Job",
    description: "Bangladesh Agricultural Research Institute (BARI), under the Ministry of Agriculture, is recruiting 301 people across 34 categories. Positions include Librarian, Sub-Assistant Engineer, Scientific Assistant, Computer Operator, Office Assistant, Driver, Security Guard, and other roles.",
    eligibility: "Education requirements vary by position and include SSC, HSC, Diploma, and Bachelor's degree.\n\nSalary: BDT 8,250–38,640 (Grade 10–20).\n\nAge limit: 18–32 years as of 1 September 2026.\n\nApplication fee: BDT 56/112/168/223 depending on the position.\n\nTotal vacancies: 301 posts across 34 categories.",
    deadlineDate: new Date("2026-10-11"),
    applyLink: "https://bari.teletalk.com.bd"
  },
  {
    title: "Directorate of Livestock Services (DLS) — 538 Posts",
    organization: "Directorate of Livestock Services",
    opportunityType: "Government Job",
    description: "The Directorate of Livestock Services, under the Ministry of Fisheries and Livestock, is conducting a large recruitment drive covering 538 vacancies across two categories: 506 Office Support Staff positions and 32 Semen Carrier positions.",
    eligibility: "Educational qualification: SSC pass.\n\nSalary: BDT 8,250–20,570 (Grade 19–20).\n\nAge limit: 18–32 years as of 1 September 2026.\n\nApplication fee: BDT 56.\n\nTotal vacancies: 538 posts.",
    deadlineDate: new Date("2026-10-06"),
    applyLink: "https://dls.teletalk.com.bd"
  },
  {
    title: "Ministry of Labour and Employment (MOLE) — 15 Posts",
    organization: "Ministry of Labour and Employment",
    opportunityType: "Government Job",
    description: "The Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka, is recruiting for 15 vacancies across 4 categories, including Accountant, Stenographer-cum-Computer Operator, Office Assistant-cum-Computer Typist, and Office Support Staff.",
    eligibility: "Educational requirements vary by position and include SSC, HSC, and Bachelor's degree.\n\nTyping speed is required for relevant computer-related positions, including Bangla typing of approximately 20–25 words per minute and English typing of approximately 20–30 words per minute.\n\nAge limit: 18–32 years.\n\nApplication fee: BDT 56/112/168 depending on the position.\n\nTotal vacancies: 15 posts across 4 categories.",
    deadlineDate: new Date("2026-10-14"),
    applyLink: "https://mole.teletalk.com.bd"
  },
  {
    title: "Bangladesh Forest Industries Development Corporation (BFIDC) — 112 Posts",
    organization: "Bangladesh Forest Industries Development Corporation",
    opportunityType: "Government Job",
    description: "Bangladesh Forest Industries Development Corporation (BFIDC) is recruiting 112 people across 6 categories. The recruitment covers positions requiring qualifications ranging from HSC to Bachelor's degree.",
    eligibility: "Educational requirements vary by position and range from HSC to Bachelor's degree.\n\nAge limit: 18–32 years as of 1 September 2026.\n\nApplication fee: BDT 150 + BDT 18 Teletalk service charge, totaling BDT 168.\n\nTotal vacancies: 112 posts across 6 categories.",
    deadlineDate: new Date("2026-09-29"),
    applyLink: "http://bfidc.teletalk.com.bd"
  }
];

const seed5GovtJobs = async () => {
  try {
    let adminUser = await User.findOne({
      $or: [
        { role: 'admin' },
        { role: 'Admin' },
        { email: { $regex: 'admin', $options: 'i' } }
      ]
    });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin.system@std.uftb.ac.bd',
        password: 'adminpassword123',
        role: 'admin',
        department: 'Educational Technology and Engineering',
        status: 'approved'
      });
    }

    const adminId = adminUser._id;
    let insertedCount = 0;
    let updatedCount = 0;

    for (const rec of GOVT_JOB_RECORDS) {
      // Check for duplicate by title and organization/companyName
      let existing = await Opportunity.findOne({
        title: rec.title,
        companyName: rec.organization
      });

      if (!existing) {
        existing = await Opportunity.create({
          recruiter: adminId,
          companyId: adminId,
          companyName: rec.organization,
          title: rec.title,
          opportunityType: 'Government Job',
          description: { about: rec.description },
          eligibility: { experienceRequired: rec.eligibility },
          deadline: rec.deadlineDate,
          applicationUrl: rec.applyLink,
          status: 'active',
          visibility: ['student', 'alumni'],
          createdByRole: 'admin',
          featured: true
        });
        insertedCount++;
      } else {
        existing.companyName = rec.organization;
        existing.opportunityType = 'Government Job';
        existing.description = { about: rec.description };
        existing.eligibility = { experienceRequired: rec.eligibility };
        existing.deadline = rec.deadlineDate;
        existing.applicationUrl = rec.applyLink;
        existing.status = 'active';
        existing.visibility = ['student', 'alumni'];
        existing.createdByRole = 'admin';
        await existing.save();
        updatedCount++;
      }

      // Ensure Job model has matching document for student/alumni career feed
      const jobExisting = await Job.findOne({
        $or: [
          { linkedOpportunityId: existing._id },
          { title: rec.title, company: rec.organization }
        ]
      });

      if (jobExisting) {
        jobExisting.title = rec.title;
        jobExisting.company = rec.organization;
        jobExisting.opportunityType = 'Government Job';
        jobExisting.applicationUrl = rec.applyLink;
        jobExisting.eligibility = rec.eligibility;
        jobExisting.description = rec.description;
        jobExisting.jobType = 'full-time';
        jobExisting.deadline = rec.deadlineDate;
        jobExisting.isActive = true;
        jobExisting.linkedOpportunityId = existing._id;
        await jobExisting.save();
      } else {
        await Job.create({
          title: rec.title,
          company: rec.organization,
          opportunityType: 'Government Job',
          applicationUrl: rec.applyLink,
          eligibility: rec.eligibility,
          description: rec.description,
          requirements: [],
          location: 'Bangladesh',
          salaryRange: { min: 0, max: 0, currency: 'BDT' },
          jobType: 'full-time',
          experienceLevel: 'entry',
          postedBy: adminId,
          deadline: rec.deadlineDate,
          isActive: true,
          linkedOpportunityId: existing._id
        });
      }
    }

    console.log(`🏛️ Seeded 5 Government Jobs: ${insertedCount} inserted, ${updatedCount} existing updated.`);
    return { inserted: insertedCount, updated: updatedCount };
  } catch (error) {
    console.error('Error seeding 5 government jobs:', error);
    throw error;
  }
};

if (require.main === module) {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });

  const runStandalone = async () => {
    const uris = [
      process.env.MONGODB_URI,
      process.env.MONGO_URI,
      'mongodb://127.0.0.1:27017/frontx_db'
    ].filter(Boolean);

    for (const uri of uris) {
      try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for Government Job seeding');
        break;
      } catch (e) {}
    }

    await seed5GovtJobs();
    await mongoose.disconnect();
    process.exit(0);
  };

  runStandalone();
}

module.exports = seed5GovtJobs;
