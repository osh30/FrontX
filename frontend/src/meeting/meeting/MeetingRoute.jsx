import { useParams } from 'react-router-dom';
import MeetingPage from './MeetingPage';
import { useAuth } from '../../context/AuthContext';

const MeetingRoute = () => {
  const { roomId } = useParams();
  const { user } = useAuth();

  return <MeetingPage roomName={roomId} userName={user?.name || ''} autoJoin />;
};

export default MeetingRoute;
