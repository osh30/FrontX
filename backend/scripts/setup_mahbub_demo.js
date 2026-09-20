const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

const URIS = [
  process.env.MONGODB_URI,
  process.env.MONGO_URI,
  'mongodb://127.0.0.1:27017/frontx_db',
  'mongodb://127.0.0.1:27017/frontx'
].filter(Boolean);

const setupMahbubDemoData = async () => {
  const isStandAlone = require.main === module;
  let selfConnected = false;

  if (mongoose.connection.readyState !== 1) {
    for (const uri of URIS) {
      try {
        console.log(`Connecting to database: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ Successfully connected to MongoDB.`);
        selfConnected = true;
        break;
      } catch (err) {
        console.warn(`⚠️ Connection failed to ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}: ${err.message}`);
      }
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('ERROR: Could not connect to any MongoDB URI.');
      if (isStandAlone) process.exit(1);
      return;
    }
  }

  try {
    // 1. Find recruiter Mahbub Alam by email / name
    let recruiter = await User.findOne({
      $or: [
        { email: 'mahbub.alam@pathao.com' },
        { name: /Mahbub Alam/i, role: 'recruiter' }
      ]
    });

    if (!recruiter) {
      console.log('[-] Recruiter Mahbub Alam (mahbub.alam@pathao.com) not found in database. Creating user record...');
      recruiter = await User.create({
        name: 'Mahbub Alam',
        email: 'mahbub.alam@pathao.com',
        password: 'RecruiterPassword123!',
        companyName: 'Pathao Bangladesh',
        role: 'recruiter',
        status: 'approved',
        bio: 'Lead Engineering Recruiter sourcing Software Engineers and Product Leads for Pathao.',
        companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
      });
    }

    console.log(`\n=== RECRUITER ACCOUNT ===`);
    console.log(`ID: ${recruiter._id}`);
    console.log(`Name: ${recruiter.name}`);
    console.log(`Email: ${recruiter.email}`);
    console.log(`Company: ${recruiter.companyName || 'Pathao Bangladesh'}`);

    // 2. Ensure existing opportunities for Mahbub Alam (target count = 2)
    let opportunities = await Opportunity.find({ recruiter: recruiter._id }).sort({ createdAt: 1 });

    if (opportunities.length < 2) {
      console.log(`\n[!] Recruiter has ${opportunities.length} existing opportunities. Ensuring 2 opportunities exist...`);

      if (opportunities.length === 0) {
        const opp1 = await Opportunity.create({
          recruiter: recruiter._id,
          companyId: recruiter._id,
          companyName: recruiter.companyName || 'Pathao Bangladesh',
          title: 'Software Engineer (Backend)',
          opportunityType: 'Private Job',
          department: 'Engineering',
          location: 'Dhaka, Bangladesh',
          employmentMode: 'On-site',
          vacancies: 2,
          salary: { min: 65000, max: 95000, currency: 'BDT' },
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          joiningDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          description: {
            about: 'Pathao is the leading tech-based logistics and ride-sharing platform in Bangladesh.',
            responsibilities: 'Design, develop and maintain scalable microservices using Node.js and MongoDB.',
            requirements: 'Bachelor in Computer Science / ETE / ICTE or equivalent. Proficiency in Node.js and REST APIs.',
            benefits: 'Competitive salary, performance bonus, festival bonuses, and health insurance.'
          },
          eligibility: {
            minCgpa: '3.0',
            eligibleDepartments: ['Educational Technology and Engineering', 'Computer Science & Engineering', 'Software Engineering'],
            eligibleGraduationYears: ['2023', '2024', '2025']
          },
          skills: ['Node.js', 'MongoDB', 'REST API', 'Express.js', 'Microservices'],
          applicationMethod: 'Inside FrontX',
          visibility: ['student', 'alumni'],
          status: 'active',
          createdByRole: 'recruiter',
          submittedAt: new Date()
        });
        console.log(`  [+] Created Opportunity 1: "${opp1.title}" (${opp1._id})`);

        const opp2 = await Opportunity.create({
          recruiter: recruiter._id,
          companyId: recruiter._id,
          companyName: recruiter.companyName || 'Pathao Bangladesh',
          title: 'Product Operations Intern',
          opportunityType: 'Internship',
          department: 'Product',
          location: 'Dhaka, Bangladesh',
          employmentMode: 'Hybrid',
          vacancies: 3,
          salary: { min: 20000, max: 30000, currency: 'BDT' },
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          joiningDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          description: {
            about: 'Join Pathao Product Operations team to analyze user metrics and optimize ride/delivery logistics workflows.',
            responsibilities: 'Assist product managers with data tracking, user feedback analysis, and feature deployment.',
            requirements: 'Current student or recent graduate in ETE, CSE, or Business Analytics with strong analytical skills.',
            benefits: 'Stipend, mentorship, certificate, and potential full-time conversion.'
          },
          eligibility: {
            minCgpa: '2.8',
            eligibleDepartments: ['Educational Technology and Engineering', 'Computer Science & Engineering'],
            eligibleGraduationYears: ['2024', '2025', '2026']
          },
          skills: ['Data Analysis', 'SQL', 'Product Analytics', 'Excel', 'Problem Solving'],
          applicationMethod: 'Inside FrontX',
          visibility: ['student', 'alumni'],
          status: 'active',
          createdByRole: 'recruiter',
          submittedAt: new Date()
        });
        console.log(`  [+] Created Opportunity 2: "${opp2.title}" (${opp2._id})`);
      } else if (opportunities.length === 1) {
        const opp2 = await Opportunity.create({
          recruiter: recruiter._id,
          companyId: recruiter._id,
          companyName: recruiter.companyName || 'Pathao Bangladesh',
          title: 'Product Operations Intern',
          opportunityType: 'Internship',
          department: 'Product',
          location: 'Dhaka, Bangladesh',
          employmentMode: 'Hybrid',
          vacancies: 3,
          salary: { min: 20000, max: 30000, currency: 'BDT' },
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          joiningDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          description: {
            about: 'Join Pathao Product Operations team to analyze user metrics and optimize logistics workflows.',
            responsibilities: 'Assist product managers with data tracking, user feedback analysis, and feature deployment.',
            requirements: 'Current student or recent graduate with strong analytical skills.',
            benefits: 'Stipend, mentorship, and potential full-time conversion.'
          },
          eligibility: {
            minCgpa: '2.8',
            eligibleDepartments: ['Educational Technology and Engineering', 'Computer Science & Engineering'],
            eligibleGraduationYears: ['2024', '2025', '2026']
          },
          skills: ['Data Analysis', 'SQL', 'Product Analytics'],
          applicationMethod: 'Inside FrontX',
          visibility: ['student', 'alumni'],
          status: 'active',
          createdByRole: 'recruiter',
          submittedAt: new Date()
        });
        console.log(`  [+] Created Opportunity 2: "${opp2.title}" (${opp2._id})`);
      }

      opportunities = await Opportunity.find({ recruiter: recruiter._id }).sort({ createdAt: 1 });
    }

    console.log(`\n=== RECRUITER OPPORTUNITIES (${opportunities.length}) ===`);
    opportunities.forEach((op, idx) => {
      console.log(`  [${idx + 1}] ID: ${op._id} | Title: "${op.title}" | Type: ${op.opportunityType} | Status: ${op.status}`);
    });

    const opp1 = opportunities[0];
    const opp2 = opportunities[1] || opportunities[0];

    // 3. Find Nur E Jannat (Student 1)
    let nureStudent = await User.findOne({
      role: 'student',
      $or: [
        { name: /Nur E Jannat/i },
        { email: /jannat0001/i },
        { email: /nure/i }
      ]
    });

    if (!nureStudent) {
      nureStudent = await User.findOne({ role: 'student' });
    }

    if (!nureStudent) {
      console.log('[-] No student found in database to create applications.');
      return;
    }

    console.log(`\n=== STUDENT 1 (${nureStudent.name}) ===`);
    console.log(`ID: ${nureStudent._id}`);
    console.log(`Name: ${nureStudent.name}`);
    console.log(`Email: ${nureStudent.email}`);

    // 4. Find Nishat Jahan explicitly (Student 2)
    let secondStudent = await User.findOne({
      role: 'student',
      $or: [
        { name: /Nishat Jahan/i },
        { email: /nishat/i }
      ]
    });

    if (!secondStudent) {
      secondStudent = await User.findOne({
        role: 'student',
        _id: { $ne: nureStudent._id }
      }).sort({ createdAt: 1 });
    }

    if (!secondStudent) {
      secondStudent = nureStudent;
    }

    console.log(`\n=== STUDENT 2 (${secondStudent.name}) ===`);
    console.log(`ID: ${secondStudent._id}`);
    console.log(`Name: ${secondStudent.name}`);

    // Clean up applications & interviews for any other students under Mahbub Alam
    await Application.deleteMany({
      recruiter: recruiter._id,
      student: { $nin: [nureStudent._id, secondStudent._id] }
    });
    await Interview.deleteMany({
      recruiter: recruiter._id,
      student: { $nin: [nureStudent._id, secondStudent._id] }
    });

    // 5. Create or Reuse Application 1 (Nur E Jannat)
    let app1 = await Application.findOne({
      recruiter: recruiter._id,
      student: nureStudent._id,
      opportunity: opp1._id
    });

    if (!app1) {
      app1 = await Application.create({
        opportunity: opp1._id,
        recruiter: recruiter._id,
        student: nureStudent._id,
        applicantRole: 'student',
        applicantName: nureStudent.name,
        applicantEmail: nureStudent.email,
        applicantDepartment: nureStudent.department || 'Educational Technology and Engineering',
        applicantStudentId: nureStudent.studentId || '1902001',
        applicantSession: nureStudent.session || '19-20',
        applicantGraduationYear: nureStudent.graduationYear || '2024',
        status: 'pending',
        skills: nureStudent.skills && nureStudent.skills.length > 0 ? nureStudent.skills : ['JavaScript', 'React.js', 'Node.js'],
        coverLetter: 'I am excited to apply for this position at Pathao. My background in software engineering matches the requirements well.',
        notes: 'Initial application submitted for review.'
      });
      console.log(`\n[+] Created Application 1 for ${nureStudent.name} (App ID: ${app1._id})`);
    } else {
      console.log(`\n[=] Reused existing Application 1 for ${nureStudent.name} (App ID: ${app1._id})`);
    }

    // 6. Create or Reuse Application 2 (Second Student)
    let app2 = await Application.findOne({
      recruiter: recruiter._id,
      student: secondStudent._id,
      opportunity: opp2._id
    });

    if (!app2) {
      app2 = await Application.create({
        opportunity: opp2._id,
        recruiter: recruiter._id,
        student: secondStudent._id,
        applicantRole: 'student',
        applicantName: secondStudent.name,
        applicantEmail: secondStudent.email,
        applicantDepartment: secondStudent.department || 'Educational Technology and Engineering',
        applicantStudentId: secondStudent.studentId || '1902002',
        applicantSession: secondStudent.session || '19-20',
        applicantGraduationYear: secondStudent.graduationYear || '2024',
        status: 'shortlisted',
        skills: secondStudent.skills && secondStudent.skills.length > 0 ? secondStudent.skills : ['Python', 'Data Structures', 'SQL'],
        coverLetter: 'Dear Hiring Manager, I am eager to contribute to your team with my strong technical skill set.',
        notes: 'Candidate shortlisted and scheduled for technical interview.'
      });
      console.log(`[+] Created Application 2 for ${secondStudent.name} (App ID: ${app2._id})`);
    } else {
      console.log(`[=] Reused existing Application 2 for ${secondStudent.name} (App ID: ${app2._id})`);
    }

    // Update opportunity application counts
    for (const op of opportunities) {
      const count = await Application.countDocuments({ opportunity: op._id });
      await Opportunity.findByIdAndUpdate(op._id, { applicationCount: count });
    }

    // 7. Create or Reuse Upcoming Scheduled Interviews (Idempotent)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    futureDate1.setHours(11, 0, 0, 0);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 4);
    futureDate2.setHours(14, 30, 0, 0);

    let interview1 = await Interview.findOne({
      recruiter: recruiter._id,
      student: secondStudent._id,
      opportunity: opp2._id,
      status: 'scheduled'
    });

    if (!interview1) {
      interview1 = await Interview.create({
        recruiter: recruiter._id,
        student: secondStudent._id,
        opportunity: opp2._id,
        application: app2._id,
        companyName: recruiter.companyName || 'Pathao Bangladesh',
        title: `Technical Interview — ${opp2.title}`,
        date: futureDate1,
        time: '11:00 AM',
        duration: 45,
        interviewType: 'Online',
        meetingType: 'frontx',
        platform: 'FrontX Video',
        status: 'scheduled',
        notes: 'Technical evaluation round covering data structures and problem solving.'
      });
      console.log(`\n[+] Created Interview 1 for ${secondStudent.name} (Interview ID: ${interview1._id})`);
    } else {
      console.log(`\n[=] Reused existing Interview 1 for ${secondStudent.name} (Interview ID: ${interview1._id})`);
    }

    let interview2 = await Interview.findOne({
      recruiter: recruiter._id,
      student: nureStudent._id,
      opportunity: opp1._id,
      status: 'scheduled'
    });

    if (!interview2) {
      interview2 = await Interview.create({
        recruiter: recruiter._id,
        student: nureStudent._id,
        opportunity: opp1._id,
        application: app1._id,
        companyName: recruiter.companyName || 'Pathao Bangladesh',
        title: `Initial Screening — ${opp1.title}`,
        date: futureDate2,
        time: '02:30 PM',
        duration: 30,
        interviewType: 'Online',
        meetingType: 'frontx',
        platform: 'FrontX Video',
        status: 'scheduled',
        notes: 'Introductory discussion on project background and career goals.'
      });
      console.log(`[+] Created Interview 2 for ${nureStudent.name} (Interview ID: ${interview2._id})`);
    } else {
      console.log(`[=] Reused existing Interview 2 for ${nureStudent.name} (Interview ID: ${interview2._id})`);
    }

    // 8. Verification of Dashboard Stats from MongoDB
    const totalOps = await Opportunity.countDocuments({ recruiter: recruiter._id });
    const activeOps = await Opportunity.countDocuments({ recruiter: recruiter._id, status: 'active' });
    const totalApps = await Application.countDocuments({ recruiter: recruiter._id });
    const totalInterviews = await Interview.countDocuments({ recruiter: recruiter._id, status: 'scheduled', date: { $gte: new Date() } });

    console.log(`\n==================================================`);
    console.log(`RECRUITER DASHBOARD STATS PREVIEW (MongoDB Real Data)`);
    console.log(`==================================================`);
    console.log(`Recruiter ID:         ${recruiter._id}`);
    console.log(`Recruiter Email:      ${recruiter.email}`);
    console.log(`Total Opportunities:  ${totalOps}`);
    console.log(`Active Opportunities: ${activeOps}`);
    console.log(`Total Applicants:     ${totalApps}`);
    console.log(`Interviews Scheduled: ${totalInterviews}`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('Execution error in Mahbub demo setup:', err);
  } finally {
    if (selfConnected) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected cleanly.');
    }
  }
};

module.exports = setupMahbubDemoData;

if (require.main === module) {
  setupMahbubDemoData();
}
