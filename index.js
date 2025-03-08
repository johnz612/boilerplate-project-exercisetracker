const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Exercise = require("./models/exercise");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Connection error:", err));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async function (req, res) {
  const { username } = req.body;

  // check if user already exist
  const findUser = await User.findOne({ username }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      return data;
    }
  });

  if (findUser) return res.json({ error: "User Already Exist" });

  let user = new User({ username });

  user.save(function (err, savedUser) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }

    return res.json({ username: savedUser.username, _id: savedUser._id });
  });
});

app.get("/api/users", async function (req, res) {
  let Users = await User.find();

  res.send(Users);
});

app.get("/api/users/:_id/logs", async function (req, res) {
  const { _id } = req.params;

  let { from, to, limit } = req.query;

  const { username } = await User.findById(_id);

  from = from ? new Date(from) : undefined;
  to = to ? new Date(to) : undefined;

  let result = Exercise.find({ userId: _id });

  if (from) {
    result = result.where("date").gte(from);
  }

  if (to) {
    result = result.where("date").lte(to);
  }

  if (limit) {
    result = result.limit(Number(limit));
  }

  const finalResult = await result.select("-_id -userId -__v").exec();

  const log = finalResult.map((res) => {
    return {
      description: res.description,
      duration: res.duration,
      date: res.date.toDateString(),
    };
  });

  res.json({
    username,
    count: log.length,
    _id,
    log,
  });
});

app.post("/api/users/:_id/exercises", async function (req, res) {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const dateToUse = date ? new Date(date) : new Date();

  const result = await User.findById(_id, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      return data;
    }
  });

  if (!result) return res.json({ error: "ID does not exist" });

  const { username } = result;

  let exercise = new Exercise({
    description,
    duration,
    date: dateToUse,
    userId: _id,
  });

  exercise.save(function (err, savedExercise) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }

    return res.json({
      username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
      _id,
    });
  });
});

// Delete Request
app.delete("/api/users/exercise/deleteAll", async function (req, res) {
  try {
    const result = await Exercise.deleteMany();
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/users/deleteAll", async function (req, res) {
  try {
    const result = await User.deleteMany();
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
