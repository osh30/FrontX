const axios = require('axios');

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyTurnstileToken = async (token, remoteIp = '') => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile secret key is not configured on server, bypass verification gracefully
  if (!secretKey) {
    return { success: true };
  }
  if (!token) {
    return { success: false, error: 'Missing Turnstile verification token.' };
  }

  // Allow Cloudflare dummy test tokens for automated testing & seeding
  if (token === '1x00000000000000000000AA' || token === 'test-token') {
    return { success: true };
  }

  try {
    const params = new URLSearchParams({ secret: secretKey, response: token });

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
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return next();
  }

  const { success } = await verifyTurnstileToken(req.body.turnstileToken, req.ip);
  if (!success) {
    return res.status(400).json({
      message: 'Human verification failed or challenge expired. Please complete the Cloudflare check and try again.'
    });
  }
  next();
};

module.exports = { verifyTurnstile, verifyTurnstileToken };
