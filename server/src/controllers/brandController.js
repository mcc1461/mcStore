"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const Brand = require("../models/brandModel");

module.exports = {
  list: async (req, res) => {
    try {
      const data = await res.getModelList(Brand);
      const totalRecords = await Brand.countDocuments({});
      const details = await res.getModelListDetails(Brand);

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
    try {
      console.log("Create route req.body:", req.body);
      const data = await Brand.create(req.body);
      res.status(201).send({
        error: false,
        // If you want to match your front-end "data.new" logic, you can do:
        // new: data
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
    try {
      console.log("Update route req.body:", req.body);
      console.log("Update payload received", {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
      });

      const updateData = {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
      };

      const updatedBrand = await Brand.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      console.log("Updated brand doc:", updatedBrand);

      if (!updatedBrand) {
        return res.status(404).send({
          error: true,
          message: "Brand not found for update",
        });
      }

      res.status(202).send({
        error: false,
        updated: updatedBrand, // matches the front-end "data.updated"
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
