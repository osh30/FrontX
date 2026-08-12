const axios = require('axios');

async function checkLiveMentors() {
  try {
    // Login with seeded alumni to obtain token
    const loginRes = await axios.post('https://frontx-backend.onrender.com/api/auth/login', {
      email: 'arefin.rafi@std.uftb.ac.bd',
      password: 'arefin18',
      selectedRole: 'alumni',
      turnstileToken: '1x00000000000000000000AA'
    });

    const token = loginRes.data.token;
    console.log('LOGIN SUCCESSFUL! Received JWT token.');

    const res = await axios.get('https://frontx-backend.onrender.com/api/users/mentors?limit=50', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('STATUS:', res.status);
    console.log('TOTAL MENTORS RETURNED BY LIVE BACKEND:', res.data?.total || res.data?.mentors?.length);
    console.log('MENTORS LIST:');
    res.data?.mentors?.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.name} (${m.email}) | Dept: ${m.department} | Session: ${m.session || 'N/A'}`);
    });
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

checkLiveMentors();
