import { DoorOpen } from 'lucide-react';
import { useWaitingRoom } from '../hooks/useWaitingRoom';

const WaitingRoom = ({ socket, roomCode, isHost = false }) => {
  const { requests, admit, deny } = useWaitingRoom({ socket, roomCode, isHost });

  if (requests.length === 0) return null;

  return (
    <section className="fx-waiting fx-glass">
      <p className="fx-waiting__title">
        <DoorOpen size={17} /> Waiting room ({requests.length})
      </p>
      <ul className="fx-waiting__list">
        {requests.map((request) => (
          <li key={request.socketId} className="fx-waiting__item">
            <span className="fx-waiting__name">{request.user ? request.user.name : 'Guest'}</span>
            <button className="fx-waiting__admit" onClick={() => admit(request.socketId)}>
              Admit
            </button>
            <button className="fx-waiting__deny" onClick={() => deny(request.socketId)}>
              Deny
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WaitingRoom;
