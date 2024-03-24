const { findRoomMembersByRoomId } = require("../controllers/roomController.js");
const db = require("../models");
const User = db.users;
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const parseCookie = (socket) => {
  const cookies = socket.request.headers.cookie;
  if (cookies) {
    const cookieTokenStr = cookies
      .split(";")
      .find((str) => str.startsWith("jwt="));
    if (cookieTokenStr) {
      const token = cookieTokenStr.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          socket.userId = userId;
          socket.username = username;
        });
      }
    }
  }
};

const getUserDataBySocketId = (io, socketId) => {
  const sockRef = io.sockets.sockets.get(socketId);
  return { uid: sockRef.userId, username: sockRef.username };
};

const getOnlineMembersByRoomId = (io, sockets) => {
  const onlineMembers = [];
  Array.from(sockets).forEach((socketId) =>
    onlineMembers.push(getUserDataBySocketId(io, socketId))
  );
  return onlineMembers;
};

const initWebSocket = (io) => {
  io.on("connection", (socket) => {
    parseCookie(socket);
    console.log(`User: ${socket.username} >> connected.`);

    // Add users to all their (socket) rooms -> Broadcast to room members the updated online list
    socket.on("online", async () => {
      const user = await User.findByPk(socket.userId);
      if (user) {
        console.log(
          `User: ${socket.username} >> is online >> rooms:`,
          user.rooms
        );
        user.rooms.forEach((room) => {
          socket.join(room);
        });

        const rooms = Array.from(socket.rooms).splice(1);
        rooms.forEach((room) => {
          const sockets = io.sockets.adapter.rooms.get(room);
          const onlineMembers = getOnlineMembersByRoomId(io, sockets);

          io.to(room).emit("online", {
            roomId: room,
            onlineMembers: onlineMembers,
            requester: socket.userId,
          });
        });
      }
    });

    // Broadcast online user list without user to the each room user was in
    socket.on("disconnecting", () => {
      console.log(
        `User: ${socket.username} >> disconnected from `,
        socket.rooms
      );
      const rooms = Array.from(socket.rooms).splice(1);
      rooms.forEach((room) => {
        const sockets = io.sockets.adapter.rooms.get(room);
        const onlineMembers = [];
        Array.from(sockets).forEach((socketId) => {
          const sockRef = io.sockets.sockets.get(socketId);
          if (sockRef.userId !== socket.userId) {
            onlineMembers.push(getUserDataBySocketId(io, socketId));
          }
        });
        io.to(room).emit("online", {
          roomId: room,
          onlineMembers: onlineMembers,
          requester: socket.userId,
        });
      });
    });

    // Receive message > Store message in db > broadcast received message to roomies
    socket.on("message", (data) => {
      console.log(
        `User: ${socket.username} >> sent a message to room ${data.room}.`
      );
      socket.to(data.room).emit("message", data);
    });

    // Event: User joins room >> Send updated online and room member list to room clients
    socket.on("joinRoom", async (data) => {
      console.log(`User: ${socket.username} >> joined room ${data}.`);
      const roomId = data;
      socket.join(roomId);

      const sockets = io.sockets.adapter.rooms.get(roomId);
      const onlineMembers = getOnlineMembersByRoomId(io, sockets);
      const roomMembers = await findRoomMembersByRoomId(roomId);
      io.to(roomId).emit("joinRoom", {
        roomId: roomId,
        roomMembers: roomMembers,
        onlineMembers: onlineMembers,
        joinedUser: socket.username,
        requester: socket.userId,
      });
    });

    socket.on("leaveRoom", async (data) => {
      console.log(`User: ${socket.username} >> left room ${data}.`);
      const roomId = data;
      socket.leave(roomId);

      const sockets = io.sockets.adapter.rooms.get(roomId);
      if (sockets) {
        const onlineMembers = getOnlineMembersByRoomId(io, sockets);
        const roomMembers = await findRoomMembersByRoomId(roomId);
        io.to(roomId).emit("leftRoom", {
          roomId: roomId,
          roomMembers: roomMembers,
          onlineMembers: onlineMembers,
          requester: socket.userId,
        });
      }
    });

    socket.on("deleteRoom", async (data) => {
      console.log(`User: ${socket.username} >> deleted room ${data}.`);
      const roomId = data;
      socket.leave(roomId);

      io.to(roomId).emit("deletedRoom", {
        roomId: roomId,
        requester: socket.userId,
      });
    });

    // A user updated username, broadcast to all of his available rooms
    socket.on("updateUsername", async (data) => {
      console.log(`User: ${socket.username} >> updated username to ${data}.`);
      socket.username = data;

      const user = await User.findByPk(socket.userId);
      if (user) {
        const rooms = Array.from(socket.rooms).splice(1);
        rooms.forEach(async (room) => {
          const sockets = io.sockets.adapter.rooms.get(room);
          const onlineMembers = getOnlineMembersByRoomId(io, sockets);
          const roomMembers = await findRoomMembersByRoomId(room);
          io.to(room).emit("updateUsername", {
            roomId: room,
            roomMembers: roomMembers,
            onlineMembers: onlineMembers,
            updatedUser: user.uid,
            updatedUsername: user.username,
            requester: socket.userId,
          });
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User: ${socket.username} >> disconnected.`);
    });
  });
};

module.exports = {
  initWebSocket,
};
