const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const ALLOWED_ROLES = ['student', 'alumni', 'recruiter'];
const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const sendOtpEmail = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    return { sent: false, reason: 'EMAIL_USER / EMAIL_PASS are not configured.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });

  await transporter.sendMail({
    from: `"FrontX" <${emailUser}>`,
    to: email,
    subject: 'Your FrontX password reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin: 0 0 16px; color: #0f172a;">Reset your FrontX password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We received a request to reset your account password. Use the one-time code below to continue:</p>
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 26px; font-weight: 700; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">This code expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `
  });

  return { sent: true };
};

const findLatestValidRecord = async (email) => {
  return PasswordReset.findOne({ email, used: false }).sort({ createdAt: -1 });
};

// Step 1 — Request an OTP
const requestOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });

    // Generic response whether or not the account exists (prevents account enumeration).
    if (!user || user.isActive === false || !ALLOWED_ROLES.includes(user.role)) {
      return res.json({
        success: true,
        message: 'If a matching account is found, a password reset OTP has been sent to your email.'
      });
    }

    // Invalidate any previously issued, still-active OTPs for this user.
    await PasswordReset.updateMany({ user: user._id, used: false }, { $set: { used: true } });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await PasswordReset.create({
      user: user._id,
      email,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    let devOtp = null;
    try {
      const result = await sendOtpEmail(email, otp);
      if (!result.sent) {
        console.warn(`[PasswordReset] Email not sent (${result.reason}). OTP for ${email}: ${otp}`);
        devOtp = otp;
      }
    } catch (err) {
      console.error('[PasswordReset] OTP email send failed:', err.message);
      devOtp = otp;
    }

    res.json({
      success: true,
      message: 'A password reset OTP has been sent to your email. It expires in 10 minutes.',
      ...(devOtp ? { devOtp } : {})
    });
  } catch (error) {
    console.error('[PasswordReset] requestOtp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2 — Verify the OTP
const verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '');
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const record = await findLatestValidRecord(email);
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    if (record.expiresAt < new Date()) {
      record.used = true;
      await record.save();
      return res.status(400).json({ message: 'This OTP has expired. Please request a new one.' });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    record.verified = true;
    await record.save();

    res.json({ success: true, message: 'OTP verified. You can now set a new password.' });
  } catch (error) {
    console.error('[PasswordReset] verifyOtp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 3 — Set a new password
const resetPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '');
    const newPassword = req.body.newPassword || '';

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }
    if (!PASSWORD_RULES.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.'
      });
    }

    const record = await PasswordReset.findOne({ email, used: false, verified: true }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please restart the password reset process.' });
    }
    if (record.expiresAt < new Date()) {
      record.used = true;
      await record.save();
      return res.status(400).json({ message: 'This OTP has expired. Please restart the password reset process.' });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid OTP. Please restart the password reset process.' });
    }

    const user = await User.findById(record.user);
    if (!user) {
      return res.status(400).json({ message: 'Account not found.' });
    }

    const samePassword = await user.comparePassword(newPassword);
    if (samePassword) {
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    // The User model's pre-save hook hashes the password with bcrypt before saving.
    user.password = newPassword;
    await user.save();

    // Invalidate this OTP and any other outstanding reset requests for this user.
    await PasswordReset.updateMany({ user: user._id }, { $set: { used: true } });

    res.json({ success: true, message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('[PasswordReset] resetPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { requestOtp, verifyOtp, resetPassword };
