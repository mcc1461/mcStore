"use strict";
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

module.exports = {
  // List categories (with details)
  list: async (req, res) => {
    try {
      const data = await Category.find({});
      const totalRecords = await Category.countDocuments({});
      const details = { totalRecords };

      console.log("Total Categories in DB:", totalRecords);
      console.log("Categories Retrieved:", data.length);

      res.status(200).send({
        error: false,
        details,
        data,
      });
    } catch (err) {
      console.error("Error fetching categories:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching categories",
      });
    }
  },

  // Create a new category
  create: async (req, res) => {
    try {
      const data = await Category.create(req.body);
      res.status(201).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error creating category:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error creating category",
      });
    }
  },

  // Read a single category by ID
  read: async (req, res) => {
    try {
      const data = await Category.findOne({ _id: req.params.id });
      if (!data) {
        return res.status(404).send({
          error: true,
          message: "Category not found",
        });
      }
      res.status(200).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error fetching category:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching category",
      });
    }
  },

  // Update a category
  update: async (req, res) => {
    try {
      const data = await Category.updateOne({ _id: req.params.id }, req.body, {
        runValidators: true,
      });
      if (!data.matchedCount) {
        return res.status(404).send({
          error: true,
          message: "Category not found for update",
        });
      }
      res.status(202).send({
        error: false,
        updated: data,
        new: await Category.findOne({ _id: req.params.id }),
      });
    } catch (err) {
      console.error("Error updating category:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error updating category",
      });
    }
  },

  // Delete a category
  delete: async (req, res) => {
    try {
      const data = await Category.deleteOne({ _id: req.params.id });
      if (!data.deletedCount) {
        return res.status(404).send({
          error: true,
          message: "Category not found for deletion",
        });
      }
      res.status(200).send({
        error: false,
        message: "Category successfully deleted",
        data,
      });
    } catch (err) {
      console.error("Error deleting category:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error deleting category",
      });
    }
  },

  // Get category summary using actual product data
  summary: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).send({
          error: true,
          message: "Category not found",
        });
      }

      // Aggregate product data for the given category
      const summaryAggregation = await Product.aggregate([
        { $match: { category: category._id } },
        {
          $group: {
            _id: null,
            productCount: { $sum: 1 },
            averagePrice: { $avg: "$price" },
            totalQuantity: { $sum: "$quantity" },
            highestPrice: { $max: "$price" },
            lowestPrice: { $min: "$price" },
          },
        },
      ]);

      const summaryData = summaryAggregation[0] || {
        productCount: 0,
        averagePrice: 0,
        totalQuantity: 0,
        highestPrice: 0,
        lowestPrice: 0,
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
