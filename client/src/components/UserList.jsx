import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const UserList = ({ roomId }) => {
  const { socket } = useSocket();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const onRoomMembers = (memberList) => {
      setMembers(memberList);
    };

    socket.on('room_members', onRoomMembers);

    return () => {
      socket.off('room_members', onRoomMembers);
    };
  }, [socket, roomId]);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <span>Members — {members.length}</span>
      </div>
      {members.length === 0 ? (
        <p className="users-empty">No members online</p>
      ) : (
        <ul className="users-ul">
          {members.map((member) => (
            <li key={member.socketId || member.userId} className="user-item">
              <div className="user-avatar-wrap">
                <div className="avatar-circle user-avatar">
                  {member.username?.[0]?.toUpperCase()}
                </div>
                <span className="online-dot" />
              </div>
              <span className="user-item-name">{member.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
