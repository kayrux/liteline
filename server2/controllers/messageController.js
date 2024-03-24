const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const Message = db.messages;
const sequelize = db.sequelize;

const findMessagesByRoomId = async (id) => {
  return await sequelize.query(
    `SELECT m.*, u.username FROM messages AS m LEFT JOIN users AS u ON m.sender = u.uid WHERE m.room = '${id}' ORDER BY m.timestamp ASC`,
    { type: QueryTypes.SELECT }
  );
};

/**
 * @desc add a new message
 * @route POST /api/messages/:roomId
 * @access public
 */
const addMessage = asyncHandler(async (req, res) => {
  const { sender, message, timestamp, room } = req.body;

  if (!sender || !timestamp || !room) {
    return res.status(400).send({
      message: "Missing values for sender, timestamp or room.",
    }); // 400 Bad Request
  }

  try {
    const newMessage = await Message.create({
      sender,
      room,
      timestamp,
      message,
    });

    if (newMessage) {
      return res.status(200).json("Message successfully added.");
    } else {
      return res
        .status(400)
        .send({ message: "Could not add message - check Message model." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not add message - query failure." });
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
      .send({ message: "Room ID could not be found in request parameters." });
  }

  try {
    const messages = await findMessagesByRoomId(req.params.id);

    if (messages) {
      return res.status(200).json(messages);
    } else {
      return res
        .status(400)
        .send({ message: "Can't retrieve messages from db." });
    }
  } catch (err) {
    return res.status(400).send({ message: "Failed to fetch room messages." });
  }
});

module.exports = {
  addMessage,
  getMessagesByRoomId,
};
