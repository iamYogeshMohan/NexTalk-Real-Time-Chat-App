const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getMessages);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
