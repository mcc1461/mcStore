"use strict";
const { mongoose } = require("../configs/dbConnection");

const ProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: false,
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
      default: 0,
    },
    total_purchased: {
      type: Number,
      default: 0,
    },
    total_sold: {
      type: Number,
      default: 0,
    },
    purchasing_price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "no-image.jpg",
    },
    // Original quantity field for stock
    quantity: {
      type: Number,
      default: 0,
    },
    // New field for testing numeric updates
    numbers: {
      type: Number,
      default: 0,
    },
    purchases: [
      {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Firm",
          required: false,
        },
        price: {
          type: Number,
          required: false,
        },
        quantity: {
          type: Number,
          required: false,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { collection: "products", timestamps: true }
);

// Remove or comment out any pre-save hooks that might override "quantity" or "numbers" if present.
// For debugging purposes, you can include a simple logging hook:
ProductSchema.pre("save", function (next) {
  console.log("Saving product:", {
    quantity: this.quantity,
    numbers: this.numbers,
  });
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
