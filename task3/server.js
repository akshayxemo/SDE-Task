const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json()); // for handling incoming http request with content-type : application/json

const PORT = process.env.PORT || 5000;
const dbConnect = require("./lib/db");
const User = require("./model/user.model");
const Order = require("./model/order.model");

app.post("/user", async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await User.find({ name: name, email: email });
    if (existingUser.length === 0) {
      const newUser = new User({ name: name, email: email });
      await newUser.save();
      res.status(200).json({ messsage: "User successfully added." });
    } else {
      res.status(400).json({ messsage: "User already existed." });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ messsage: "User failed to add.", error: err });
  }
});

app.post("/order", async (req, res) => {
  try {
    const { amount, userID } = req.body;
    const newOrder = new Order({ amount: amount, user: userID });
    await newOrder.save();
    res.status(200).json({ messsage: "Order confirmed." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ messsage: "Failed to add Order.", error: err });
  }
});

app.get("/last-order", async (req, res) => {
  try {
    const lastOrderOfAllUser = await Order.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$user",
          lastOrder: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: "$lastOrder._id",
          amount: "$lastOrder.amount",
          name: "$userInfo.name",
          email: "$userInfo.email",
          createdAt: "$lastOrder.createdAt",
        },
      },
    ]);
    console.log(lastOrderOfAllUser);
    res.status(200).json({ messsage: "Success", data: lastOrderOfAllUser });
  } catch (err) {
    res.status(400).json({ messsage: "User failed to add.", error: err });
  }
});

app.listen(PORT, () => {
  dbConnect();
  console.log("App is listening to port: ", PORT);
});
