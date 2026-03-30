const MessageBubble = ({ message, isOwn, onDelete }) => {
  if (message.system) {
    return (
      <div className="system-message">
        <span>{message.text}</span>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const avatarLetter = message.sender?.username?.[0]?.toUpperCase() || '?';

  if (message.isDeleted) {
    return (
      <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && (
          <div className="avatar-circle message-avatar">{avatarLetter}</div>
        )}
        <div className={`message-bubble deleted`}>
          <em className="deleted-text">🚫 Message deleted</em>
          <span className="message-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="avatar-circle message-avatar">{avatarLetter}</div>
      )}
      <div className="message-content">
        {!isOwn && (
          <span className="message-sender">{message.sender?.username}</span>
        )}
        <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
          <p className="message-text">{message.text}</p>
          <div className="message-footer">
            <span className="message-time">{formatTime(message.createdAt)}</span>
            {isOwn && (
              <button
                className="delete-msg-btn"
                onClick={() => onDelete(message._id)}
                title="Delete message"
                aria-label="Delete message"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
