const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      if (user.isActive === false) {
        return res.status(401).json({ message: 'This account has been deactivated. Please contact support.' });
      }
      req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
      req.clientInfo = getClientInfo(req);

      User.findByIdAndUpdate(decoded.id, { lastActiveAt: new Date() }).catch(() => {});

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('role name email');
      if (user) {
        req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
      }
    } catch {
      // Token invalid — proceed without user context
    }
  }
  next();
};

const protectRole = (role) => {
  return async (req, res, next) => {
    await protect(req, res, () => {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no user' });
      }
      if (req.user.role !== role) {
        return res.status(403).json({
          message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} account required. Your role: ${req.user.role}`
        });
      }
      next();
    });
  };
};

const protectStudent = protectRole('student');
const protectAlumni = protectRole('alumni');
const protectRecruiter = protectRole('recruiter');
const protectAdmin = protectRole('admin');

const protectStudentOrAlumni = async (req, res, next) => {
  await protect(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    if (req.user.role !== 'student' && req.user.role !== 'alumni') {
      return res.status(403).json({
        message: `Access denied. Student or alumni account required. Your role: ${req.user.role}`
      });
    }
    next();
  });
};

module.exports = { protect, authorize, optionalAuth, getClientInfo, protectStudent, protectAlumni, protectRecruiter, protectAdmin, protectStudentOrAlumni };
