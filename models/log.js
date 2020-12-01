const mongoose = require("mongoose");
const userSchema = require("./user").schema;

const Schema = mongoose.Schema;

const logSchema = new Schema({
  user: {
    type: userSchema,
    default: {},
  },
  description: String,
  duration: Number,
  date: Date,
});

module.exports = mongoose.model("LOG", logSchema);
