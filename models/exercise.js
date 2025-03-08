let mongoose = require("mongoose");

const Schema = mongoose.Schema;

let exerciseSchema = new Schema({
  username: { type: String },
  description: { type: String },
  duration: { type: Number },
  date: { type: Date },
  userId: { type: String },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
