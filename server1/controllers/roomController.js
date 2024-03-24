const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const User = db.users;
const Room = db.chatrooms;
const Message = db.messages;
const sequelize = db.sequelize;

const findRoomMembersByRoomId = async (id) => {
  return await sequelize.query(
    `SELECT uid, username FROM users WHERE uid IN ( SELECT UNNEST(members) FROM chatrooms WHERE id = '${id}' ) ORDER BY username ASC`,
    { type: QueryTypes.SELECT }
  );
};

/**
 * @desc create a new chatroom
 * @route POST /api/rooms/create
 * @access public
 */
const createRoom = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.uid);
  const { roomName } = req.body;

  if (!roomName) {
    res.status(400).send({ message: "Please fill in a room name." }); // 400 Bad Request
  }
  try {
    const room = await Room.create({
      name: roomName,
      owner: user.uid,
      members: [user.uid],
    });

    if (room) {
      const rooms = [...new Set([...user.rooms, room.id])];
      await user.update({ rooms }, { where: { uid: user.uid } });

      const roomMembers = await findRoomMembersByRoomId(room.id);

      return res.status(201).json({
        roomCode: room.id,
        roomName: room.name,
        owner: room.owner,
        members: roomMembers,
      });
    } else {
      return res.status(400).send({
        message: "Could not create room - check Room model.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: "Could not create room - query failure.",
    });
  }
});

/**
 * @desc join a chatroom
 * @route POST /api/rooms/join
 * @access public
 */
const joinRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please fill in a room code." }); // 400 Bad Request
  }

  try {
    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res
        .status(400)
        .send({ message: "Could not join room - user not found." });
    }
    const room = await Room.findByPk(roomCode);
    if (!room) {
      return res
        .status(400)
        .send({ message: "Could not join room - room not found." });
    }
    if (room && user) {
      const members = [...new Set([...room.members, user.uid])];
      const rooms = [...new Set([...user.rooms, roomCode])];
      await room.update({ members }, { where: { id: roomCode } });
      await user.update({ rooms }, { where: { uid: user.uid } });

      const roomMembers = await findRoomMembersByRoomId(room.id);

      return res.status(200).json({
        roomCode: room.id,
        roomName: room.name,
        owner: room.owner,
        members: roomMembers,
      });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not join room - query failure." });
  }
});

/**
 * @desc leave a chatroom
 * @route POST /api/rooms/leave
 * @access public
 */
const leaveRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please provide a room code." }); // 400 Bad Request
  }

  try {
    const user = await User.findByPk(req.user.uid);
    const room = await Room.findByPk(roomCode);
    if (user && room) {
      const members = room.members.filter((id) => id !== user.uid);
      const rooms = user.rooms.filter((id) => id !== roomCode);

      await room.update({ members }, { where: { id: roomCode } });
      await user.update({ rooms }, { where: { uid: user.uid } });

      return res.status(200).json(`Successfully left ${room.name}.`);
    } else {
      return res.status(400).send({
        message: "Could not leave room - could not find user or room.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: "Could not leave room - query failure.",
    });
  }
});

/**
 * @desc delete a chatroom (room owner only)
 * @route POST /api/rooms/delete
 * @access private
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please provide a room code." }); // 400 Bad Request
  }
  try {
    const user = await User.findByPk(req.user.uid);
    const room = await Room.findByPk(roomCode);

    if (!user) {
      return res.status(400).send({
        message: "Could not delete room - user not found.",
      });
    } else if (!room) {
      return res.status(400).send({
        message: "Could not delete room - room not found.",
      });
    } else if (user.uid !== room.owner) {
      return res.status(400).send({
        message: "Could not delete room - not room owner.",
      });
    } else {
      // update every room member's available rooms
      room.members.map(async (member) => {
        const user = await User.findByPk(member);
        const rooms = user.rooms.filter((id) => id !== roomCode);
        await user.update({ rooms }, { where: { uid: member } });
      });

      // remove this room from room table
      await Message.destroy({ where: { room: roomCode } });
      await Room.destroy({ where: { id: roomCode } });

      return res.status(200).json(`Successfully deleted ${room.name}`);
    }
  } catch (err) {
    return res.status(400).send({
      message: "Could not delete room - query failure.",
    });
  }
});

/**
 * @desc get detail of a chatroom
 * @route GET /api/rooms/:id
 * @access public
 */
const getRoomInfo = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .send({ message: "Room ID could not be found in request parameters" });
  }

  try {
    const roomData = await getRoomInfoLocal(req.params.id);
    return res.status(200).json(roomData);
  } catch (err) {
    return res.status(400).send({ message: "Failed to fetch room data." });
  }
});

const getRoomInfoLocal = async (roomId) => {
  try {
    const room = await Room.findByPk(roomId);

    if (room) {
      const roomMembers = await findRoomMembersByRoomId(room.id);
      return {
        roomCode: room.id,
        roomName: room.name,
        owner: room.owner,
        members: roomMembers,
      };
    } else {
      throw new Error("Room not found.");
    }
  } catch (err) {
    throw new Error("Failed to fetch room data.");
  }
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomInfo,
  getRoomInfoLocal,
  findRoomMembersByRoomId,
};
