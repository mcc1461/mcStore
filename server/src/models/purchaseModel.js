"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");

/* 
  Example of request body for creating a Purchase:
  {
    "firmId": "65343222b67e9681f937f304",
    "brandId": "65343222b67e9681f937f123",
    "productId": "65343222b67e9681f937f422",
    "quantity": 1000,
    "purchasePrice": 20
  }
*/

/* ------------------------------------------------------- *
   Purchase Model:
   - price -> renamed to purchasePrice
   - amount automatically = purchasePrice * quantity
*/
const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
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

    // This is how many units are purchased
    quantity: {
      type: Number,
      default: 0,
    },

    // The actual price paid per unit in this Purchase
    purchasePrice: {
      type: Number,
      default: 0,
    },

    // amount = purchasePrice * quantity
    amount: {
      type: Number,
      default: function () {
        return this.purchasePrice * this.quantity;
      }, // for CREATE
      transform: function () {
        return this.purchasePrice * this.quantity;
      }, // for UPDATE
      // If you want to recalc on the fly, you can also do a getter
    },
  },
  { collection: "purchases", timestamps: true }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);
