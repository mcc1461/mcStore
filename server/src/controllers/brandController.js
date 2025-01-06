"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// Brand Controller:

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
      // Fetch brand data with pagination and filters
      const data = await res.getModelList(Brand);

      // Fetch details like total records, pagination info
      const totalRecords = await Brand.countDocuments({});
      const details = await res.getModelListDetails(Brand);

      // Debug logs for validation
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
            #swagger.summary = "Update Brand"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Brand 1",
                    "image": "http://imageURL"
                }
            }
        */
    try {
      const data = await Brand.updateOne({ _id: req.params.id }, req.body, {
        runValidators: true,
      });

      if (!data.matchedCount) {
        return res.status(404).send({
          error: true,
          message: "Brand not found for update",
        });
      }

      res.status(202).send({
        error: false,
        updated: data,
        new: await Brand.findOne({ _id: req.params.id }),
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
