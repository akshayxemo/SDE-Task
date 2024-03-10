const mongoose = require("mongoose");
const dbConnect = () => {
  try {
    if (process.env.DB_URI == null) {
      console.log("No URI specified...");
      return;
    }
    mongoose.connect(process.env.DB_URI);
    const connection = mongoose.connection;
    connection.once("open", () => {
      console.log("MongoDB database connection established successfully");
    });
  } catch (error) {
    console.log("MongoDB connection Failed...", error);
  }
};
module.exports = dbConnect;
