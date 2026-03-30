const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllRooms);
router.post('/', protect, createRoom);
router.get('/:roomId', protect, getRoomById);
router.put('/:roomId', protect, updateRoom);
router.delete('/:roomId', protect, deleteRoom);

module.exports = router;
