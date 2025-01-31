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

    /**
     * If this is your "average market price" or "target selling price",
     * keep it labeled as 'price'.
     * (Alternatively rename it to 'marketPrice' or 'sellingPrice' for clarity.)
     */
    price: {
      type: Number,
      default: 0,
    },

    /**
     * total_purchased / total_sold
     * You can keep track of how many total units have been purchased or sold historically.
     * If you use the separate "Purchase" model, you might not need these
     * unless you want quick references on the product doc.
     */
    total_purchased: {
      type: Number,
      default: 0,
    },
    total_sold: {
      type: Number,
      default: 0,
    },

    /**
     * purchasing_price:
     * If this is supposed to be the "average" cost of purchasing this product so far,
     * you might either remove it (if you compute on the fly from the Purchase docs),
     * or keep it as a "snapshot" that updates each time a new purchase is made.
     */
    purchasing_price: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "no-image.jpg",
    },

    /**
     * quantity = total stock on hand for this product.
     * This is incremented/decremented in your "Purchase" controller
     * whenever you create/update/delete a Purchase.
     */
    quantity: {
      type: Number,
      default: 0,
    },

    /**
     * numbers: additional numeric field for testing or other logic
     */
    numbers: {
      type: Number,
      default: 0,
    },

    /**
     * purchases[]: If you already have a separate 'Purchase' model,
     * storing a parallel array here can cause duplication.
     * If you intend to keep an "embedded log" of purchases,
     * consider carefully how you will keep them in sync with
     * the main 'Purchase' documents.
     */
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

/**
 * Simple logging pre-save hook for debugging
 */
ProductSchema.pre("save", function (next) {
  console.log("Saving product:", {
    name: this.name,
    quantity: this.quantity,
    numbers: this.numbers,
  });
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
