const axios = require('axios');

const LIVE_API = 'https://frontx-backend.onrender.com/api';

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

async function seedLiveAlumni() {
  console.log(`Starting registration of 20 Alumni accounts on live backend: ${LIVE_API}`);
  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  const sessionDist = { '17-18': 0, '18-19': 0, '20-21': 0 };

  for (const acc of ALUMNI_ACCOUNTS) {
    try {
      const payload = {
        name: acc.name,
        email: acc.email,
        password: acc.password,
        role: 'alumni',
        session: acc.session,
        department: 'Educational Technology and Engineering',
        turnstileToken: '1x00000000000000000000AA'
      };

      const res = await axios.post(`${LIVE_API}/auth/register`, payload);
      if (res.data.success) {
        console.log(`✅ [CREATED] ${acc.name} (${acc.email}) - Session ${acc.session}`);
        created++;
        if (sessionDist[acc.session] !== undefined) sessionDist[acc.session]++;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (errMsg.includes('already exists')) {
        console.log(`ℹ️ [EXISTS] ${acc.name} (${acc.email}) already registered.`);
        skipped++;
        if (sessionDist[acc.session] !== undefined) sessionDist[acc.session]++;
      } else {
        console.error(`❌ [FAILED] ${acc.name} (${acc.email}):`, errMsg);
        failed++;
        errors.push({ email: acc.email, error: errMsg });
      }
    }
  }

  // Verification step via live login API
  console.log('\n--- VERIFYING LOGIN FOR ALL 20 ALUMNI ON LIVE BACKEND ---');
  let loginPassed = 0;
  let loginFailed = 0;

  for (const acc of ALUMNI_ACCOUNTS) {
    try {
      const res = await axios.post(`${LIVE_API}/auth/login`, {
        email: acc.email,
        password: acc.password,
        selectedRole: 'alumni',
        turnstileToken: '1x00000000000000000000AA'
      });

      if (res.data.token || res.data.success) {
        console.log(`🔑 [AUTH OK] Login verified for ${acc.name} (${acc.email})`);
        loginPassed++;
      } else {
        console.error(`❌ [AUTH FAIL] Login failed for ${acc.name}`);
        loginFailed++;
      }
    } catch (err) {
      console.error(`❌ [AUTH FAIL] Login failed for ${acc.name} (${acc.email}):`, err.response?.data?.message || err.message);
      loginFailed++;
    }
  }

  // Fetch mentors list from live API to verify Mentorship page visibility
  let mentorCountInApi = 0;
  try {
    const mentorsRes = await axios.get(`${LIVE_API}/users/mentors?limit=50`);
    mentorCountInApi = mentorsRes.data?.total || mentorsRes.data?.mentors?.length || 0;
    console.log(`\n📋 Live Mentorship API Total Mentors returned: ${mentorCountInApi}`);
  } catch (mErr) {
    console.error('Failed to fetch mentors list from live API:', mErr.message);
  }

  console.log('\n==========================================');
  console.log('       LIVE ALUMNI SEEDING REPORT         ');
  console.log('==========================================');
  console.log(`Target Environment: ${LIVE_API}`);
  console.log(`Number created: ${created}`);
  console.log(`Number already existing/skipped: ${skipped}`);
  console.log(`Number failed: ${failed}`);
  console.log('Session distribution:', JSON.stringify(sessionDist));
  console.log(`Login Authentication verified via API: ${loginPassed} / 20`);
  console.log(`Mentors appearing in Live Mentorship API: ${mentorCountInApi}`);
  console.log(`Errors encountered: ${errors.length > 0 ? JSON.stringify(errors) : 'None'}`);
  console.log('==========================================\n');
}

seedLiveAlumni();
