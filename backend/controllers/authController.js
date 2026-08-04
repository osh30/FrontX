const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const getClientInfo = (req) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip || '';
  const userAgent = req.headers['user-agent'] || '';
  let device = 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';

  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';
  else device = 'Desktop';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return { ip, userAgent, device, browser, os };
};

const recordLogin = async (req, user, success, failReason = '') => {
  try {
    const info = getClientInfo(req);
    await LoginHistory.create({
      user: user._id,
      action: 'login',
      role: user.role,
      ip: info.ip,
      userAgent: info.userAgent,
      device: info.device,
      browser: info.browser,
      os: info.os,
      success,
      failReason
    });

    if (success) {
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        $inc: { loginCount: 1 },
        lastActiveAt: new Date()
      });
    }
  } catch (err) {
    console.error('LoginHistory record error:', err.message);
  }
};

// Register user
const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role, session, department, studentId, graduationYear,
      companyName, designation, industryType, companyWebsite, companyAddress
    } = req.body;

    // ──────────────────────────────────────────────────────
    // DEMO MODE: recruiters are allowed during capstone dev.
    // PRODUCTION: remove 'recruiter' from this array and
    // enforce company-domain validation instead.
    // ──────────────────────────────────────────────────────
    const allowedRoles = ['student', 'alumni', 'recruiter'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Registration is only available for Students, Alumni, and Recruiters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // ──────────────────────────────────────────────────────
    // DEMO MODE: allow any valid email (Gmail, Outlook, etc.)
    // PRODUCTION: uncomment the domain check below and
    // restrict to official company domains only.
    // ──────────────────────────────────────────────────────
    // if (role === 'recruiter') {
    //   const officialDomains = ['company.com', 'corp.example.com'];
    //   const emailDomain = email.split('@')[1];
    //   if (!officialDomains.includes(emailDomain)) {
    //     return res.status(400).json({ message: 'Please use your official company email address.' });
    //   }
    // }

    const userData = {
      name,
      email,
      password,
      role,
      session,
      department
    };

    if (role === 'alumni') {
      userData.studentId = studentId;
      userData.graduationYear = graduationYear;
    }

    // ──────────────────────────────────────────────────────
    // Recruiter registration fields + demo-mode flags.
    // In PRODUCTION, change status to 'pending' and
    // set accountType to 'production', isDemoRecruiter to false.
    // ──────────────────────────────────────────────────────
    if (role === 'recruiter') {
      userData.companyName = companyName;
      userData.designation = designation;
      userData.industryType = industryType;
      userData.companyWebsite = companyWebsite || '';
      userData.companyAddress = companyAddress || '';
      // DEMO MODE flags — flip these for production:
      userData.status = 'approved';           // PRODUCTION: 'pending'
      userData.accountType = 'demo';          // PRODUCTION: 'production'
      userData.isDemoRecruiter = true;        // PRODUCTION: false
    }

    const user = await User.create(userData);

    if (req.app.get('io') && role === 'student') {
      req.app.get('io').emit('student_updated');
    }
    if (req.app.get('io') && role === 'alumni') {
      req.app.get('io').emit('new_alumni_registered');
    }

    // Generate token on registration so the user is auto-logged in.
    // This also fixes the existing student/alumni flow where the frontend
    // expected a token but the backend didn't return one.
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'recruiter'
        ? 'Registration successful! Your recruiter account is ready.'
        : 'Registration successful! You can now login.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await recordLogin(req, user, false, 'Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      await recordLogin(req, user, false, 'Deactivated account');
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot log in from this page.' });
    }

    if (selectedRole && user.role !== selectedRole) {
      return res.status(403).json({
        message: `This account does not belong to the selected role. Please choose the correct role and try again.`
      });
    }

    const token = generateToken(user._id);
    await recordLogin(req, user, true);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.isActive === false) {
      return res.status(401).json({ message: 'This account has been deactivated. Please contact support.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await recordLogin(req, user, false, 'Invalid password');
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied. Administrator credentials required.' });
    }

    const token = generateToken(user._id);
    await recordLogin(req, user, true);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      const info = req.clientInfo || {};
      await LoginHistory.create({
        user: req.user.id,
        action: 'logout',
        role: req.user.role,
        ip: info.ip || '',
        userAgent: info.userAgent || '',
        device: info.device || '',
        browser: info.browser || '',
        os: info.os || '',
        success: true
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.json({ success: true, message: 'Logged out' });
  }
};

module.exports = { registerUser, loginUser, loginAdmin, getMe, logoutUser };
