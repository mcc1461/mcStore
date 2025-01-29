"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const Brand = require("../models/brandModel");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "List Brands"
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
      // Fetch brand data with pagination and filters (assuming res.getModelList is a custom helper)
      const data = await res.getModelList(Brand);

      // Get total records + pagination info (assuming these are custom helpers)
      const totalRecords = await Brand.countDocuments({});
      const details = await res.getModelListDetails(Brand);

      // Debug logs
      console.log("Total Brands in DB:", totalRecords);
      console.log("Brands Retrieved:", data.length);
      console.log("Pagination Details:", details);

      res.status(200).send({
        error: false,
        details,
        data,
      });
    } catch (err) {
      console.error("Error fetching brands:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching brands",
      });
    }
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Create Brand"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Brand 1",
                    "description": "my brand description",
                    "image": "http://imageURL"
                }
            }
    */
    try {
      const data = await Brand.create(req.body);
      res.status(201).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error creating brand:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error creating brand",
      });
    }
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Get Single Brand"
    */
    try {
      const data = await Brand.findOne({ _id: req.params.id });
      if (!data) {
        return res.status(404).send({
          error: true,
          message: "Brand not found",
        });
      }
      res.status(200).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error fetching brand:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching brand",
      });
    }
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Update a Brand"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Updated Brand 1",
                    "description": "updated description"
                }
            }
    */
    try {
      // Return the updated document with { new: true }
      const updatedBrand = await Brand.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedBrand) {
        return res.status(404).send({
          error: true,
          message: "Brand not found for update",
        });
      }

      res.status(202).send({
        error: false,
        updated: updatedBrand,
      });
    } catch (err) {
      console.error("Error updating brand:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error updating brand",
      });
    }
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Delete Brand"
    */
    try {
      const data = await Brand.deleteOne({ _id: req.params.id });

      if (!data.deletedCount) {
        return res.status(404).send({
          error: true,
          message: "Brand not found for deletion",
        });
      }

      res.status(200).send({
        error: false,
        message: "Brand successfully deleted",
        data,
      });
    } catch (err) {
      console.error("Error deleting brand:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error deleting brand",
      });
    }
  },
};
