let mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: { type: String },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
