const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc  Get all public rooms
// @route GET /api/rooms
// @access Private
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new room
// @route POST /api/rooms
// @access Private
const createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    // Check if name is taken
    const existingRoom = await Room.findOne({ name: name.trim() });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room name already taken' });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id,
      members: [req.user._id],
      isPrivate: isPrivate || false,
    });

    await room.populate('createdBy', 'username avatar');

    res.status(201).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Get room by ID
// @route GET /api/rooms/:roomId
// @access Private
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('members', 'username avatar isOnline')
      .populate('createdBy', 'username avatar');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Update a room
// @route PUT /api/rooms/:roomId
// @access Private (creator only)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    const { name, description } = req.body;

    if (name) room.name = name.trim();
    if (description !== undefined) room.description = description;

    await room.save();
    await room.populate('createdBy', 'username avatar');

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a room
// @route DELETE /api/rooms/:roomId
// @access Private (creator only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    // Delete all messages in the room
    await Message.deleteMany({ roomId: room._id });
    await room.deleteOne();

    res.json({ success: true, message: 'Room and all its messages deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRooms, createRoom, getRoomById, updateRoom, deleteRoom };
