const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const User = require('../models/User');

const IT_JOB_RECORDS = [
  {
    title: "Senior DevOps Engineer",
    organization: "Enosis Solutions",
    opportunityType: "Private Job",
    description: "Enosis Solutions is a well-established software consulting company that builds custom software solutions for US and European clients. This Senior DevOps Engineer role focuses on CI/CD, infrastructure automation, deployment processes, and reliable software delivery. The position is remote.",
    eligibility: "Experience: 2+ years of hands-on DevOps experience.\n\nSalary: BDT 85,000–120,000 per month.\n\nWork arrangement: Remote.\n\nThe candidate should have practical experience with DevOps practices, CI/CD pipelines, infrastructure automation, deployment, and related engineering workflows.",
    deadlineDate: new Date("2026-09-30"),
    applyLink: "https://enosisbd.pinpointhq.com"
  },
  {
    title: "Mid Level / Sr. SQA Engineer",
    organization: "QA Harbor Limited",
    opportunityType: "Private Job",
    description: "QA Harbor Limited is a dedicated quality assurance services company providing project-based testing and QA talent augmentation to clients. This Mid Level / Senior SQA Engineer position focuses on software quality assurance and testing activities. The position is onsite in Dhaka and is described as a rolling hiring opportunity.",
    eligibility: "Experience: 3+ years of experience in Quality Assurance.\n\nSalary: BDT 40,000–70,000 per month.\n\nWork arrangement: Onsite — Dhaka.\n\nPosition level: Mid Level / Senior.\n\nHiring status: Rolling / ongoing hiring.",
    deadlineDate: null,
    applyLink: "https://qaharbor.com"
  },
  {
    title: "QA Engineer (Automation & AI-Assisted Testing)",
    organization: "CarryBee HQ (A Concern of US-Bangla Airlines)",
    opportunityType: "Private Job",
    description: "CarryBee is a courier and logistics company under the US-Bangla Airlines group with a technology team working on delivery and tracking platforms. This QA Engineer role focuses on automation and AI-assisted testing, providing experience with modern quality assurance tools and testing workflows.",
    eligibility: "Experience: 1–2 years of experience in QA automation.\n\nPosition level: Mid Level.\n\nWork arrangement: Onsite — Dhaka.\n\nFocus areas: QA automation, software testing, test automation, and AI-assisted testing.",
    deadlineDate: null,
    applyLink: "https://carrybee.com/careers-listing/"
  },
  {
    title: "Quality Assurance Associate / Specialist",
    organization: "SuperAnnotate",
    opportunityType: "Private Job",
    description: "SuperAnnotate is an international AI data company focused on human-data and annotation infrastructure for AI models. The company has operations in Dhaka, including Mirpur DOHS. This Quality Assurance Associate / Specialist opportunity focuses on software quality assurance and provides exposure to the AI technology industry.",
    eligibility: "Experience: 2+ years of experience in Quality Assurance.\n\nSalary: BDT 35,000–50,000 per month.\n\nPosition level: Entry-level / Associate / Specialist.\n\nWork arrangement: Onsite — Mirpur DOHS, Dhaka.\n\nRelevant experience in software quality assurance and testing is required.",
    deadlineDate: null,
    applyLink: "https://www.superannotate.com/careers"
  },
  {
    title: "Software Engineer (Multiple Roles)",
    organization: "Mediusware Ltd.",
    opportunityType: "Private Job",
    description: "Mediusware Ltd. is a custom software development and outstaffing company operating across the USA and Bangladesh. The company has a development operation in Mohammadpur, Dhaka. Its engineering career path includes opportunities ranging from Junior Engineer through Senior Engineer and Technical Lead levels.",
    eligibility: "Experience: Requirements vary depending on the engineering level. Junior through Senior career tracks are available.\n\nSalary: BDT 40,000–70,000 per month depending on the position.\n\nWork arrangement: Onsite — Mohammadpur, Dhaka.\n\nCandidates should meet the technical and experience requirements applicable to the specific Software Engineer position.",
    deadlineDate: new Date("2026-09-30"),
    applyLink: "https://mediusware.com/career"
  }
];

const seed5ITJobs = async () => {
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

    for (const rec of IT_JOB_RECORDS) {
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
          opportunityType: 'Private Job',
          description: { about: rec.description },
          eligibility: { experienceRequired: rec.eligibility },
          deadline: rec.deadlineDate || null,
          applicationUrl: rec.applyLink,
          status: 'active',
          visibility: ['student', 'alumni'],
          createdByRole: 'admin',
          featured: true
        });
        insertedCount++;
      } else {
        existing.companyName = rec.organization;
        existing.opportunityType = 'Private Job';
        existing.description = { about: rec.description };
        existing.eligibility = { experienceRequired: rec.eligibility };
        existing.deadline = rec.deadlineDate || null;
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
        jobExisting.opportunityType = 'Private Job';
        jobExisting.applicationUrl = rec.applyLink;
        jobExisting.eligibility = rec.eligibility;
        jobExisting.description = rec.description;
        jobExisting.jobType = 'full-time';
        jobExisting.deadline = rec.deadlineDate || null;
        jobExisting.isActive = true;
        jobExisting.linkedOpportunityId = existing._id;
        await jobExisting.save();
      } else {
        await Job.create({
          title: rec.title,
          company: rec.organization,
          opportunityType: 'Private Job',
          applicationUrl: rec.applyLink,
          eligibility: rec.eligibility,
          description: rec.description,
          requirements: [],
          location: 'Bangladesh',
          salaryRange: { min: 0, max: 0, currency: 'BDT' },
          jobType: 'full-time',
          experienceLevel: 'entry',
          postedBy: adminId,
          deadline: rec.deadlineDate || null,
          isActive: true,
          linkedOpportunityId: existing._id
        });
      }
    }

    console.log(`💻 Seeded 5 Non-Government IT Jobs: ${insertedCount} inserted, ${updatedCount} existing updated.`);
    return { inserted: insertedCount, updated: updatedCount };
  } catch (error) {
    console.error('Error seeding 5 IT jobs:', error);
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
        console.log('✅ Connected to MongoDB for IT Job seeding');
        break;
      } catch (e) {}
    }

    await seed5ITJobs();
    await mongoose.disconnect();
    process.exit(0);
  };

  runStandalone();
}

module.exports = seed5ITJobs;
