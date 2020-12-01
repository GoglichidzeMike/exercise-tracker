const mongoose = require("mongoose");
let { nanoid } = require("nanoid");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  _id: {
    type: String,
    default: () => nanoid(),
  },
});

module.exports = mongoose.model("USER", userSchema);
