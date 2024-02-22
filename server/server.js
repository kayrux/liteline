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
  console.log(token);
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      console.log("User data: ", userData);
      res.json(userData);
    });
  } else {
    res.json({ userId: null, username: null });
    // res.status(401).json("no token - unauthorized"); ToDo - bug: when UserContext uses this endpoint
  }
});

app.get("/userRooms/:username", async (req, res) => {
  const { username } = req.params;
  const userRooms = await User.findOne({ username });
  console.log(userRooms);
  res.json(Object.assign({}, userRooms.rooms));
});

app.get("/messages/:roomname", async (req, res) => {
  const { roomname } = req.params; // TODO: check if room exists
  // get userId from token
  const userData = await getUserDataFromToken(req); // TODO: check if user in room

  // returns an array of documents with messages from given room name
  const messages = await Message.find({
    room: roomname,
  }).sort({createdAt:1});

  // console.log(messages);
  res.json(messages);
});

app.get("/roomMembers/:roomname", async (req, res) => {
  const { roomname } = req.params;
  console.log("Room name: ", roomname);
  const roomMembers = await Room.findOne({ name: roomname });
  console.log("Room members: ",roomMembers.users);
  const roomMembersArr = roomMembers.users;
  res.json(roomMembersArr);
})

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
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
          .json({ id: createdUser._id });
      }
    );
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
  }
});

app.post("/createRoom", async (req, res) => {
  const { roomname, username } = req.body;
  // Todo: verify room doesn't exist
  try {
    // create room
    const createdRoom = await Room.create({
      name: roomname,
      users: [ username ]
    })
    console.log("Created room: ", createdRoom);
    // Todo: Verify room was created

    // update user's room
    const query = { username: username };
    User.findOne(query).then(doc => {
      doc.rooms =  [...doc.rooms, roomname];
      doc.save();
    })
    console.log(`Created room ${roomname} for ${username}.`);
    res.json("created");
  } catch (err) {
    console.log(`Failed to create room ${roomname}.`);
    // if (err) throw err;
    // res.status(500).json("Failed");
    res.json("failed");
  }
})

app.post("/joinRoom", async (req, res) => {
  const { roomname, username } = req.body;
  try {
    // update room userlist
    const query = { name: roomname };
    Room.findOne(query).then(room => {
      if (room) {
        room.users = [...room.users, username];
        room.save();

        User.findOne({ username: username }).then(user => {
          if (user) {
            user.rooms = [...user.rooms, roomname]
            user.save();
          }
        })
      }
    })
    console.log(`Joined room ${roomname} for ${username}.`);
    res.json("joined");
  } catch (err) {
    console.log(`Failed to join room ${roomname}.`);
    res.json("failed");
  }
})

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`);
});

// sockets - access all "connection" inside wss.clients
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
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

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      console.log("dead");
      // notify clients that somebody disconnected
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // read user info from cookie and add it to the connection
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

  connection.on("message", async (message) => {
    const msgData = JSON.parse(message.toString());
    const { sender, room, text } = msgData;
    if (sender && room && text) {
      // getting a message from mongodb which auto includes the message id as ._id
      console.log(sender, room, text);
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
    }
  });

  // [...wss.clients].forEach((client) => {
  //   client.send(
  //     JSON.stringify({
  //       online: [...wss.clients].map((c) => ({
  //         userId: c.userId,
  //         username: c.username,
  //       })),
  //     })
  //   );
  // });
});
