"use strict";
const { mongoose } = require("../configs/dbConnection");

/**
 * Sell Model:
 * - userId: who created the record
 * - sellerId: the staff/admin performing the sell
 * - brandId, productId
 * - quantity, sellPrice
 * - amount = sellPrice * quantity
 */
const SellSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    sellPrice: {
      type: Number,
      default: 0,
    },
    // amount = sellPrice * quantity
    amount: {
      type: Number,
      default: function () {
        return this.sellPrice * this.quantity;
      },
      transform: function () {
        return this.sellPrice * this.quantity;
      },
    },
  },
  { collection: "sells", timestamps: true }
);

module.exports = mongoose.model("Sell", SellSchema);
