// roomManager.js — tracks online users per room using a Map
// Structure: roomId → Set of { userId, username, socketId, avatar }

const roomManager = new Map();

/**
 * Add a user to a room
 */
const addUser = (roomId, user) => {
  if (!roomManager.has(roomId)) {
    roomManager.set(roomId, new Set());
  }
  // Remove existing entry for this socket (in case of re-join)
  const members = roomManager.get(roomId);
  for (const member of members) {
    if (member.socketId === user.socketId) {
      members.delete(member);
      break;
    }
  }
  members.add(user);
};

/**
 * Remove a user from all rooms by socketId
 * Returns list of { roomId, user } that were removed
 */
const removeUser = (socketId) => {
  const removed = [];
  for (const [roomId, members] of roomManager.entries()) {
    for (const member of members) {
      if (member.socketId === socketId) {
        members.delete(member);
        removed.push({ roomId, user: member });
        break;
      }
    }
    // Clean up empty rooms
    if (members.size === 0) {
      roomManager.delete(roomId);
    }
  }
  return removed;
};

/**
 * Remove a user from a specific room by socketId
 */
const removeUserFromRoom = (roomId, socketId) => {
  if (!roomManager.has(roomId)) return null;
  const members = roomManager.get(roomId);
  for (const member of members) {
    if (member.socketId === socketId) {
      members.delete(member);
      if (members.size === 0) roomManager.delete(roomId);
      return member;
    }
  }
  return null;
};

/**
 * Get all members of a room as an array
 */
const getRoomMembers = (roomId) => {
  if (!roomManager.has(roomId)) return [];
  return Array.from(roomManager.get(roomId));
};

/**
 * Get which room a socket is currently in
 */
const getUserRoom = (socketId) => {
  for (const [roomId, members] of roomManager.entries()) {
    for (const member of members) {
      if (member.socketId === socketId) {
        return roomId;
      }
    }
  }
  return null;
};

module.exports = { addUser, removeUser, removeUserFromRoom, getRoomMembers, getUserRoom };
