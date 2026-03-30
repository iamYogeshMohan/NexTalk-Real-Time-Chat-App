const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const {
  addUser,
  removeUser,
  removeUserFromRoom,
  getRoomMembers,
  getUserRoom,
} = require('./roomManager');

const socketHandler = (io) => {
  // Middleware: authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
      };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Socket connected: ${socket.id} (${socket.user.username})`);

    // ─── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('join_room', async ({ roomId }) => {
      try {
        // Leave previous room if any
        const prevRoomId = getUserRoom(socket.id);
        if (prevRoomId && prevRoomId !== roomId) {
          socket.leave(prevRoomId);
          const removedUser = removeUserFromRoom(prevRoomId, socket.id);
          if (removedUser) {
            io.to(prevRoomId).emit('user_left', {
              userId: socket.user.id,
              username: socket.user.username,
              message: `${socket.user.username} left the room`,
            });
            io.to(prevRoomId).emit('room_members', getRoomMembers(prevRoomId));
          }
        }

        socket.join(roomId);
        addUser(roomId, {
          userId: socket.user.id,
          username: socket.user.username,
          avatar: socket.user.avatar,
          socketId: socket.id,
        });

        // Update online status in DB
        await User.findByIdAndUpdate(socket.user.id, { isOnline: true });

        // Notify room
        io.to(roomId).emit('room_members', getRoomMembers(roomId));
        socket.to(roomId).emit('user_joined', {
          userId: socket.user.id,
          username: socket.user.username,
          message: `${socket.user.username} joined the room`,
        });

        console.log(`📥 ${socket.user.username} joined room ${roomId}`);
      } catch (err) {
        console.error('join_room error:', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ─── LEAVE ROOM ───────────────────────────────────────────────────────────
    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
      const removedUser = removeUserFromRoom(roomId, socket.id);

      if (removedUser) {
        socket.to(roomId).emit('user_left', {
          userId: socket.user.id,
          username: socket.user.username,
          message: `${socket.user.username} left the room`,
        });
        io.to(roomId).emit('room_members', getRoomMembers(roomId));
      }

      console.log(`📤 ${socket.user.username} left room ${roomId}`);
    });

    // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
    socket.on('send_message', async ({ roomId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const message = await Message.create({
          roomId,
          sender: socket.user.id,
          text: text.trim(),
        });

        await message.populate('sender', 'username avatar');

        io.to(roomId).emit('receive_message', message);
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── TYPING START ─────────────────────────────────────────────────────────
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('typing_update', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: true,
      });
    });

    // ─── TYPING STOP ─────────────────────────────────────────────────────────
    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('typing_update', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: false,
      });
    });

    // ─── DELETE MESSAGE ───────────────────────────────────────────────────────
    socket.on('delete_message', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.sender.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to delete this message' });
          return;
        }

        message.isDeleted = true;
        await message.save();

        io.to(message.roomId.toString()).emit('message_deleted', { messageId });
      } catch (err) {
        console.error('delete_message error:', err);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // ─── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 Socket disconnected: ${socket.id} (${socket.user.username})`);

      const removedRooms = removeUser(socket.id);

      // Update DB
      await User.findByIdAndUpdate(socket.user.id, { isOnline: false }).catch(() => {});

      // Notify affected rooms
      for (const { roomId, user } of removedRooms) {
        io.to(roomId).emit('user_left', {
          userId: user.userId,
          username: user.username,
          message: `${user.username} disconnected`,
        });
        io.to(roomId).emit('room_members', getRoomMembers(roomId));
      }
    });
  });
};

module.exports = socketHandler;
