const mongoose = require("mongoose");
const USER = require("../models/user");

exports.addUser = async (req, res) => {
  //get details
  console.log(req.body.username);
  const newUser = req.body.username;

  //check if username already exists, if does return message,
  //if it doesnt add it to the database
  try {
    let findOne = await USER.findOne({
      username: newUser,
    });

    if (findOne) {
      res.json({
        status: "Username already taken",
      });
    } else {
      findOne = new USER({
        username: newUser,
      });
    }

    await findOne.save();
    res.json({
      username: findOne.username,
      _id: findOne._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("server error...");
  }
};

exports.findUsers = async (req, res) => {
  await USER.find({}, "username _id", (err, user) => {
    res.json(user);
  });
};
