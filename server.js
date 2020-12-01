require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const moment = require("moment");
let { nanoid } = require("nanoid");

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

//connect do mongodb

const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((results) => app.listen(3000))
  .catch((err) => console.log(err));

const connection = mongoose.connection;

connection.on("error", console.error.bind(console, "connection error:"));
connection.once("open", () => {
  console.log("Connected to mongodb");
});

//create schema

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  _id: {
    type: String,
    default: () => nanoid(),
  },
});

const logSchema = new Schema({
  user: {
    type: userSchema,
    default: {},
  },
  description: String,
  duration: Number,
  date: Date,
});

const USER = mongoose.model("user", userSchema);
const LOG = mongoose.model("log", logSchema);

//request routes

//post route for new user
app.post("/api/exercise/new-user", async (req, res) => {
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
});

//post route for new exercises
app.post("/api/exercise/add", async (req, res) => {
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
});

//GET REQUESTS

//get list of all the users
app.get("/api/exercise/users", async (req, res) => {
  await USER.find({}, "username _id", (err, user) => {
    res.json(user);
  });
});

/*
You can make a GET request to /api/exercise/log with a parameter of userId=_id to retrieve a 
full exercise log of any user. The returned response will be the user object with a log array of 
all the exercises added. Each log item has the description, duration, and date properties.

A request to a user's log (/api/exercise/log) returns an object with a count property representing 
the number of exercises returned.

You can add from, to and limit parameters to a /api/exercise/log request to retrieve part of the log
 of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
*/

app.get("/api/exercise/log", async (req, res, next) => {
  let { userId, from, to, limit, order } = req.query;

  //converting
  from = new Date(from) == "Invalid Date" ? 0 : new Date(from);
  to = new Date(to) == "Invalid Date" ? "2025-01-01" : new Date(to);

  limit = isNaN(parseInt(limit)) ? 0 : parseInt(limit);
  order = order == "asc" ? "" : "-";

  console.log({ userId, from, to, limit, order });

  try {
    let findOne = await USER.findOne({
      _id: userId,
    });

    // validate everything
    if (!findOne) {
      res.send(`USER NOT FOUND`);
      return next(err);
    }

    if (findOne) {
      LOG.find({ user: findOne })
        .select("description duration date -_id")
        .where("date")
        .gte(from)
        .lte(to)
        .sort(order + "date")
        .limit(limit)
        .exec(function (err, result) {
          if (err) {
            //handle error here
            console.error(err);
          } else {
            console.log(result);
            let log = result.map((el) => ({
              description: el.description,
              duration: el.duration,
              date: moment(el.date).format("ddd MMM DD Y"),
            }));

            let ret = {
              _id: findOne._id,
              username: findOne.username,
              count: log.length,
              log: log,
            };

            res.json(ret);
          }
        });
    } else {
      next({ message: "No Exercises found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("server error...");
  }
});
