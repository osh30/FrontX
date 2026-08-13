const User = require('../models/User');

const ALUMNI_ACCOUNTS = [
  // Session 17-18 (8 users)
  { name: 'Arefin Rafi', email: 'arefin.rafi@std.uftb.ac.bd', session: '17-18', password: 'arefin18' },
  { name: 'Naimul Islam', email: 'naimul.islam@std.uftb.ac.bd', session: '17-18', password: 'naimul18' },
  { name: 'Sadia Hassan', email: 'sadia.hassan@std.uftb.ac.bd', session: '17-18', password: 'sadia18' },
  { name: 'Yousuf Sohan', email: 'yousuf.sohan@std.uftb.ac.bd', session: '17-18', password: 'yousuf18' },
  { name: 'Alvy Arnob', email: 'alvy.arnob@std.uftb.ac.bd', session: '17-18', password: 'alvy18' },
  { name: 'Mahim Khan', email: 'mahim.khan@std.uftb.ac.bd', session: '17-18', password: 'mahim18' },
  { name: 'Shoccho Islam', email: 'shoccho.islam@std.uftb.ac.bd', session: '17-18', password: 'shoccho18' },
  { name: 'Prapto Mahmud', email: 'prapto.mahmud@std.uftb.ac.bd', session: '17-18', password: 'prapto18' },

  // Session 18-19 (5 users)
  { name: 'Shahriar Hassan', email: 'shahriar.hassan@std.uftb.ac.bd', session: '18-19', password: 'shahriar18' },
  { name: 'Nahin Rahman', email: 'nahin.rahman@std.uftb.ac.bd', session: '18-19', password: 'nahin18' },
  { name: 'Shayna Islam', email: 'shayna.islam@std.uftb.ac.bd', session: '18-19', password: 'shayna18' },
  { name: 'Prapty Chowdhury', email: 'prapty.chowdhury@std.uftb.ac.bd', session: '18-19', password: 'prapty18' },
  { name: 'Rayhana Islam', email: 'rayhana.islam@std.uftb.ac.bd', session: '18-19', password: 'rayhana18' },

  // Session 20-21 (7 users)
  { name: 'Onti Mahmud', email: 'onti.mahmud@std.uftb.ac.bd', session: '20-21', password: 'onti18' },
  { name: 'Safwat Chowdhury', email: 'safwat.chowdhury@std.uftb.ac.bd', session: '20-21', password: 'safwat18' },
  { name: 'Maria Khan', email: 'maria.khan@std.uftb.ac.bd', session: '20-21', password: 'maria18' },
  { name: 'Raisa Ahmed', email: 'raisa.ahmed@std.uftb.ac.bd', session: '20-21', password: 'raisa18' },
  { name: 'Nidhi Rahman', email: 'nidhi.rahman@std.uftb.ac.bd', session: '20-21', password: 'nidhi18' },
  { name: 'Mubasshihra Nahian', email: 'mubasshihra.nahian@std.uftb.ac.bd', session: '20-21', password: 'mubasshihra18' },
  { name: 'Labiba Islam', email: 'labiba.islam@std.uftb.ac.bd', session: '20-21', password: 'labiba18' }
];

const autoSeedAlumni = async () => {
  try {
    let createdCount = 0;

    for (const acc of ALUMNI_ACCOUNTS) {
      const emailLower = acc.email.toLowerCase();
      const existing = await User.findOne({ email: emailLower });
      if (existing) {
        // Ensure role is alumni and department is set
        let needsUpdate = false;
        if (existing.role !== 'alumni') { existing.role = 'alumni'; needsUpdate = true; }
        if (!existing.department) { existing.department = 'Educational Technology and Engineering'; needsUpdate = true; }
        if (!existing.session) { existing.session = acc.session; needsUpdate = true; }
        if (needsUpdate) await existing.save();
        continue;
      }

      await User.create({
        name: acc.name,
        email: emailLower,
        password: acc.password,
        role: 'alumni',
        session: acc.session,
        department: 'Educational Technology and Engineering',
        status: 'approved'
      });
      createdCount++;
    }

    if (createdCount > 0) {
      console.log(`🎓 Auto-seeded ${createdCount} Alumni account(s) in database.`);
    } else {
      console.log(`🎓 All 20 Alumni accounts verified in database.`);
    // Ensure Shanta and any EEE/CS departments are updated to Educational Technology and Engineering
    try {
      await User.updateMany(
        { name: { $regex: 'shanta', $options: 'i' } },
        { $set: { department: 'Educational Technology and Engineering' } }
      );
      await User.updateMany(
        { department: { $in: ['EEE', 'CS', 'CSE', 'Computer Science'] } },
        { $set: { department: 'Educational Technology and Engineering' } }
      );
    } catch (deptErr) {
      console.error('Department cleanup error:', deptErr.message);
    }

    // Auto-enrich all 20 alumni profiles and Shanta, and seed 15 Scholarships
    try {
      const enrich1 = require('./enrich10Alumni');
      const enrich2 = require('./enrichRemaining10Alumni');
      const enrichS = require('./enrichShanta');
      const seedScholarships = require('./seed15Scholarships');
      const seedCollaborations = require('./seed7AlumniCollaborations');
      const seedCommunity = require('./seed5AlumniCommunityPosts');

      if (typeof enrich1 === 'function') await enrich1();
      if (typeof enrich2 === 'function') await enrich2();
      if (typeof enrichS === 'function') await enrichS();
      if (typeof seedScholarships === 'function') await seedScholarships();
      if (typeof seedCollaborations === 'function') await seedCollaborations();
      if (typeof seedCommunity === 'function') await seedCommunity();
    } catch (e) {
      console.error('Alumni enrichment auto-run error:', e.message);
    }
  } catch (error) {
    console.error('Auto-seed alumni error (non-blocking):', error.message);
  }
};

module.exports = autoSeedAlumni;
