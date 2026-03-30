import { useState, useEffect, useRef, useCallback } from 'react';
import useChat from '../hooks/useChat';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const TYPING_DEBOUNCE = 1500;

const ChatWindow = ({ room, currentUser }) => {
  const { messages, typingUsers, loading, sendMessage, deleteMessage } = useChat(room._id);
  const { socket } = useSocket();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear input + typing when room changes
  useEffect(() => {
    setInputText('');
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [room._id]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      socket?.emit('typing_stop', { roomId: room._id });
    }
  }, [isTyping, socket, room._id]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing_start', { roomId: room._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_DEBOUNCE);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-window">
      {/* Room header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-room-icon">#</div>
          <div>
            <h2 className="chat-room-name">{room.name}</h2>
            {room.description && (
              <p className="chat-room-desc">{room.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-area">
        {loading ? (
          <div className="messages-loading">
            <div className="page-loader-spinner" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">👋</div>
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                msg.sender?._id === currentUser?._id ||
                msg.sender === currentUser?._id
              }
              onDelete={deleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input bar */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          id="message-input"
          type="text"
          className="chat-input"
          placeholder={`Message #${room.name}`}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          maxLength={2000}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
