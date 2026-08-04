const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getOrCreateMentorshipMeeting, getOrCreateSessionMeeting } = require('./meetings/services/meetingService');
const MentorshipSession = require('./models/MentorshipSession');
const Session = require('./models/Session');
const User = require('./models/User');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontx');
  console.log('Connected to DB');

  try {
    const mentorshipSession = await MentorshipSession.findOne().sort({ createdAt: -1 });
    if (mentorshipSession) {
      console.log('Found MentorshipSession:', mentorshipSession._id, mentorshipSession.sessionTitle);
      const user = await User.findById(mentorshipSession.alumniId);
      console.log('Testing with user:', user._id);
      
      const result = await getOrCreateMentorshipMeeting({ user: { id: user._id, name: user.name, role: user.role }, sessionId: mentorshipSession._id });
      console.log('Result:', result);
    }
  } catch (err) {
    console.error('Error in getOrCreateMentorshipMeeting:', err);
  }
  
  try {
    const session = await Session.findOne().sort({ createdAt: -1 });
    if (session) {
      console.log('Found Session:', session._id, session.title);
      const user = await User.findById(session.alumni);
      console.log('Testing with user:', user._id);
      
      const result = await getOrCreateSessionMeeting({ user: { id: user._id, name: user.name, role: user.role }, sessionId: session._id });
      console.log('Result:', result);
    }
  } catch (err) {
    console.error('Error in getOrCreateSessionMeeting:', err);
  }

  mongoose.disconnect();
}

run();
