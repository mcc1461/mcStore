"use strict";
const { mongoose } = require("../configs/dbConnection");

const ProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      // The "market price"
      type: Number,
      default: 0,
    },
    quantity: {
      // Current total stock
      type: Number,
      default: 0,
    },
    // Additional fields, e.g. images, description, etc.
    image: {
      type: String,
      default: "no-image.jpg",
    },
    image2: String,

    // Optional fields for your logic
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
    numbers: {
      type: Number,
      default: 0,
    },

    /**
     * CRITICAL: This is the array used when a purchase is created/updated:
     * product.purchases.push({ vendor, price, quantity, date })
     */
    purchases: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
        price: Number,
        quantity: Number,
        date: { type: Date, default: Date.now },
      },
    ],

    /**
     * NEW: Add a similar array called 'sells' for sells
     * (instead of 'sales') to mirror your 'purchases'.
     */
    sells: [
      {
        // If you like, you could also store a "sellerId" or brand reference here.
        price: Number,
        quantity: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: "products", timestamps: true }
);

/**
 * Debug logging whenever a product doc is saved (optional).
 */
ProductSchema.pre("save", function (next) {
  console.log("Saving product:", {
    name: this.name,
    quantity: this.quantity,
  });
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
