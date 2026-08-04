import MeetingRoom from './MeetingRoom';
import '../meeting.css';

const MeetingPage = ({ roomName, token, serverUrl }) => {
  return <MeetingRoom roomName={roomName} token={token} serverUrl={serverUrl} />;
};

export default MeetingPage;
