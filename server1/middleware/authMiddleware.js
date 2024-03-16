const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const db = require("../models");
const User = db.users;

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findByPk(decoded.userId);

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Access not authorized - Invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Access not authorized - No token");
  }
});

module.exports = { protect };
