const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].username} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
  } else {
    text = `${typingUsers.length} people are typing`;
  }

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
};

export default TypingIndicator;
