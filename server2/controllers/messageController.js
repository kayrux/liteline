const asyncHandler = require("express-async-handler");
const db = require("../models");
const Message = db.messages;

/**
 * @desc add a new message
 * @route POST /api/messages/:roomId
 * @access public
 */
const addMessage = asyncHandler(async (req, res) => {
  const { sender, sendername, message, timestamp, room } = req.body;

  if (!sender || !sendername || !timestamp || !room) {
    return res.status(400).send({
      message: "Missing values for sender, sendername, timestamp or room",
    }); // 400 Bad Request
  }

  const newMessage = await Message.create(req.body);

  if (newMessage) {
    return res.status(200).json("Message successfully added");
  } else {
    return res.status(400).send({ message: "Room not found" });
  }
});

/**
 * @desc get all messages in a room
 * @route GET /api/messages/:roomId
 * @access public
 */
const getMessagesByRoomId = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .send({ message: "Room ID could not be found in request parameters" });
  }

  const messages = await Message.findAll({
    where: {
      room: req.params.id,
    },
  });

  if (messages) {
    return res.status(200).json(messages);
  } else {
    return res.status(400).send({ message: "Room not found" });
  }
});

module.exports = {
  addMessage,
  getMessagesByRoomId,
};
