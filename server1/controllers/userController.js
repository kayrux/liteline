const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken.js");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const User = db.users;
const sequelize = db.sequelize;

const findUserRoomsByUserId = async (uid) => {
  return await sequelize.query(
    `SELECT id, name FROM chatrooms WHERE id IN ( SELECT UNNEST(rooms) FROM users WHERE uid = '${uid}' ) ORDER BY name ASC`,
    { type: QueryTypes.SELECT }
  );
};

/**
 * @desc register a new user
 * @route POST /api/users/register
 * @access public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: "Please fill in all fields." }); // 400 Bad Request
  }

  try {
    // check to see if username already exists in the user database
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).send({ message: "Username already taken." });
    }

    const user = await User.create({ username, password });

    if (user) {
      generateToken(res, user.uid, user.username);

      const rooms = await findUserRoomsByUserId(user.uid);

      return res.status(201).json({
        uid: user.uid,
        username: user.username,
        rooms: rooms,
      });
    } else {
      return res
        .status(400)
        .send({ message: "Could not create user - check User model." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not create user - query failure." });
  }
});

/**
 * @desc login/authenticate a user
 * @route POST /api/users/login
 * @access public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: "Please fill in all fields." }); // 400 Bad Request
  }

  try {
    const user = await User.findOne({ where: { username } }); // find by username

    if (user && (await user.verifyPassword(password))) {
      generateToken(res, user.uid, username);

      const rooms = await findUserRoomsByUserId(user.uid);

      return res.status(200).json({
        uid: user.uid,
        username: user.username,
        rooms: rooms,
      });
    } else {
      return res.status(401).send({ message: "Invalid username or password." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "Could not login - query failure." });
  }
});

/**
 * @desc logout user / clear cookie
 * @route POST /api/users/logout
 * @access public
 */
const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully." });
};

/**
 * @desc get user profile
 * @route GET /api/users/profile
 * @access private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.user.uid);

    if (user) {
      const rooms = await findUserRoomsByUserId(user.uid);

      return res.status(200).json({
        uid: user.uid,
        username: user.username,
        rooms: rooms,
      });
    } else {
      return res
        .status(404)
        .send({ message: "Could not update username - user not found." });
    }
  } catch (err) {
    return res
      .status(404)
      .send({ message: "Could not update username - query failure." });
  }
});

/**
 * @desc update user profile
 * @route PUT /api/users/profile
 * @access private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (req.body.username) {
      // check to see if username already exists in the user database
      const usernameExists = await User.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (usernameExists) {
        return res.status(400).send({ message: "Username already taken." });
      }
    }

    const user = await User.findByPk(req.user.uid);
    if (user) {
      // regenerate token with new username
      generateToken(res, user.uid, req.body.username);

      await user.update(
        { username: req.body.username },
        {
          where: {
            uid: req.body.uid,
          },
        }
      );

      const rooms = await findUserRoomsByUserId(user.uid);

      return res.status(200).json({
        uid: user.uid,
        username: user.username,
        rooms: rooms,
      });
    } else {
      return res.status(404).send({ message: "User not found." });
    }
  } catch (err) {
    return res.status(404).send({ message: "Failed to fetch user data." });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  findUserRoomsByUserId,
};
