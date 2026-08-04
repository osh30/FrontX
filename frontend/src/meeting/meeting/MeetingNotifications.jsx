import { UserPlus, UserMinus, Hand, MonitorUp } from 'lucide-react';

const TYPE_ICON = {
  joined: UserPlus,
  left: UserMinus,
  'hand-raised': Hand,
  'screen-shared': MonitorUp,
  'screen-stopped': MonitorUp,
};

const typeText = (type, name) => {
  switch (type) {
    case 'joined':
      return `${name} joined the meeting`;
    case 'left':
      return `${name} left the meeting`;
    case 'hand-raised':
      return `${name} raised their hand`;
    case 'screen-shared':
      return `${name} started sharing their screen`;
    case 'screen-stopped':
      return `${name} stopped sharing their screen`;
    default:
      return name;
  }
};

const MeetingNotifications = ({ notifications = [], onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fx-notifs">
      {notifications.map((notification) => {
        const Icon = TYPE_ICON[notification.type] || Hand;
        return (
          <div key={notification.id} className={`fx-notif fx-notif--${notification.type}`}>
            <span className="fx-notif__icon">
              <Icon size={16} />
            </span>
            <p className="fx-notif__text">{typeText(notification.type, notification.name)}</p>
            <button
              type="button"
              className="fx-notif__close"
              onClick={() => onDismiss(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MeetingNotifications;
