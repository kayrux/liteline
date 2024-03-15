const jwt = require("jsonwebtoken");

const generateToken = (res, userId, username) => {
  const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    secure: true, // Always set secure to true for cross-site cookies
    sameSite: "none", // Allow cross-site cookies
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  });
};

module.exports = generateToken;