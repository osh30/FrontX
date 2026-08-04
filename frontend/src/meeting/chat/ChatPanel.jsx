import { useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

const typingLabel = (users) => {
  if (users.length === 1) return `${users[0].name} is typing…`;
  return `${users.map((u) => u.name).join(', ')} are typing…`;
};

const ChatPanel = ({ messages = [], onSend, connected = true, onClose, currentUserId, typingUsers = [], onTyping }) => {
  const listRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (onTyping) onTyping(false);
    };
  }, [onTyping]);

  const sendTyping = (typing) => {
    if (onTyping) onTyping(typing);
  };

  const handleTyping = () => {
    if (!connected) return;
    sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(false), 2500);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector('input');
    const text = input.value.trim();
    if (!text || !connected) return;
    onSend(text);
    input.value = '';
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    sendTyping(false);
  };

  const handleBlur = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    sendTyping(false);
  };

  return (
    <aside className="fx-panel fx-glass">
      <header className="fx-panel__header">
        <span className="fx-panel__title">
          <MessageSquare /> In-meeting chat
        </span>
        <button className="fx-panel__close" onClick={onClose} aria-label="Close chat">
          <X size={18} />
        </button>
      </header>

      <div className="fx-panel__body">
        <div className="fx-chat__list" ref={listRef}>
          {messages.length === 0 ? (
            <div className="fx-chat__empty">
              <div>
                <MessageSquare />
                <p>No messages yet.<br />Say hello to everyone 👋</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} currentUserId={currentUserId} />
            ))
          )}
        </div>

        <div className="fx-chat__typing">
          {typingUsers.length > 0 && <span className="fx-chat__typing-pill">{typingLabel(typingUsers)}</span>}
        </div>

        <form className="fx-chat__input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Send a message"
            disabled={!connected}
            onInput={handleTyping}
            onBlur={handleBlur}
          />
          <button type="submit" disabled={!connected} aria-label="Send">
            <Send size={17} />
          </button>
        </form>
      </div>
    </aside>
  );
};

export default ChatPanel;
