// server/src/models/orderModel.js
"use strict";
const { mongoose } = require("../configs/dbConnection");

const OrderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyer: { type: String, required: true }, // Or use an object with a name field if needed
    seller: { type: String, required: true }, // Or use an object with a name field if needed
    quantity: { type: Number, required: true },
  },
  { collection: "orders", timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
