const mongoose = require('mongoose');
const User = require('../models/User');
const CollaborationPost = require('../models/CollaborationPost');
const Activity = require('../models/Activity');

const COLLABORATION_POSTS = [
  {
    alumniEmail: 'arefin.rafi@std.uftb.ac.bd',
    alumniName: 'Arefin Rafi',
    title: 'AI-Based Student Career Recommendation System',
    type: 'Research Paper',
    domain: 'Artificial Intelligence',
    overview: "This project aims to build a machine learning-driven recommendation system that analyzes students' academic records, extracurricular interests, and skill assessments to suggest suitable career paths and job roles. It will explore collaborative filtering combined with content-based filtering, tailored to a real university student dataset.",
    whyItMatters: 'Many university students in Bangladesh lack access to personalized career counseling. A well-validated recommendation engine could help students make informed career decisions earlier and reduce career mismatch after graduation.',
    responsibilities: ['Literature Review', 'Data Collection', 'Data Analysis', 'Development', 'Testing', 'Report Writing'],
    requiredSkills: ['Python', 'Machine Learning', 'Recommendation Systems', 'Pandas', 'Scikit-learn'],
    experienceLevel: 'Intermediate',
    studentCount: 3,
    duration: '3 Months',
    outcomes: ['Research Publication', 'Portfolio Project', 'Certificate'],
    benefits: ['Hands-on Research Experience', 'Mentorship', 'Portfolio Development', 'Recommendation Letter'],
    deadline: new Date('2026-09-30T23:59:59.000Z')
  },
  {
    alumniEmail: 'naimul.islam@std.uftb.ac.bd',
    alumniName: 'Naimul Islam',
    title: 'Crop Disease Detection Using Machine Learning for Bangladeshi Farmers',
    type: 'Capstone Project',
    domain: 'Machine Learning',
    overview: 'Develop an image-classification model trained on photographs of common crop diseases affecting rice, jute, and vegetable crops in Bangladesh. The model will be optimized to run on low-cost smartphones so field agents and farmers can get instant diagnosis.',
    whyItMatters: 'Crop loss from undiagnosed disease is a major threat to smallholder farmer income. An accessible detection tool could reduce yield loss and support food security in rural areas.',
    responsibilities: ['Data Collection', 'Data Analysis', 'Development', 'Testing', 'Presentation'],
    requiredSkills: ['Python', 'TensorFlow/PyTorch', 'Computer Vision', 'Image Processing'],
    experienceLevel: 'Intermediate',
    studentCount: 4,
    duration: '4 Months',
    outcomes: ['Conference Paper', 'Research Publication', 'Portfolio Project'],
    benefits: ['Hands-on Research Experience', 'Publication Opportunity', 'Research Training', 'Networking'],
    deadline: new Date('2026-10-15T23:59:59.000Z')
  },
  {
    alumniEmail: 'sadia.hassan@std.uftb.ac.bd',
    alumniName: 'Sadia Hassan',
    title: 'Phishing & Fraud Detection for Bengali-Language Emails and SMS',
    type: 'Research Paper',
    domain: 'Cyber Security',
    overview: 'Build a detection pipeline for identifying phishing and financial-fraud attempts in Bengali-language emails and SMS messages. The project combines NLP feature extraction with classical and deep-learning classifiers.',
    whyItMatters: 'Digital financial fraud is an important cybersecurity challenge in Bangladesh, while many existing filters are primarily designed around English-language threats. This project aims to improve detection for Bengali-language communications.',
    responsibilities: ['Literature Review', 'Data Collection', 'Data Analysis', 'Development', 'Testing'],
    requiredSkills: ['Python', 'NLP', 'Bengali Text Processing', 'Machine Learning', 'Cyber Security Fundamentals'],
    experienceLevel: 'Advanced',
    studentCount: 2,
    duration: '3 Months',
    outcomes: ['Journal Publication', 'Research Publication', 'Certificate'],
    benefits: ['Hands-on Research Experience', 'Publication Opportunity', 'Mentorship', 'Research Training'],
    deadline: new Date('2026-09-25T23:59:59.000Z')
  },
  {
    alumniEmail: 'yousuf.sohan@std.uftb.ac.bd',
    alumniName: 'Yousuf Sohan',
    title: 'Analyzing Public Transport Patterns in Dhaka Using Open Data',
    type: 'Research Paper',
    domain: 'Data Science',
    overview: "Using publicly available GPS, ridership, and survey data, this project will map congestion hotspots and commuter behavior across Dhaka's bus and rickshaw network, producing visual dashboards and statistical models of peak-hour demand.",
    whyItMatters: 'Data-driven insights into transport patterns can support evidence-based urban planning and help inform smarter city policy.',
    responsibilities: ['Data Collection', 'Data Analysis', 'Report Writing', 'Presentation'],
    requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Statistics', 'GIS Tools'],
    experienceLevel: 'Beginner Friendly',
    studentCount: 3,
    duration: '2 Months',
    outcomes: ['Portfolio Project', 'Research Publication', 'Certificate'],
    benefits: ['Hands-on Research Experience', 'Portfolio Development', 'Networking', 'Research Training'],
    deadline: new Date('2026-10-05T23:59:59.000Z')
  },
  {
    alumniEmail: 'alvy.arnob@std.uftb.ac.bd',
    alumniName: 'Alvy Arnob',
    title: 'Smart Irrigation System for Small-Scale Farms',
    type: 'Capstone Project',
    domain: 'IoT',
    overview: 'Design and prototype a low-cost soil-moisture and weather-sensing IoT system that automates irrigation scheduling for small farm plots, with a companion mobile dashboard for remote monitoring.',
    whyItMatters: 'An affordable locally buildable IoT solution could improve agricultural efficiency while conserving water and energy.',
    responsibilities: ['Data Collection', 'Development', 'Testing', 'UI/UX Design', 'Presentation'],
    requiredSkills: ['Arduino/Raspberry Pi', 'Embedded C', 'Sensor Integration', 'Mobile App Development'],
    experienceLevel: 'Intermediate',
    studentCount: 4,
    duration: '4 Months',
    outcomes: ['Portfolio Project', 'Conference Paper', 'Certificate'],
    benefits: ['Hands-on Research Experience', 'Portfolio Development', 'Mentorship', 'Research Training'],
    deadline: new Date('2026-11-01T23:59:59.000Z')
  },
  {
    alumniEmail: 'mahim.khan@std.uftb.ac.bd',
    alumniName: 'Mahim Khan',
    title: 'Accessible E-Learning Portal for Visually Impaired Students',
    type: 'Thesis',
    domain: 'Web Development',
    overview: 'Build and evaluate a screen-reader-optimized, WCAG-compliant e-learning platform prototype, testing usability with visually impaired students to identify accessibility barriers in existing local EdTech tools.',
    whyItMatters: 'Improving accessibility can help ensure that visually impaired learners are not excluded from digital education opportunities.',
    responsibilities: ['Literature Review', 'Development', 'UI/UX Design', 'Testing', 'Report Writing'],
    requiredSkills: ['HTML/CSS', 'JavaScript', 'Accessibility Standards (WCAG)', 'React'],
    experienceLevel: 'Beginner Friendly',
    studentCount: 3,
    duration: '3 Months',
    outcomes: ['Portfolio Project', 'Research Publication', 'Certificate'],
    benefits: ['Hands-on Research Experience', 'Portfolio Development', 'Mentorship', 'Recommendation Letter'],
    deadline: new Date('2026-09-20T23:59:59.000Z')
  },
  {
    alumniEmail: 'shoccho.islam@std.uftb.ac.bd',
    alumniName: 'Shoccho Islam',
    title: 'AI Triage Chatbot for Rural Health Clinics',
    type: 'Research Paper',
    domain: 'Healthcare Technology',
    overview: 'Develop a conversational triage assistant that helps rural clinic staff prioritize patients based on reported symptoms, integrating a rule-based layer with a lightweight NLP model trained on common regional health complaints.',
    whyItMatters: 'Rural clinics often face staff shortages and long patient queues. A reliable triage tool could help allocate limited medical attention more effectively.',
    responsibilities: ['Literature Review', 'Data Collection', 'Development', 'Testing', 'Presentation'],
    requiredSkills: ['Python', 'NLP', 'Chatbot Frameworks', 'Healthcare Domain Knowledge'],
    experienceLevel: 'Intermediate',
    studentCount: 3,
    duration: '3 Months',
    outcomes: ['Research Publication', 'Conference Paper', 'Portfolio Project'],
    benefits: ['Hands-on Research Experience', 'Publication Opportunity', 'Research Training', 'Networking'],
    deadline: new Date('2026-10-20T23:59:59.000Z')
  }
];

const generateResearchId = () => {
  const prefix = 'RES';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const seed7AlumniCollaborations = async () => {
  try {
    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const data of COLLABORATION_POSTS) {
      // Find Alumni User
      let alumniUser = await User.findOne({
        $or: [
          { email: data.alumniEmail.toLowerCase() },
          { name: { $regex: new RegExp(`^${data.alumniName}$`, 'i') } }
        ]
      });

      if (!alumniUser) {
        console.log(`⚠️ Alumni user ${data.alumniName} (${data.alumniEmail}) not found. Skipping post "${data.title}".`);
        continue;
      }

      // Check if post already exists by title
      const existing = await CollaborationPost.findOne({ title: data.title });

      if (existing) {
        // Check if author linkage needs update
        if (String(existing.alumni) !== String(alumniUser._id)) {
          existing.alumni = alumniUser._id;
          await existing.save();
          console.log(`✏️ Updated author linkage for collaboration post: "${data.title}" -> Alumni ${alumniUser.name}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
        continue;
      }

      // Generate unique researchId
      let researchId;
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 20) {
        attempts++;
        researchId = generateResearchId();
        const dup = await CollaborationPost.findOne({ researchId });
        if (!dup) isUnique = true;
      }

      const post = await CollaborationPost.create({
        researchId,
        alumni: alumniUser._id,
        title: data.title,
        type: data.type,
        domain: data.domain,
        overview: data.overview,
        whyItMatters: data.whyItMatters,
        responsibilities: data.responsibilities,
        requiredSkills: data.requiredSkills,
        experienceLevel: data.experienceLevel,
        studentCount: data.studentCount,
        duration: data.duration,
        outcomes: data.outcomes,
        benefits: data.benefits,
        deadline: data.deadline,
        status: 'active'
      });

      // Create Global Activity
      try {
        await Activity.create({
          user: alumniUser._id,
          title: `published a new research collaboration: ${data.title}`,
          type: 'collaboration',
          color: 'bg-purple-100 text-purple-600',
          relatedId: post._id,
          isGlobal: true
        });
      } catch (actErr) {
        // Ignore duplicate activity errors
      }

      console.log(`✅ Created Alumni Collaboration Post: "${data.title}" by ${alumniUser.name} (${researchId})`);
      createdCount++;
    }

    console.log(`🎓 Alumni Collaborations Seeding Summary: Created=${createdCount}, Skipped=${skippedCount}, Updated=${updatedCount}`);
    return { createdCount, skippedCount, updatedCount };
  } catch (error) {
    console.error('❌ Error seeding Alumni Collaborations:', error);
  }
};

module.exports = seed7AlumniCollaborations;

if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontx_db')
    .then(async () => {
      await seed7AlumniCollaborations();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
