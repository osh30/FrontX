const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const User = require('../models/User');

const COMPETITION_RECORDS = [
  {
    title: "ICT Olympiad Bangladesh (ICTOB) — Season 3",
    organization: "ICT Olympiad Bangladesh (in partnership with Classroom Bangladesh)",
    opportunityType: "Competition",
    description: "One of Bangladesh's annual ICT olympiads, open to participants from school level through university and madrasa level. Different competition segments are available depending on the participant's class or academic level. Registration is expected to open in September 2026, so participants should check the official website for the latest registration announcement and schedule.",
    eligibility: "Open to students from primary level through university/madrasa level\n\nDifferent segments are available depending on class/academic level\n\nExact competition dates should be checked from the official website\n\nParticipants should follow the official registration requirements published by ICT Olympiad Bangladesh",
    deadlineDate: null,
    applyLink: "https://www.ictolympiadbangladesh.com"
  },
  {
    title: "RevenueCat Shipaton 2026",
    organization: "RevenueCat",
    opportunityType: "Competition",
    description: "A global online app and game-building hackathon where participants build and ship a complete mobile application or game within the competition period. The event is online, allowing participants from Bangladesh to participate remotely.",
    eligibility: "Mobile app or game development interest/skills\n\nStudents and professionals can participate\n\nSolo or team participation\n\nOnline participation\n\nParticipants should follow the official competition rules and submission requirements",
    deadlineDate: new Date("2026-10-01"),
    applyLink: "https://dev.events/conferences/revenue-cat-shipaton-2026-g-k5hiw2"
  },
  {
    title: "Build with CMC: API Hackathon",
    organization: "CoinMarketCap (CMC)",
    opportunityType: "Competition",
    description: "A global online hackathon focused on building innovative applications, tools, and fintech/crypto projects using the CoinMarketCap API. Participants can use the competition to develop practical API and backend development skills while creating a portfolio project.",
    eligibility: "Interest in API and backend development\n\nBasic understanding of software development\n\nOnline participation\n\nParticipants should follow the official hackathon rules and submission requirements",
    deadlineDate: new Date("2026-10-01"),
    applyLink: "https://dev.events/conferences/build-with-cmc-api-hackathon-lnixqixh"
  },
  {
    title: "Arc Microgrants | Circle",
    organization: "Circle",
    opportunityType: "Competition",
    description: "A global online building challenge focused on project ideas and prototypes. Participants submit project concepts or prototypes for consideration and compete for microgrant-based funding opportunities.",
    eligibility: "Must have a project idea or prototype\n\nOnline submission\n\nParticipants should follow the official submission requirements\n\nProject details and eligibility should be checked from the official competition page",
    deadlineDate: new Date("2026-10-15"),
    applyLink: "https://dev.events/conferences/arc-microgrants-circle-bhhfueej"
  },
  {
    title: "Beyond the Benchmark: The Binance Agentic AI Challenge",
    organization: "Binance",
    opportunityType: "Competition",
    description: "A global online challenge focused on Agentic AI and AI agents capable of performing autonomous decision-making and task execution. The competition is suitable for participants interested in artificial intelligence, machine learning, and AI agent development.",
    eligibility: "Practical interest in Artificial Intelligence / Machine Learning\n\nBasic AI/ML development knowledge\n\nInterest in AI agents and autonomous systems\n\nOnline participation\n\nParticipants must follow the official challenge rules and submission requirements",
    deadlineDate: new Date("2026-11-13"),
    applyLink: "https://dev.events/conferences/beyond-the-benchmark-the-binance-agentic-ai-challenge-2etkews"
  }
];

const seed5Competitions = async () => {
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

    for (const rec of COMPETITION_RECORDS) {
      // Check for duplicate by opportunityType + title + organization
      let existing = await Opportunity.findOne({
        opportunityType: 'Competition',
        title: rec.title,
        companyName: rec.organization
      });

      if (!existing) {
        existing = await Opportunity.create({
          recruiter: adminId,
          companyId: adminId,
          companyName: rec.organization,
          title: rec.title,
          opportunityType: 'Competition',
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
        existing.opportunityType = 'Competition';
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
        jobExisting.opportunityType = 'Competition';
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
          opportunityType: 'Competition',
          applicationUrl: rec.applyLink,
          eligibility: rec.eligibility,
          description: rec.description,
          requirements: [],
          location: 'Global / Online',
          salaryRange: { min: 0, max: 0, currency: 'USD' },
          jobType: 'full-time',
          experienceLevel: 'entry',
          postedBy: adminId,
          deadline: rec.deadlineDate || null,
          isActive: true,
          linkedOpportunityId: existing._id
        });
      }
    }

    console.log(`🏆 Seeded 5 Competitions: ${insertedCount} inserted, ${updatedCount} existing updated.`);
    return { inserted: insertedCount, updated: updatedCount };
  } catch (error) {
    console.error('Error seeding 5 competitions:', error);
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
        console.log('✅ Connected to MongoDB for Competition seeding');
        break;
      } catch (e) {}
    }

    await seed5Competitions();
    await mongoose.disconnect();
    process.exit(0);
  };

  runStandalone();
}

module.exports = seed5Competitions;
