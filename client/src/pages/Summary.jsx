"use strict";
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

module.exports = {
  // Get category summary with actual data from Product and Order collections
  summary: async (req, res) => {
    try {
      const categoryId = req.params.id;
      // Verify the category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).send({
          error: true,
          message: "Category not found",
        });
      }

      // Count products in this category
      const productCount = await Product.countDocuments({
        category: category._id,
      });
      console.log("Product Count:", productCount);

      // Most Purchased: product with highest purchaseCount
      const mostPurchasedProduct = await Product.find({
        category: category._id,
      })
        .sort({ purchaseCount: -1 })
        .limit(1);
      console.log("Most Purchased Product:", mostPurchasedProduct);

      // Most Sold: product with highest soldCount
      const mostSoldProduct = await Product.find({ category: category._id })
        .sort({ soldCount: -1 })
        .limit(1);
      console.log("Most Sold Product:", mostSoldProduct);

      // Aggregate orders to determine top buyers for products in this category
      const topBuyers = await Order.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $match: {
            "productInfo.category": category._id, // ensure type match; category._id is an ObjectId
          },
        },
        {
          $group: {
            _id: "$buyer",
            totalPurchased: { $sum: "$quantity" },
          },
        },
        { $sort: { totalPurchased: -1 } },
        { $limit: 3 },
      ]);
      console.log("Top Buyers:", topBuyers);

      // Aggregate orders to determine top sellers for products in this category
      const topSellers = await Order.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $match: {
            "productInfo.category": category._id,
          },
        },
        {
          $group: {
            _id: "$seller",
            totalSold: { $sum: "$quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 3 },
      ]);
      console.log("Top Sellers:", topSellers);

      const summaryData = {
        productCount,
        mostPurchased: mostPurchasedProduct[0]
          ? {
              name: mostPurchasedProduct[0].name,
              count: mostPurchasedProduct[0].purchaseCount,
            }
          : null,
        mostSold: mostSoldProduct[0]
          ? {
              name: mostSoldProduct[0].name,
              count: mostSoldProduct[0].soldCount,
            }
          : null,
        topBuyers,
        topSellers,
      };

      res.status(200).send({
        error: false,
        data: summaryData,
      });
    } catch (err) {
      console.error("Error getting category summary:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Server error",
      });
    }
  },
};
