const mongoose = require("mongoose");

// 1. define schema
const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    users: [ String ],
  },
  { timestamps: true }
);

// 2. define model
const RoomModel = mongoose.model("Room", RoomSchema);
module.exports = RoomModel;
