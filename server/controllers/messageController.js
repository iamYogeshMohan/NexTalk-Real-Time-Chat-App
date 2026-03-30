const Message = require('../models/Message');

// @desc  Get messages for a room (paginated)
// @route GET /api/messages/:roomId
// @access Private
const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ roomId });

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Soft delete a message
// @route DELETE /api/messages/:messageId
// @access Private (sender only)
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true, message: 'Message deleted', data: message });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, deleteMessage };
