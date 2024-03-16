const express = require("express");
const {
  addMessage,
  getMessagesByRoomId,
} = require("../controllers/messageController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/:id", getMessagesByRoomId).post("/:id", protect, addMessage);

module.exports = router;
