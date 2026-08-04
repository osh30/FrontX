const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const API = 'http://localhost:5001/api';
const User = require('./models/User');
const PasswordReset = require('./models/PasswordReset');

const TEST_EMAIL = 'otptest.user@std.uftb.ac.bd';
const OLD_PASS = 'OldPass123';
const NEW_PASS = 'NewPass456';

let passed = 0;
let failed = 0;
const check = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontx_db');

  // ── Setup: fresh test user ──
  await PasswordReset.deleteMany({ email: TEST_EMAIL });
  await User.deleteMany({ email: TEST_EMAIL });
  await User.create({ name: 'OTP Test', email: TEST_EMAIL, password: OLD_PASS, role: 'student', session: '2020-21', department: 'Educational Technology and Engineering' });

  // ── 1. Request OTP ──
  console.log('\n[1] Request OTP');
  let r = await axios.post(`${API}/auth/forgot-password`, { email: TEST_EMAIL, turnstileToken: 'test-token' });
  check('success', r.data.success === true);
  check('devOtp returned (email not configured)', !!r.data.devOtp, JSON.stringify(r.data));
  const otp = r.data.devOtp;
  check('otp is 6 digits', /^\d{6}$/.test(otp), otp);

  // ── 2. Unknown email → generic success (no enumeration) ──
  console.log('\n[2] Unknown email');
  r = await axios.post(`${API}/auth/forgot-password`, { email: 'nobody@example.com', turnstileToken: 'test-token' });
  check('generic success', r.data.success === true);
  check('no devOtp leaked', !r.data.devOtp);

  // ── 3. Verify with wrong OTP ──
  console.log('\n[3] Wrong OTP rejected');
  try { await axios.post(`${API}/auth/verify-otp`, { email: TEST_EMAIL, otp: '000000', turnstileToken: 'test-token' }); check('rejected', false); }
  catch (e) { check('rejected with 400', e.response?.status === 400); }

  // ── 4. Verify with correct OTP ──
  console.log('\n[4] Correct OTP verified');
  r = await axios.post(`${API}/auth/verify-otp`, { email: TEST_EMAIL, otp, turnstileToken: 'test-token' });
  check('success', r.data.success === true);

  // ── 5. Reset with wrong OTP ──
  console.log('\n[5] Reset with wrong OTP');
  try { await axios.post(`${API}/auth/reset-password`, { email: TEST_EMAIL, otp: '000000', newPassword: NEW_PASS, turnstileToken: 'test-token' }); check('rejected', false); }
  catch (e) { check('rejected with 400', e.response?.status === 400); }

  // ── 6. Reset with weak password ──
  console.log('\n[6] Weak password rejected');
  try { await axios.post(`${API}/auth/reset-password`, { email: TEST_EMAIL, otp, newPassword: 'weak', turnstileToken: 'test-token' }); check('rejected', false); }
  catch (e) { check('rejected with 400', e.response?.status === 400); }

  // ── 7. Reset with same as current password ──
  console.log('\n[7] Same-as-current password rejected');
  try { await axios.post(`${API}/auth/reset-password`, { email: TEST_EMAIL, otp, newPassword: OLD_PASS, turnstileToken: 'test-token' }); check('rejected', false); }
  catch (e) { check('rejected with 400', e.response?.status === 400); }

  // ── 8. Successful reset ──
  console.log('\n[8] Successful reset');
  r = await axios.post(`${API}/auth/reset-password`, { email: TEST_EMAIL, otp, newPassword: NEW_PASS, turnstileToken: 'test-token' });
  check('success', r.data.success === true);

  // ── 9. OTP invalidated after use ──
  console.log('\n[9] OTP re-use rejected');
  try { await axios.post(`${API}/auth/verify-otp`, { email: TEST_EMAIL, otp, turnstileToken: 'test-token' }); check('rejected', false); }
  catch (e) { check('rejected with 400', e.response?.status === 400); }

  // ── 10. Login with old password fails ──
  console.log('\n[10] Old password no longer works');
  try { await axios.post(`${API}/auth/login`, { email: TEST_EMAIL, password: OLD_PASS, selectedRole: 'student', turnstileToken: 'test-token' }); check('old rejected', false); }
  catch (e) { check('old rejected with 401', e.response?.status === 401); }

  // ── 11. Login with new password works ──
  console.log('\n[11] New password works');
  r = await axios.post(`${API}/auth/login`, { email: TEST_EMAIL, password: NEW_PASS, selectedRole: 'student', turnstileToken: 'test-token' });
  check('login success', r.data.success === true);
  check('JWT token issued', !!r.data.token);

  // ── 12. Persistence in MongoDB (survives restart) ──
  console.log('\n[12] MongoDB persistence');
  const dbUser = await User.findOne({ email: TEST_EMAIL });
  const isHashed = dbUser.password.startsWith('$2');
  check('stored as bcrypt hash (no plaintext)', isHashed, dbUser.password.slice(0, 7));
  check('hash != plaintext new password', dbUser.password !== NEW_PASS);
  check('new password verifies against stored hash', await bcrypt.compare(NEW_PASS, dbUser.password));
  check('old password fails against stored hash', !(await bcrypt.compare(OLD_PASS, dbUser.password)));

  // Reconnect simulation (server restart) via a fresh connection
  await mongoose.disconnect();
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontx_db');
  const afterReconnect = await User.findOne({ email: TEST_EMAIL });
  check('new password still valid after reconnect', await bcrypt.compare(NEW_PASS, afterReconnect.password));

  // ── 13. Expired OTP rejected ──
  console.log('\n[13] Expired OTP');
  const fresh2 = await axios.post(`${API}/auth/forgot-password`, { email: TEST_EMAIL, turnstileToken: 'test-token' });
  const rec2 = await PasswordReset.findOne({ email: TEST_EMAIL, used: false }).sort({ createdAt: -1 });
  rec2.expiresAt = new Date(Date.now() - 60000);
  await rec2.save();
  try { await axios.post(`${API}/auth/verify-otp`, { email: TEST_EMAIL, otp: fresh2.data.devOtp, turnstileToken: 'test-token' }); check('expired rejected', false); }
  catch (e) { check('expired rejected with 400', e.response?.status === 400 && /expired/i.test(e.response?.data?.message)); }

  // ── Cleanup ──
  await User.deleteMany({ email: TEST_EMAIL });
  await PasswordReset.deleteMany({ email: TEST_EMAIL });
  await mongoose.disconnect();

  console.log(`\n====================`);
  console.log(`PASSED: ${passed}  FAILED: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(async (err) => {
  console.error('TEST ERROR:', err.response?.data || err.message);
  try { await User.deleteMany({ email: TEST_EMAIL }); await PasswordReset.deleteMany({ email: TEST_EMAIL }); await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});
