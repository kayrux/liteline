const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const User = require("./models/User");
const Message = require("./models/Message");
const Room = require("./models/Room");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const ws = require("ws");

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

async function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token was found");
    }
  });
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token; // ? in case it doesn't exist - will return undefined
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.json({ userId: null, username: null });
  }
});

app.get("/userRooms/:username", async (req, res) => {
  const { username } = req.params;
  const userRooms = await User.findOne({ username });
  console.log(`${username}'s rooms: `, userRooms.rooms);
  res.json(Object.assign({}, userRooms.rooms));
});

app.get("/messages/:roomname", async (req, res) => {
  const { roomname } = req.params; // TODO: check if room exists
  // get userId from token
  const userData = await getUserDataFromToken(req); // TODO: check if user in room

  // returns an array of documents with messages from given room name
  const messages = await Message.find({
    room: roomname,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

app.get("/roomMembers/:roomname", async (req, res) => {
  const { roomname } = req.params;
  const roomMembers = await Room.findOne({ name: roomname });
  const roomMembersArr = roomMembers.users;
  res.json(roomMembersArr);
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      res.json("user exists");
    } else {
      const createdUser = await User.create({
        username: username,
        password: hashedPassword,
        rooms: [],
      });

      jwt.sign(
        { userId: createdUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(201)
            .json({ id: createdUser._id, username: createdUser.username });
        }
      );
    }
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  } else {
    res.json("no user");
  }
});

app.post("/signout", async (req, res) => {
  // send back token as empty
  res.cookie("token", "", { sameSite: "none", secure: true });
  res.json("signed out");
});

app.post("/createRoom", async (req, res) => {
  const { roomname, username } = req.body;
  // Todo: verify room doesn't exist
  try {
    // create room
    const createdRoom = await Room.create({
      name: roomname,
      users: [username],
    });
    console.log("Created room: ", createdRoom);
    // Todo: Verify room was created
    if (createdRoom) {
      // update user's room
      const query = { username: username };
      User.findOne(query).then((doc) => {
        doc.rooms = [...doc.rooms, roomname];
        doc.save();
      });
      console.log(`Created room ${roomname} for ${username}.`);
      res.json("created");
    }
  } catch (err) {
    console.log(`Failed to create room ${roomname}.`);
    res.json("Server error or room already exists");
  }
});

// update room user list & user's room list
app.post("/joinRoom", async (req, res) => {
  const { roomname, username } = req.body;
  try {
    const query = { name: roomname };
    Room.findOne(query).then((room) => {
      if (room && !room.users.includes(username)) {
        room.users = [...room.users, username];
        room.save();

        User.findOne({ username: username }).then((user) => {
          if (user) {
            user.rooms = [...user.rooms, roomname];
            user.save();
          }
        });
        console.log(`Joined room ${roomname} for ${username}.`);
        res.json("joined");
      } else {
        console.log(`${username} failed to join ${roomname}`);
        res.json("room doesn't exit or already in room");
      }
    });
  } catch (err) {
    console.log(`Failed to join room ${roomname}.`);
    res.json("failed");
  }
});

app.post("/leaveRoom", async (req, res) => {
  const { selectedRoom, username } = req.body;
  try {
    const query = { name: selectedRoom };
    Room.findOne(query).then((room) => {
      console.log(room);
      if (room) {
        room.users = room.users.filter((user) => {
          return user !== username;
        });
        room.save();

        User.findOne({ username: username }).then((user) => {
          if (user) {
            user.rooms = user.rooms.filter((room) => {
              return room !== selectedRoom;
            });
            user.save();
            console.log(`Left room ${selectedRoom} for ${username}`);
            res.json({ message: "left", joinedRooms: user.rooms });
          }
        });
      }
    });
  } catch (err) {
    console.log(`Failed to leave room ${selectedRoom}.`);
    res.json("failed");
  }
});

app.post("/deleteRoom", async (req, res) => {
  const { roomname, username } = req.body;
  try {
    // get all room's user list then delete room from rooms collection
    const usersInRoom = [];
    await Room.findOne({ name: roomname }).then((room) => {
      if (room) {
        usersInRoom = room.users;
        room.remove();
      }
    });

    // remove room from all users room list in the room
    usersInRoom.forEach((user) => {
      User.findOne({ username: user }).then((userData) => {
        if (userData) {
          userData.rooms = userData.rooms.filter((room) => {
            return room !== roomname;
          });
          userData.save();
        }
      });
    });

    // delete all messages with the roomname
  } catch (err) {
    console.log(`Failed to leave room ${roomname}.`);
    res.json("failed");
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`);
});

// Event based Websockets - access all "connection" inside wss.clients
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function broadcastOnlineClientsList() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  // Ping clients every X=3 seconds and expect a "pong" response every Y=1 second(s)
  // If pong is not received, then connection is terminated and broadcasted
  connection.timer = setInterval(() => {
    connection.ping();
    connection.terminationTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      console.log("Connection terminated.");
      // notify clients that somebody disconnected
      broadcastOnlineClientsList();
    }, 1000);
  }, 3000);

  // Pong's are automatically sent by clients who receive a ping, this reads that and
  // clears the connection termination timer
  connection.on("pong", () => {
    clearTimeout(connection.terminationTimer);
  });

  // Read user info from cookie and add it to the connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const cookieTokenStr = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (cookieTokenStr) {
      const token = cookieTokenStr.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }  

  // On message event, message is stored in database and broadcasted to all connected clients
  connection.on("message", async (message) => {
    const msgData = JSON.parse(message.toString());
    const { event, sender, room, text } = msgData;
    console.log(msgData);
    if (event === "send message" && sender && room && text) {
      // getting a message from mongodb which auto includes the message id as ._id
      console.log(`${sender} in ${room} sent: ${text}`);
      const messageDoc = Message.create({
        sender,
        room,
        text,
      });

      [...wss.clients]
        .filter((c) => c.username !== sender)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              sender: connection.username,
              room,
              text,
              _id: messageDoc._id,
            })
          )
        );
    } else if (event === "leave room" || event === "join room") {
      [...wss.clients].filter((c) => c.username !== sender).forEach((c) => {
        c.send(JSON.stringify({
          event: event,
          sender: connection.username,
          room,
        }))
      })
    }
  });

  broadcastOnlineClientsList();
});
