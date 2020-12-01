require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userHandler = require("./handlers/userHandler");
const logHandler = require("./handlers/logHandler");
const exerciseHandler = require("./handlers/exerciseHandler");

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

//Routes
app.post("/api/exercise/new-user", userHandler.addUser);
app.post("/api/exercise/add", logHandler.addExercise);
app.get("/api/exercise/users", userHandler.findUsers);
app.get("/api/exercise/log", exerciseHandler.exercises);

// Not found middleware
app.use((req, res, next) => {
  return next({
    status: 404,
    message: "not found",
  });
});
