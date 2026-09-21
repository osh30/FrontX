const mongoose = require('mongoose');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const Application = require('../models/Application');

async function verifyFlow() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/frontx_db');

    console.log('=== 1. RECRUITER VERIFICATION ===');
    const mahbub = await User.findOne({ email: 'mahbub.alam@pathao.com' });
    console.log('Recruiter Found:', mahbub ? 'YES' : 'NO');
    if (mahbub) console.log('Mahbub Alam ID:', mahbub._id.toString());

    console.log('\n=== 2. OPPORTUNITY VERIFICATION ===');
    const opp1 = await Opportunity.findOne({ recruiter: mahbub._id, title: 'Software Engineering Intern' });
    const opp2 = await Opportunity.findOne({ recruiter: mahbub._id, title: 'Junior Data Analyst' });

    console.log('Opportunity 1 (Software Engineering Intern):', opp1 ? `YES (${opp1._id})` : 'NO');
    if (opp1) {
      console.log(' - Type:', opp1.opportunityType, '| Mode:', opp1.employmentMode, '| Vacancies:', opp1.vacancies);
      console.log(' - Stipend:', opp1.salary, '| Deadline:', opp1.deadline);
    }

    console.log('Opportunity 2 (Junior Data Analyst):', opp2 ? `YES (${opp2._id})` : 'NO');
    if (opp2) {
      console.log(' - Type:', opp2.opportunityType, '| Mode:', opp2.employmentMode, '| Vacancies:', opp2.vacancies);
      console.log(' - Salary:', opp2.salary, '| Deadline:', opp2.deadline);
    }

    const job1 = await Job.findOne({ linkedOpportunityId: opp1._id });
    const job2 = await Job.findOne({ linkedOpportunityId: opp2._id });
    console.log('Synced Job 1:', job1 ? `YES (${job1._id})` : 'NO');
    console.log('Synced Job 2:', job2 ? `YES (${job2._id})` : 'NO');

    console.log('\n=== 3. STUDENT APPLICATION FLOW TEST ===');
    let student = await User.findOne({ role: 'student' });
    if (student && opp1) {
      let app1 = await Application.findOne({ opportunity: opp1._id, student: student._id });
      if (!app1) {
        app1 = await Application.create({
          opportunity: opp1._id,
          recruiter: mahbub._id,
          student: student._id,
          applicantRole: 'student',
          applicantName: student.name,
          applicantEmail: student.email,
          applicantDepartment: student.department || 'Educational Technology and Engineering',
          status: 'applied',
          resumeFile: { url: 'https://res.cloudinary.com/demo/image/upload/v1234567/resume.pdf', publicId: 'demo/resume' }
        });
        console.log('✨ Created test Student application for:', student.name, '->', opp1.title);
      } else {
        console.log('ℹ️ Found existing Student application for:', student.name, '->', opp1.title);
      }
    }

    console.log('\n=== 4. ALUMNI APPLICATION FLOW TEST ===');
    let alumni = await User.findOne({ role: 'alumni' });
    if (alumni && opp2) {
      let app2 = await Application.findOne({ opportunity: opp2._id, student: alumni._id });
      if (!app2) {
        app2 = await Application.create({
          opportunity: opp2._id,
          recruiter: mahbub._id,
          student: alumni._id,
          applicantRole: 'alumni',
          applicantName: alumni.name,
          applicantEmail: alumni.email,
          applicantDepartment: alumni.department || 'Educational Technology and Engineering',
          status: 'applied',
          resumeFile: { url: 'https://res.cloudinary.com/demo/image/upload/v1234567/alumni_resume.pdf', publicId: 'demo/alumni_resume' }
        });
        console.log('✨ Created test Alumni application for:', alumni.name, '->', opp2.title);
      } else {
        console.log('ℹ️ Found existing Alumni application for:', alumni.name, '->', opp2.title);
      }
    }

    console.log('\n=== 5. MAHBUB ALAM RECRUITER APPLICANTS DASHBOARD TEST ===');
    const mahbubApps = await Application.find({ recruiter: mahbub._id })
      .populate('opportunity', 'title companyName')
      .populate('student', 'name email role');

    console.log(`Total Applications for Mahbub Alam (${mahbub._id}):`, mahbubApps.length);
    mahbubApps.forEach((a, i) => {
      console.log(` [${i+1}] Applicant: "${a.applicantName}" (${a.applicantRole}) | Opp: "${a.opportunity?.title}" | Recruiter match: ${a.recruiter.toString() === mahbub._id.toString()}`);
    });

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyFlow();
