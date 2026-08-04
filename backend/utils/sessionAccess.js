const Session = require('../models/Session');
const MentorshipSession = require('../models/MentorshipSession');

const getSessionAccess = async (sessionId, sessionType, userId) => {
  let session;
  if (sessionType === 'group') {
    session = await MentorshipSession.findById(sessionId);
  } else {
    session = await Session.findById(sessionId);
  }
  if (!session) return { session: null, role: null };

  const alumniId = session.alumniId || session.alumni;
  const isAlumni = alumniId && alumniId.toString() === userId.toString();

  let isStudent = false;
  if (sessionType === 'group') {
    isStudent = session.selectedStudents?.some(s => s.toString() === userId.toString());
  } else {
    isStudent = session.student && session.student.toString() === userId.toString();
  }

  return { session, role: isAlumni ? 'alumni' : isStudent ? 'student' : null };
};

module.exports = { getSessionAccess };
