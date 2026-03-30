import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

const useChat = (roomId) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const typingTimeouts = useRef({});

  // Fetch message history on room change
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${roomId}?limit=50`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    setTypingUsers([]);
    setMembers([]);
  }, [roomId]);

  // Attach socket listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    const onReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true } : m
        )
      );
    };

    const onTypingUpdate = ({ userId, username, isTyping }) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== userId);
        if (isTyping) return [...filtered, { userId, username }];
        return filtered;
      });

      // Auto-clear typing after 3s
      if (isTyping) {
        if (typingTimeouts.current[userId]) {
          clearTimeout(typingTimeouts.current[userId]);
        }
        typingTimeouts.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        }, 3000);
      }
    };

    const onRoomMembers = (memberList) => {
      setMembers(memberList);
    };

    const onUserJoined = ({ userId, username, message }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `system-${Date.now()}`,
          system: true,
          text: message,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = ({ userId, username, message }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `system-${Date.now()}`,
          system: true,
          text: message,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('typing_update', onTypingUpdate);
    socket.on('room_members', onRoomMembers);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);

    return () => {
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('typing_update', onTypingUpdate);
      socket.off('room_members', onRoomMembers);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);

      // Clear typing timeouts
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      typingTimeouts.current = {};
    };
  }, [socket, roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!socket || !roomId || !text.trim()) return;
      socket.emit('send_message', { roomId, text });
    },
    [socket, roomId]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      if (!socket) return;
      socket.emit('delete_message', { messageId });
    },
    [socket]
  );

  return { messages, typingUsers, members, loading, sendMessage, deleteMessage };
};

export default useChat;
