const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const awsUserSchema = new Schema({
  name: { type: String, required: [true, "Name is required."] },
  email: { type: String, required: [true, "Email is required."] },
  imageUrl: { type: String, required: [true, "Image URL is required."] },
});

module.exports = mongoose.model("Awsuser", awsUserSchema);
