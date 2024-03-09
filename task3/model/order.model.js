const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
