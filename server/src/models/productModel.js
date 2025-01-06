"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | PRODUCT MODEL
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");

// Product Schema
const ProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0, // Selling price
    },
    total_purchased: {
      type: Number,
      default: 0, // Total quantity purchased
    },
    total_sold: {
      type: Number,
      default: 0, // Total quantity sold
    },
    purchasing_price: {
      type: Number,
      default: 0, // Average purchasing price
    },
    image: {
      type: String,
      default: "no-image.jpg",
    },
    purchases: [
      {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Firm", // Vendor is a firm
          required: true,
        },
        price: {
          type: Number,
          required: true, // Price at which it was purchased
        },
        quantity: {
          type: Number,
          required: true, // Quantity purchased
        },
        date: {
          type: Date,
          default: Date.now, // Date of purchase
        },
      },
    ],
  },
  { collection: "products", timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
