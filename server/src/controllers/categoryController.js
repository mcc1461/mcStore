"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// Category Controller:

const Category = require("../models/categoryModel");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "List Categories"
            #swagger.description = `
                Use <u>filter[], search[], sort[], page, and limit</u> queries with this endpoint.
                Examples:
                - /?filter[field1]=value1&filter[field2]=value2
                - /?search[field1]=value1&search[field2]=value2
                - /?sort[field1]=asc&sort[field2]=desc
                - /?limit=10&page=1
            `
        */
    try {
      // Fetch category data with pagination and filters
      const data = await res.getModelList(Category);

      // Fetch details like total records, pagination info
      const totalRecords = await Category.countDocuments({});
      const details = await res.getModelListDetails(Category);

      // Debug logs for validation
      console.log("Total Categories in DB:", totalRecords);
      console.log("Categories Retrieved:", data.length);
      console.log("Pagination Details:", details);

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

  create: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Create Category"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Category Name"
                }
            }
        */
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

  read: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Get Single Category"
        */
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

  update: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Update Category"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Updated Category Name"
                }
            }
        */
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

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Delete Category"
        */
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
};
