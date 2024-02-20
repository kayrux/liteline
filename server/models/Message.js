const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: String,
    room: String,
    text: String,
  },
  { timestamps: true }
);

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;