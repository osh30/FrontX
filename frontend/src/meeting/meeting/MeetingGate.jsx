import { Hourglass, XCircle, Lock, UserMinus, LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';

const CONFIG = {
  waiting: {
    icon: Hourglass,
    title: 'In the waiting room',
    message: 'The host has been notified. You will be let in once they approve you.',
  },
  denied: {
    icon: XCircle,
    title: 'Request not approved',
    message: 'The host did not admit you to this meeting.',
  },
  locked: {
    icon: Lock,
    title: 'Meeting is locked',
    message: 'The host has locked this meeting. No new participants can join right now.',
  },
  removed: {
    icon: UserMinus,
    title: 'You were removed',
    message: 'The host removed you from this meeting.',
  },
  ended: {
    icon: LogOut,
    title: 'Meeting ended',
    message: 'The host ended this meeting.',
  },
  pending: {
    icon: ShieldCheck,
    title: 'Requesting access…',
    message: 'Contacting the host to verify your access.',
  },
};

const MeetingGate = ({ state, onLeave }) => {
  const config = CONFIG[state] || CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="fx-gate fx-backdrop">
      <div className="fx-gate__card fx-glass">
        <div className={`fx-gate__icon fx-gate__icon--${state}`}>
          {state === 'pending' ? <div className="fx-loader fx-loader--sm" /> : <Icon size={30} />}
        </div>
        <h1 className="fx-gate__title">{config.title}</h1>
        <p className="fx-gate__msg">{config.message}</p>
        <button className="fx-gate__leave" onClick={onLeave}>
          <ArrowLeft size={16} /> Leave meeting
        </button>
      </div>
    </div>
  );
};

export default MeetingGate;
