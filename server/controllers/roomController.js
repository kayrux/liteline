const asyncHandler = require("express-async-handler");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const User = db.users;
const Room = db.chatrooms;
const sequelize = db.sequelize;

const findMembersById = async (id) => {
  return await sequelize.query(
    `SELECT uid, username FROM users WHERE uid IN ( SELECT UNNEST(members) FROM chatrooms WHERE id = '${id}' )`,
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
    res.status(400).send({ message: "Please fill in a room name" }); // 400 Bad Request
  }

  const room = await Room.create({
    name: roomName,
    owner: user.uid,
    members: [user.uid],
  });

  if (room) {
    const rooms = [...new Set([...user.rooms, room.id])];

    await user.update(
      { rooms },
      {
        where: {
          uid: user.uid,
        },
      }
    );

    const roomMembers = await findMembersById(room.id);

    return res.status(201).json({
      roomCode: room.id,
      roomName: room.name,
      owner: room.owner,
      members: roomMembers,
    });
  } else {
    return res
      .status(400)
      .send({ message: "Could not create room - Invalid entry" });
  }
});

/**
 * @desc join a chatroom
 * @route POST /api/rooms/join
 * @access public
 */
const joinRoom = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.uid);
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please fill in a room code" }); // 400 Bad Request
  }

  const room = await Room.findByPk(roomCode);
  const members = [...new Set([...room.members, user.uid])];
  const rooms = [...new Set([...user.rooms, roomCode])];

  if (user && room) {
    await room.update(
      { members },
      {
        where: {
          id: roomCode,
        },
      }
    );

    await user.update(
      { rooms },
      {
        where: {
          uid: user.uid,
        },
      }
    );

    const roomMembers = await findMembersById(room.id);

    return res.status(200).json({
      roomCode: room.id,
      roomName: room.name,
      owner: room.owner,
      members: roomMembers,
    });
  } else {
    return res
      .status(400)
      .send({ message: "Could not join room - Invalid entry" });
  }
});

/**
 * @desc leave a chatroom
 * @route POST /api/rooms/leave
 * @access public
 */
const leaveRoom = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.uid);
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please provide a room code" }); // 400 Bad Request
  }

  const room = await Room.findByPk(roomCode);
  const members = room.members.filter((id) => id !== user.uid);
  const rooms = user.rooms.filter((id) => id !== roomCode);

  if (user && room) {
    await room.update(
      { members },
      {
        where: {
          id: roomCode,
        },
      }
    );

    await user.update(
      { rooms },
      {
        where: {
          uid: user.uid,
        },
      }
    );

    return res.status(200).json("Successfully leave room");
  } else {
    return res
      .status(400)
      .send({ message: "Could not leave room - invalid user or room code" });
  }
});

/**
 * @desc delete a chatroom (room owner only)
 * @route POST /api/rooms/delete
 * @access private
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.uid);
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).send({ message: "Please provide a room code" }); // 400 Bad Request
  }

  const room = await Room.findByPk(roomCode);

  if (user && room && user.uid === room.owner) {
    room.members.map(async (member) => {
      const user = await User.findByPk(member);
      const rooms = user.rooms.filter((id) => id !== roomCode);
      await user.update(
        { rooms },
        {
          where: {
            uid: member,
          },
        }
      );
    });

    await Room.destroy({ where: { id: roomCode } });

    return res.status(200).json("Successfully delete room");
  } else {
    return res.status(400).send({
      message:
        "Could not delete room - invalid user or room code or not room owner",
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

  const room = await Room.findByPk(req.params.id);

  if (room) {
    const roomMembers = await findMembersById(room.id);
    return res.status(200).json({
      roomCode: room.id,
      roomName: room.name,
      owner: room.owner,
      members: roomMembers,
    });
  } else {
    return res.status(400).send({ message: "Room not found" });
  }
});

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomInfo,
  findMembersById,
};
