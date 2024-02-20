const mongoose = require("mongoose");

// 1. define schema
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    rooms: [ String ],
  },
  { timestamps: true }
);
// 2. define model
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
