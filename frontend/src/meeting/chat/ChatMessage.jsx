const ChatMessage = ({ message, currentUserId }) => {
  const { sender, text, createdAt } = message;
  const isOwn = sender && String(sender.id) === String(currentUserId);

  return (
    <div className={`fx-chat__msg ${isOwn ? 'fx-chat__msg--own' : ''}`}>
      <div className="fx-chat__meta">
        <span className="fx-chat__author">{sender ? sender.name : 'Unknown'}</span>
        <time className="fx-chat__time">
          {createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </time>
      </div>
      <div className="fx-chat__bubble">{text}</div>
    </div>
  );
};

export default ChatMessage;
