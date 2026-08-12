const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const User = require('../models/User');

const SCHOLARSHIP_RECORDS = [
  {
    title: "Fulbright Foreign Student Program",
    organization: "U.S. Department of State (Bureau of Educational & Cultural Affairs) / IIE",
    description: "Fully funded Master's/PhD study or research at U.S. universities for 2 years max, covering tuition, airfare, living stipend, and health insurance.",
    eligibility: "Non-U.S. citizens/nationals applying through the Fulbright Commission/U.S. Embassy in their home country; no prior Fulbright grant recipients.",
    deadlineText: "Country-specific, typically Feb–Oct annually. Applicants should confirm the current deadline with the U.S. Embassy/Fulbright Commission in their country.",
    deadlineDate: new Date("2026-10-31"),
    applyLink: "https://foreign.fulbrightonline.org"
  },
  {
    title: "Chevening Scholarship",
    organization: "UK Foreign, Commonwealth & Development Office (FCDO)",
    description: "Fully funded one-year Master's degree at any UK university, covering tuition, monthly stipend, travel, and arrival/departure allowances.",
    eligibility: "Citizens of Chevening-eligible countries including Bangladesh; minimum 2 years' work experience (2,800 hours); bachelor's degree equivalent to UK 2:1; must apply to 3 UK courses; commit to returning home 2 years after.",
    deadlineText: "6 October 2026, 11:00 UTC (2027/28 intake).",
    deadlineDate: new Date("2026-10-06T11:00:00Z"),
    applyLink: "https://www.chevening.org"
  },
  {
    title: "DAAD EPOS Scholarship",
    organization: "German Academic Exchange Service (DAAD)",
    description: "Fully funded Master's/PhD programs in Germany for professionals from developing countries, in fields tied to national development.",
    eligibility: "Citizens of eligible developing countries including Bangladesh; degree in upper third of class; minimum 2 years' post-bachelor's professional experience; degree not older than 6 years.",
    deadlineText: "Program-specific, typically August–November 2026. Some tracks may have deadlines such as 15 October 2026. Applicants must check the individual program deadline.",
    deadlineDate: new Date("2026-11-15"),
    applyLink: "https://www.daad.de/en/study-and-research-in-germany/scholarships"
  },
  {
    title: "Commonwealth Scholarship (Master's/PhD)",
    organization: "Commonwealth Scholarship Commission (CSC), UK",
    description: "Fully funded Master's or PhD study in the UK, covering tuition, monthly stipend (£1,378+), return airfare, and grants, aimed at students who could not otherwise afford UK study.",
    eligibility: "Citizens/permanent residents of an eligible developing Commonwealth country including Bangladesh; minimum upper-second-class (2:1) honours degree; unable to afford UK study without support; apply via the country's National Nominating Agency.",
    deadlineText: "Expected around October 2026 through the agency-nominated route. Applicants should confirm with the national nominating agency.",
    deadlineDate: new Date("2026-10-31"),
    applyLink: "https://cscuk.fcdo.gov.uk"
  },
  {
    title: "Erasmus Mundus Joint Master's Degree (EMJMD)",
    organization: "European Union / Erasmus+ Programme",
    description: "Fully funded joint Master's degree studied across 2–4 European universities, covering tuition, travel, insurance, and a monthly living allowance.",
    eligibility: "Open to applicants of all nationalities and ages; no return-home requirement; each participating program sets its own entry criteria.",
    deadlineText: "Varies by program, typically November 2026–January 2027. Applicants must check the specific consortium deadline.",
    deadlineDate: new Date("2027-01-31"),
    applyLink: "https://erasmus-plus.ec.europa.eu/opportunities/erasmus-mundus-catalogue"
  },
  {
    title: "MEXT Japanese Government Scholarship — Embassy Recommendation",
    organization: "Ministry of Education, Culture, Sports, Science and Technology (MEXT), Japan",
    description: "Fully funded undergraduate, research, or graduate study in Japan, covering tuition, airfare, and a monthly stipend.",
    eligibility: "Applicants apply via the Japanese Embassy/Consulate in their home country, not directly to MEXT. Category-specific age and academic requirements apply.",
    deadlineText: "Typically April–May for the following intake. Exact date is set by the Japanese Embassy in the applicant's country.",
    deadlineDate: new Date("2027-05-31"),
    applyLink: "https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html"
  },
  {
    title: "Australia Awards Scholarship",
    organization: "Australian Government (Department of Foreign Affairs and Trade)",
    description: "Fully funded undergraduate/postgraduate study in Australia, covering tuition, return airfare, living expenses, and health cover.",
    eligibility: "Citizens of eligible partner countries including Bangladesh; IELTS 6.5 overall (6.0 for women/disability/marginalized groups); must meet institution's academic entry requirements.",
    deadlineText: "Typically opens 1 February and closes 30 April annually. The 2027 round is expected to reopen in early 2027. Applicants should check the Bangladesh country page.",
    deadlineDate: new Date("2027-04-30"),
    applyLink: "https://australiaawardsbangladesh.org"
  },
  {
    title: "Türkiye Bursları (Turkey Scholarships)",
    organization: "Presidency for Turks Abroad and Related Communities (YTB), Turkey",
    description: "Fully funded undergraduate, Master's, and PhD study in Turkey, covering tuition, dormitory housing, monthly stipend, health insurance, one-year Turkish language course, and flights.",
    eligibility: "Open to citizens of all countries except Turkey; minimum 70% for undergraduate and 75% for Master's/PhD; age limits apply by level.",
    deadlineText: "Expected 10 January–20 February 2027. Official 2027 dates should be confirmed when published.",
    deadlineDate: new Date("2027-02-20"),
    applyLink: "https://www.turkiyeburslari.gov.tr"
  },
  {
    title: "Global Korea Scholarship (GKS)",
    organization: "National Institute for International Education (NIIED), South Korea",
    description: "Fully funded undergraduate, Master's, and PhD study in South Korea, covering tuition, monthly stipend, airfare, and a one-year Korean language course.",
    eligibility: "Citizens of countries with diplomatic ties to Korea including Bangladesh; neither applicant nor parents may hold Korean citizenship; undergraduate applicants should meet the required academic performance criteria.",
    deadlineText: "Graduate track: typically February–April 2027. Undergraduate track: typically September–October 2026. Exact dates vary by Embassy/University track.",
    deadlineDate: new Date("2027-04-15"),
    applyLink: "https://www.studyinkorea.go.kr"
  },
  {
    title: "France Excellence Eiffel Scholarship",
    organization: "French Ministry for Europe and Foreign Affairs / Campus France",
    description: "Funds Master's and PhD study at French institutions, covering a monthly allowance (€1,200 Master's / €2,100 PhD), travel, insurance, and housing assistance.",
    eligibility: "Non-French nationals only; Master's applicants must meet the applicable age requirement and PhD applicants must meet the applicable age requirement; candidates must be nominated by a French institution and cannot apply directly.",
    deadlineText: "8 January 2027 for the institution submission. Internal institution deadlines may fall around October–November 2026.",
    deadlineDate: new Date("2027-01-08"),
    applyLink: "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program"
  },
  {
    title: "Swiss Government Excellence Scholarship",
    organization: "Swiss Confederation / Federal Commission for Scholarships (FCS/ESKAS)",
    description: "Funds PhD and postdoctoral research in Switzerland, covering a monthly stipend of approximately CHF 1,920–2,450, health insurance, and travel.",
    eligibility: "Open to applicants from 180+ countries; must hold a Master's degree or the required qualification for the relevant research track by the deadline; requires a Swiss academic supervisor's letter of support.",
    deadlineText: "Applications open 20 August 2026. Country-specific deadlines fall between September and December 2026.",
    deadlineDate: new Date("2026-12-15"),
    applyLink: "https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships-at-a-glance"
  },
  {
    title: "NL Scholarship",
    organization: "Dutch Ministry of Education, Culture and Science with participating Dutch universities",
    description: "One-time €5,000 grant toward a full-time Bachelor's or Master's program at a participating Dutch institution. This is not a full-tuition scholarship.",
    eligibility: "Non-EEA nationality including Bangladesh; applying for a full-time Bachelor's/Master's program at a participating institution; no prior Dutch degree.",
    deadlineText: "Institution-specific, typically February–June 2027. Applicants must check the participating university's deadline.",
    deadlineDate: new Date("2027-06-01"),
    applyLink: "https://www.studyinholland.nl/finances/nl-scholarship"
  },
  {
    title: "Vanier Canada Graduate Scholarship",
    organization: "Government of Canada in partnership with CIHR, NSERC, and SSHRC",
    description: "CAD $50,000 per year for 3 years toward a first PhD at a participating Canadian university, in eligible research fields.",
    eligibility: "Open to Canadian citizens, permanent residents, and international students; must be nominated by one Canadian institution with a Vanier quota; pursuing a first doctoral degree.",
    deadlineText: "University-level nomination deadlines vary. National deadline is expected around November 2026.",
    deadlineDate: new Date("2026-11-01"),
    applyLink: "https://vanier.gc.ca"
  },
  {
    title: "Gates Cambridge Scholarship",
    organization: "Gates Cambridge Trust, University of Cambridge",
    description: "Full-cost funding for eligible postgraduate study at the University of Cambridge, including tuition, approximately £21,000/year stipend, travel, visa fees, and health-related costs.",
    eligibility: "Citizens of any country outside the UK including Bangladesh; must be admitted to an eligible full-time Cambridge postgraduate course.",
    deadlineText: "International Round: December 2026 or January 2027 depending on the course. Applicants must check the Cambridge course directory.",
    deadlineDate: new Date("2027-01-15"),
    applyLink: "https://www.gatescambridge.org"
  },
  {
    title: "Aga Khan Foundation International Scholarship Programme (AKF ISP)",
    organization: "Aga Khan Foundation",
    description: "Postgraduate funding consisting of 50% grant and 50% low-interest loan for outstanding students from selected developing countries who have no other means of financing their studies.",
    eligibility: "Citizens of eligible countries including Bangladesh, India, Pakistan, Afghanistan, Kenya, and others; entering the first year of postgraduate study; preference may be given to applicants under 30 with leadership potential and no alternative funding.",
    deadlineText: "Cycle opens 1 January annually; deadline typically 31 March. The 2027 cycle is expected to open in January 2027.",
    deadlineDate: new Date("2027-03-31"),
    applyLink: "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships"
  }
];

const seed15Scholarships = async () => {
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
    let skippedCount = 0;

    for (const rec of SCHOLARSHIP_RECORDS) {
      // Check for duplicate by title and companyName/organization
      let existing = await Opportunity.findOne({
        title: rec.title,
        opportunityType: 'Scholarship'
      });

      if (!existing) {
        existing = await Opportunity.create({
          recruiter: adminId,
          companyId: adminId,
          companyName: rec.organization,
          title: rec.title,
          opportunityType: 'Scholarship',
          description: { about: `${rec.description}\n\nDeadline Details: ${rec.deadlineText}` },
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
        existing.description = { about: `${rec.description}\n\nDeadline Details: ${rec.deadlineText}` };
        existing.eligibility = { experienceRequired: rec.eligibility };
        existing.deadline = rec.deadlineDate;
        existing.applicationUrl = rec.applyLink;
        existing.status = 'active';
        existing.visibility = ['student', 'alumni'];
        existing.createdByRole = 'admin';
        await existing.save();
        skippedCount++;
      }

      // Ensure Job model has matching document
      const jobExisting = await Job.findOne({
        $or: [
          { linkedOpportunityId: existing._id },
          { title: rec.title }
        ]
      });

      if (jobExisting) {
        jobExisting.title = rec.title;
        jobExisting.company = rec.organization;
        jobExisting.opportunityType = 'Scholarship';
        jobExisting.applicationUrl = rec.applyLink;
        jobExisting.eligibility = rec.eligibility;
        jobExisting.description = `${rec.description}\n\nDeadline Details: ${rec.deadlineText}`;
        jobExisting.jobType = 'full-time';
        jobExisting.deadline = rec.deadlineDate;
        jobExisting.isActive = true;
        jobExisting.linkedOpportunityId = existing._id;
        await jobExisting.save();
      } else {
        await Job.create({
          title: rec.title,
          company: rec.organization,
          opportunityType: 'Scholarship',
          applicationUrl: rec.applyLink,
          eligibility: rec.eligibility,
          description: `${rec.description}\n\nDeadline Details: ${rec.deadlineText}`,
          requirements: [],
          location: 'International',
          salaryRange: { min: 0, max: 0, currency: 'USD' },
          jobType: 'full-time',
          experienceLevel: 'entry',
          postedBy: adminId,
          deadline: rec.deadlineDate,
          isActive: true,
          linkedOpportunityId: existing._id
        });
      }
    }

    console.log(`🎓 Seeded Scholarships: ${insertedCount} inserted, ${skippedCount} existing updated/skipped.`);
    return { inserted: insertedCount, skipped: skippedCount };
  } catch (error) {
    console.error('Error seeding scholarships:', error);
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
        console.log('✅ Connected to MongoDB for scholarship seeding');
        break;
      } catch (e) {}
    }

    await seed15Scholarships();
    await mongoose.disconnect();
    process.exit(0);
  };

  runStandalone();
}

module.exports = seed15Scholarships;
