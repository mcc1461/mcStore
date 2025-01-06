"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// Product Controller:

const Product = require("../models/productModel");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "List Products"
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
      // Fetch product data with pagination and population
      const data = await res.getModelList(Product, {}, [
        "categoryId",
        "brandId",
      ]);

      // Fetch details like total records, pagination info
      const totalRecords = await Product.countDocuments({});
      const details = await res.getModelListDetails(Product);

      // Debug logs for validation
      console.log("Total Products in DB:", totalRecords);
      console.log("Products Retrieved:", data.length);
      console.log("Pagination Details:", details);

      res.status(200).send({
        error: false,
        details,
        data,
      });
    } catch (err) {
      console.error("Error fetching products:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching products",
      });
    }
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Create Product"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "categoryId": "65343222b67e9681f937f203",
                    "brandId": "65343222b67e9681f937f107",
                    "name": "Product 1"
                }
            }
        */
    try {
      const data = await Product.create(req.body);
      res.status(201).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error creating product:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error creating product",
      });
    }
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Get Single Product"
        */
    try {
      const data = await Product.findOne({ _id: req.params.id }).populate([
        "categoryId",
        "brandId",
      ]);
      if (!data) {
        return res.status(404).send({
          error: true,
          message: "Product not found",
        });
      }
      res.status(200).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error fetching product:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching product",
      });
    }
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Update Product"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "categoryId": "65343222b67e9681f937f203",
                    "brandId": "65343222b67e9681f937f107",
                    "name": "Product 1"
                }
            }
        */
    try {
      const data = await Product.updateOne({ _id: req.params.id }, req.body, {
        runValidators: true,
      });

      if (!data.matchedCount) {
        return res.status(404).send({
          error: true,
          message: "Product not found for update",
        });
      }

      res.status(202).send({
        error: false,
        updated: data,
        new: await Product.findOne({ _id: req.params.id }),
      });
    } catch (err) {
      console.error("Error updating product:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error updating product",
      });
    }
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Delete Product"
        */
    try {
      const data = await Product.deleteOne({ _id: req.params.id });

      if (!data.deletedCount) {
        return res.status(404).send({
          error: true,
          message: "Product not found for deletion",
        });
      }

      res.status(200).send({
        error: false,
        message: "Product successfully deleted",
        data,
      });
    } catch (err) {
      console.error("Error deleting product:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error deleting product",
      });
    }
  },
};
