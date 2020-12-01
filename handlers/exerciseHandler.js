const USER = require("../models/user");
const LOG = require("../models/log");
const moment = require("moment");

exports.exercises = async (req, res) => {
  let { userId, from, to, limit, order } = req.query;
  from = new Date(from) == "Invalid Date" ? 0 : new Date(from);
  to = new Date(to) == "Invalid Date" ? "2025-01-01" : new Date(to);
  limit = isNaN(parseInt(limit)) ? 0 : parseInt(limit);
  order = order == "asc" ? "" : "-";

  try {
    USER.findOne({ _id: userId }, async (err, foundUser) => {
      if (err) {
        console.error(err);
      }
      LOG.find({ user: foundUser })
        .select("description duration date -_id")
        .where("date")
        .gte(from)
        .lte(to)
        .sort(order + "date")
        .limit(limit)
        .lean()
        .exec(function (err, result) {
          if (err) {
            console.error(err);
          }

          if (result) {
            let log = result.map((el) => ({
              description: el.description,
              duration: el.duration,
              date: moment(el.date).format("ddd MMM DD Y"),
            }));

            let ret = {
              _id: foundUser._id,
              username: foundUser.username,
              count: log.length,
              log: log,
            };

            res.json(ret);
          }
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("server error...");
  }
};
