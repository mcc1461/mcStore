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
    // New fields for temporary ("tester") data
    tester: {
      type: Boolean,
      default: false,
    },
    testerCreatedAt: {
      type: Date,
      default: null,
    },
  },
  { collection: "purchases", timestamps: true }
);

// TTL index: Automatically delete tester documents 600 seconds (10 minutes)
// after their testerCreatedAt timestamp.
PurchaseSchema.index({ testerCreatedAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("Purchase", PurchaseSchema);
