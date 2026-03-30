import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import RoomList from '../components/RoomList';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';

const ChatPage = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader-spinner" />
        <p>Loading NexTalk...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Fetch rooms on mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data.rooms || []);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomSelect = (room) => {
    if (!socket) return;
    if (activeRoom) {
      socket.emit('leave_room', { roomId: activeRoom._id });
    }
    setActiveRoom(room);
    socket.emit('join_room', { roomId: room._id });
    setSidebarOpen(false);
  };

  const handleCreateRoom = async (name, description) => {
    try {
      const res = await api.post('/rooms', { name, description });
      const newRoom = res.data.room;
      setRooms((prev) => [newRoom, ...prev]);
      handleRoomSelect(newRoom);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      if (activeRoom?._id === roomId) setActiveRoom(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  return (
    <div className="chat-page">
      {/* Top bar (mobile) */}
      <header className="chat-topbar">
        <button
          className="topbar-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="topbar-title">
          <span className="topbar-logo">💬</span>
          {activeRoom ? activeRoom.name : 'NexTalk'}
        </div>
        <div className="topbar-user">
          <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 13 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <button className="topbar-logout" onClick={logout} title="Logout">
            ⏻
          </button>
        </div>
      </header>

      <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Left Sidebar - Rooms */}
        <aside className="sidebar-left">
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <span className="brand-icon">💬</span>
              <span className="brand-name">NexTalk</span>
            </div>
            <div className="sidebar-user-info">
              <div className="avatar-circle">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="sidebar-user-details">
                <span className="sidebar-username">{user?.username}</span>
                <span className="sidebar-status">● Online</span>
              </div>
              <button className="logout-btn" onClick={logout} title="Logout">
                ⏻
              </button>
            </div>
          </div>
          <RoomList
            rooms={rooms}
            activeRoom={activeRoom}
            onSelectRoom={handleRoomSelect}
            onCreateRoom={handleCreateRoom}
            onDeleteRoom={handleDeleteRoom}
            loading={roomsLoading}
            currentUser={user}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {activeRoom ? (
            <ChatWindow room={activeRoom} currentUser={user} />
          ) : (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h2>Welcome to NexTalk</h2>
              <p>Select a room from the sidebar to start chatting.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar - Users */}
        {activeRoom && (
          <aside className="sidebar-right">
            <UserList roomId={activeRoom._id} />
          </aside>
        )}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default ChatPage;
