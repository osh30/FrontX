const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

const connectToDb = async () => {
  const uris = [
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27017/frontx_db'
  ].filter(Boolean);

  let connectedUri = null;

  for (const uri of uris) {
    try {
      // sanitize uri for logging
      const masked = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log(`Trying connection to: ${masked}`);
      await mongoose.connect(uri);
      connectedUri = uri;
      console.log('✅ Connected successfully!');
      break;
    } catch (err) {
      console.error(`❌ Connection failed: ${err.message}`);
    }
  }

  if (!connectedUri) {
    throw new Error('Could not connect to any MongoDB instance.');
  }

  return connectedUri;
};

const seedAndVerify = async () => {
  let createdCount = 0;
  let existingCount = 0;
  let failedCount = 0;
  const errors = [];

  try {
    const activeUri = await connectToDb();
    const dbHost = mongoose.connection.host;
    const dbName = mongoose.connection.name;

    // 1. Seed process
    for (const acc of ALUMNI_ACCOUNTS) {
      const emailLower = acc.email.toLowerCase();
      try {
        const existing = await User.findOne({ email: emailLower });
        if (existing) {
          console.log(`[SKIP] Account already exists: ${emailLower}`);
          existingCount++;
          continue;
        }

        const newUser = await User.create({
          name: acc.name,
          email: emailLower,
          password: acc.password, // User model pre-save hook will hash this automatically
          role: 'alumni',
          session: acc.session,
          department: 'Educational Technology and Engineering',
          status: 'approved'
        });

        console.log(`[CREATED] Account created: ${newUser.name} (${emailLower})`);
        createdCount++;
      } catch (err) {
        console.error(`[ERROR] Failed to create ${emailLower}:`, err.message);
        failedCount++;
        errors.push({ email: acc.email, error: err.message });
      }
    }

    // 2. Verification step
    console.log('\n--- VERIFICATION STEP ---');
    const targetEmails = ALUMNI_ACCOUNTS.map(a => a.email.toLowerCase());
    const foundAccounts = await User.find({ email: { $in: targetEmails } });

    console.log(`Target accounts found in DB: ${foundAccounts.length} / ${ALUMNI_ACCOUNTS.length}`);

    // Session distribution check
    const sessionDist = { '17-18': 0, '18-19': 0, '20-21': 0 };
    let validRoleCount = 0;
    let validDeptCount = 0;
    let validEmailDomainCount = 0;
    let validPasswordHashCount = 0;

    for (const userDoc of foundAccounts) {
      if (sessionDist[userDoc.session] !== undefined) {
        sessionDist[userDoc.session]++;
      }
      if (userDoc.role === 'alumni') validRoleCount++;
      if (userDoc.department === 'Educational Technology and Engineering') validDeptCount++;
      if (userDoc.email.endsWith('@std.uftb.ac.bd')) validEmailDomainCount++;

      // Check password is hashed (not plaintext) and satisfies comparePassword
      const origAccountData = ALUMNI_ACCOUNTS.find(a => a.email.toLowerCase() === userDoc.email);
      if (origAccountData) {
        const isHashed = userDoc.password.startsWith('$2a$') || userDoc.password.startsWith('$2b$');
        const canCompare = await userDoc.comparePassword(origAccountData.password);
        if (isHashed && canCompare) {
          validPasswordHashCount++;
        }
      }
    }

    // Check for duplicates in MongoDB
    const duplicateCheck = await User.aggregate([
      { $match: { email: { $in: targetEmails } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    // Check Alumni queries in existing backend
    const totalAlumniInDb = await User.countDocuments({ role: 'alumni' });

    console.log('\n==========================================');
    console.log('            SEEDING REPORT                ');
    console.log('==========================================');
    console.log(`Database Host: ${dbHost}`);
    console.log(`Database Name: ${dbName}`);
    console.log(`Database URI Used: ${activeUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log(`Number created: ${createdCount}`);
    console.log(`Number already existing/skipped: ${existingCount}`);
    console.log(`Number failed: ${failedCount}`);
    console.log('Session distribution:', JSON.stringify(sessionDist));
    console.log(`Target accounts matching role='alumni': ${validRoleCount} / 20`);
    console.log(`Target accounts matching dept='Educational Technology and Engineering': ${validDeptCount} / 20`);
    console.log(`Target accounts with valid @std.uftb.ac.bd email: ${validEmailDomainCount} / 20`);
    console.log(`Target accounts with valid bcrypt hashed passwords & authentication verified: ${validPasswordHashCount} / 20`);
    console.log(`Duplicate emails found in DB: ${duplicateCheck.length}`);
    console.log(`Total alumni accounts in DB: ${totalAlumniInDb}`);

    if (errors.length > 0) {
      console.log('Errors encountered:', JSON.stringify(errors));
    } else {
      console.log('Errors encountered: None');
    }
    console.log('==========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error running seeder:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAndVerify();
