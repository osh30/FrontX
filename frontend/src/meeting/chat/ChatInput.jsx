import { useState } from 'react';

const ChatInput = ({ disabled = false, onSend }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  return (
    <form className="meeting-chat__input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        placeholder="Type a message"
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
};

export default ChatInput;
