const axios = require('axios');

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyTurnstileToken = async (token, remoteIp = '') => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: 'Turnstile is not configured on the server.' };
  }
  if (!token) {
    return { success: false, error: 'Missing Turnstile verification token.' };
  }

  try {
    const params = new URLSearchParams({ secret: secretKey, response: token });
    // Intentionally omitting remoteIp as it can cause validation failures if the IP is internal (e.g., ::1)

    const { data } = await axios.post(TURNSTILE_VERIFY_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    if (data && data.success === true) {
      return { success: true };
    }
    console.error('Turnstile verification failed with error codes:', data['error-codes']);
    return { success: false, error: (data['error-codes'] || []).join(', ') || 'Verification failed.' };
  } catch (err) {
    console.error('Turnstile verification request failed:', err.message || err);
    return { success: false, error: 'Turnstile verification request failed.' };
  }
};

const verifyTurnstile = async (req, res, next) => {
  const { success } = await verifyTurnstileToken(req.body.turnstileToken, req.ip);
  if (!success) {
    return res.status(400).json({
      message: 'Human verification failed. Please complete the Cloudflare challenge and try again.'
    });
  }
  next();
};

module.exports = { verifyTurnstile, verifyTurnstileToken };
