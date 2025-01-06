"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// Firm Controller:

const Firm = require("../models/firmModel");
const formatPhoneNumber = require("../utils/formatPhoneNumber");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "List Firms"
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
      // Fetch firm data with pagination and filters
      const data = await res.getModelList(Firm);

      // Fetch details like total records, pagination info
      const totalRecords = await Firm.countDocuments({});
      const details = await res.getModelListDetails(Firm);

      // Debug logs for validation
      console.log("Total Firms in DB:", totalRecords);
      console.log("Firms Retrieved:", data.length);
      console.log("Pagination Details:", details);

      res.status(200).send({
        error: false,
        details,
        data,
      });
    } catch (err) {
      console.error("Error fetching firms:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching firms",
      });
    }
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Create Firm"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Firm Name",
                    "phone": "123-456-7890",
                    "address": "123 Main St"
                }
            }
        */
    try {
      if (req.body.phone) {
        req.body.formattedPhone = formatPhoneNumber(req.body.phone); // Add formattedPhone field
      }

      const data = await Firm.create(req.body);

      res.status(201).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error creating firm:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error creating firm",
      });
    }
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Get Single Firm"
        */
    try {
      const data = await Firm.findOne({ _id: req.params.id });
      if (!data) {
        return res.status(404).send({
          error: true,
          message: "Firm not found",
        });
      }

      if (data.phone) {
        data.formattedPhone = formatPhoneNumber(data.phone); // Format the phone number for the response
      }

      res.status(200).send({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error fetching firm:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error fetching firm",
      });
    }
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Update Firm"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "name": "Updated Firm Name",
                    "phone": "987-654-3210",
                    "address": "456 Another St"
                }
            }
        */
    try {
      if (req.body.phone) {
        req.body.formattedPhone = formatPhoneNumber(req.body.phone); // Add formattedPhone field
      }

      const data = await Firm.updateOne({ _id: req.params.id }, req.body, {
        runValidators: true,
      });

      if (!data.matchedCount) {
        return res.status(404).send({
          error: true,
          message: "Firm not found for update",
        });
      }

      res.status(202).send({
        error: false,
        updated: data,
        new: await Firm.findOne({ _id: req.params.id }),
      });
    } catch (err) {
      console.error("Error updating firm:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error updating firm",
      });
    }
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Delete Firm"
        */
    try {
      const data = await Firm.deleteOne({ _id: req.params.id });

      if (!data.deletedCount) {
        return res.status(404).send({
          error: true,
          message: "Firm not found for deletion",
        });
      }

      res.status(200).send({
        error: false,
        message: "Firm successfully deleted",
        data,
      });
    } catch (err) {
      console.error("Error deleting firm:", err.message, err.stack);
      res.status(500).send({
        error: true,
        message: "Error deleting firm",
      });
    }
  },
};
