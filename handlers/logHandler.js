const USER = require("../models/user");
const LOG = require("../models/user");
const moment = require("moment");

exports.addExercise = async (req, res) => {
  let { userId, description, duration, date } = req.body;

  date =
    date === "" || typeof date === "undefined" ? new Date() : new Date(date);

  try {
    let findOne = await USER.findOne({
      _id: userId,
    });

    // validate everything
    if (!findOne) {
      res.send(
        `Cast to ObjectId failed for value "${userId}" at path "_id" for model "Users"`
      );
    } else if (!description) {
      res.send("Path `description` is required.");
    } else if (!duration) {
      res.send("Path `duration` is required.");
    } else {
      // add extra shit to already existing user.
      const newExercise = new LOG({
        user: findOne,
        description: description,
        duration: Number(duration),
        date: date,
      });

      await newExercise.save();

      //fix this

      let ret = {
        _id: findOne._id,
        username: findOne.username,
        date: moment(date).format("ddd MMM DD Y"),
        duration: Number(duration),
        description: description,
      };

      res.send(ret);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("server error...");
  }
};
