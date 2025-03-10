"use strict";
const { mongoose } = require("../configs/dbConnection");

/* 
   Purchase Model:
   - quantity
   - purchasePrice
   - brandId, productId, firmId, buyerId, userId, etc.
*/

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    // amount = purchasePrice * quantity
    amount: {
      type: Number,
      default: function () {
        return this.purchasePrice * this.quantity;
      },
      transform: function () {
        return this.purchasePrice * this.quantity;
      },
    },
  },
  { collection: "purchases", timestamps: true }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);
