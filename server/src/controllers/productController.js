"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | Product Controller
------------------------------------------------------- */

const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");

/**
 * resolveIdOrName:
 *   - If the provided value is a valid MongoDB ObjectId string, try to find the matching document.
 *   - Otherwise, treat the value as a name and search for the matching document.
 *   - Returns the document's _id (as a string) if found; otherwise, returns undefined.
 */
async function resolveIdOrName(value, type) {
  if (!value) return undefined;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
  if (isValidObjectId) {
    let doc;
    if (type === "brand") {
      doc = await Brand.findOne({ _id: value });
    } else {
      doc = await Category.findOne({ _id: value });
    }
    return doc ? doc._id.toString() : undefined;
  }

  // If not a valid ObjectId, treat the value as a name.
  let doc;
  if (type === "brand") {
    doc = await Brand.findOne({ name: value });
  } else {
    doc = await Category.findOne({ name: value });
  }
  return doc ? doc._id.toString() : undefined;
}

/**
 * transformNumericFields:
 *   For each provided field name, convert its value in reqBody to a number.
 */
function transformNumericFields(reqBody, fields = []) {
  fields.forEach((field) => {
    if (reqBody[field] !== undefined && reqBody[field] !== null) {
      console.log(`Original ${field} value:`, reqBody[field]);
      const num = Number(reqBody[field]);
      reqBody[field] = isNaN(num) ? 0 : num;
      console.log(`Transformed ${field} value:`, reqBody[field]);
    }
  });
}

module.exports = {
  // LIST PRODUCTS
  list: async (req, res) => {
    try {
      const data = await res.getModelList(Product, {}, [
        "categoryId",
        "brandId",
      ]);
      const totalRecords = await Product.countDocuments({});
      const details = await res.getModelListDetails(Product);

      console.log("Total products in DB:", totalRecords);
      console.log("Products retrieved:", data.length);
      console.log("Pagination details:", details);

      return res.status(200).json({
        error: false,
        details,
        data,
      });
    } catch (err) {
      console.error("Error fetching products:", err.message, err.stack);
      return res.status(500).json({
        error: true,
        message: "Error fetching products",
      });
    }
  },

  // CREATE PRODUCT
  create: async (req, res) => {
    try {
      let { brandId, categoryId } = req.body;

      // Convert numeric fields "quantity" and "numbers"
      transformNumericFields(req.body, ["quantity", "numbers"]);

      // Enforce that brands and categories must be predefined.
      // Process brandId:
      if (brandId) {
        // If brandId is a valid ObjectId, try to resolve it.
        const isValidBrandId = /^[a-fA-F0-9]{24}$/.test(brandId);
        if (isValidBrandId) {
          const resolvedBrandId = await resolveIdOrName(brandId, "brand");
          if (!resolvedBrandId) {
            console.warn(`No brand found with name or ID '${brandId}'`);
            return res.status(400).json({
              error: true,
              message: `No brand found with name or ID '${brandId}'. Please define this brand first.`,
            });
          }
          req.body.brandId = resolvedBrandId;
        } else {
          // Not a valid ObjectId – look up by name.
          const doc = await Brand.findOne({ name: brandId });
          if (!doc) {
            console.warn(`Brand "${brandId}" is not defined.`);
            return res.status(400).json({
              error: true,
              message: `Brand "${brandId}" is not defined. Please define this brand first.`,
            });
          }
          // Store as text (or optionally, you could choose to store the ObjectId)
          req.body.brandId = doc.name;
        }
      } else {
        return res.status(400).json({
          error: true,
          message: "Brand is required. Please define the brand first.",
        });
      }

      // Process categoryId:
      if (categoryId) {
        const isValidCategoryId = /^[a-fA-F0-9]{24}$/.test(categoryId);
        if (isValidCategoryId) {
          const resolvedCategoryId = await resolveIdOrName(
            categoryId,
            "category"
          );
          if (!resolvedCategoryId) {
            console.warn(`No category found with name or ID '${categoryId}'`);
            return res.status(400).json({
              error: true,
              message: `No category found with name or ID '${categoryId}'. Please define this category first.`,
            });
          }
          req.body.categoryId = resolvedCategoryId;
        } else {
          const doc = await Category.findOne({ name: categoryId });
          if (!doc) {
            console.warn(`Category "${categoryId}" is not defined.`);
            return res.status(400).json({
              error: true,
              message: `Category "${categoryId}" is not defined. Please define this category first.`,
            });
          }
          req.body.categoryId = doc.name;
        }
      } else {
        return res.status(400).json({
          error: true,
          message: "Category is required. Please define the category first.",
        });
      }

      console.log("Creating product with data:", req.body);
      const createdProduct = await Product.create(req.body);

      // Re-fetch the newly created product and populate categoryId and brandId (to return names)
      const productPopulated = await Product.findOne({
        _id: createdProduct._id,
      })
        .populate("categoryId", "name")
        .populate("brandId", "name");
      console.log(
        "Product created successfully (populated):",
        productPopulated
      );

      return res.status(201).json({
        error: false,
        data: productPopulated,
      });
    } catch (err) {
      console.error("Error creating product:", err.message, err.stack);
      return res.status(500).json({
        error: true,
        message: "Error creating product",
      });
    }
  },

  // READ PRODUCT
  read: async (req, res) => {
    try {
      const data = await Product.findOne({ _id: req.params.id }).populate([
        "categoryId",
        "brandId",
      ]);

      if (!data) {
        console.warn(`Product not found with ID '${req.params.id}'`);
        return res.status(404).json({
          error: true,
          message: "Product not found",
        });
      }
      console.log("Fetched product:", data);
      return res.status(200).json({
        error: false,
        data,
      });
    } catch (err) {
      console.error("Error fetching product:", err.message, err.stack);
      return res.status(500).json({
        error: true,
        message: "Error fetching product",
      });
    }
  },

  // UPDATE PRODUCT
  update: async (req, res) => {
    try {
      let { brandId, categoryId } = req.body;
      console.log("Incoming req.body in update:", req.body);

      // Convert numeric fields "quantity" and "numbers"
      transformNumericFields(req.body, ["quantity", "numbers"]);

      // Process brandId:
      if (brandId) {
        const isValidBrandId = /^[a-fA-F0-9]{24}$/.test(brandId);
        if (isValidBrandId) {
          const resolvedBrandId = await resolveIdOrName(brandId, "brand");
          if (resolvedBrandId) {
            req.body.brandId = resolvedBrandId;
          } else {
            console.warn(`No brand found with name or ID '${brandId}'`);
            return res.status(400).json({
              error: true,
              message: `No brand found with name or ID '${brandId}'. Please define this brand first.`,
            });
          }
        } else {
          const doc = await Brand.findOne({ name: brandId });
          if (!doc) {
            console.warn(`Brand "${brandId}" is not defined.`);
            return res.status(400).json({
              error: true,
              message: `Brand "${brandId}" is not defined. Please define this brand first.`,
            });
          }
          req.body.brandId = doc.name;
        }
      } else {
        return res.status(400).json({
          error: true,
          message: "Brand is required. Please define the brand first.",
        });
      }

      // Process categoryId:
      if (categoryId) {
        const isValidCategoryId = /^[a-fA-F0-9]{24}$/.test(categoryId);
        if (isValidCategoryId) {
          const resolvedCategoryId = await resolveIdOrName(
            categoryId,
            "category"
          );
          if (resolvedCategoryId) {
            req.body.categoryId = resolvedCategoryId;
          } else {
            console.warn(`No category found with name or ID '${categoryId}'`);
            return res.status(400).json({
              error: true,
              message: `No category found with name or ID '${categoryId}'. Please define this category first.`,
            });
          }
        } else {
          const doc = await Category.findOne({ name: categoryId });
          if (!doc) {
            console.warn(`Category "${categoryId}" is not defined.`);
            return res.status(400).json({
              error: true,
              message: `Category "${categoryId}" is not defined. Please define this category first.`,
            });
          }
          req.body.categoryId = doc.name;
        }
      } else {
        return res.status(400).json({
          error: true,
          message: "Category is required. Please define the category first.",
        });
      }

      console.log("Final update data:", req.body);

      const data = await Product.updateOne({ _id: req.params.id }, req.body, {
        runValidators: true,
      });
      console.log("Update operation result:", data);

      if (!data.matchedCount) {
        console.warn(`Product not found for update with ID '${req.params.id}'`);
        return res.status(404).json({
          error: true,
          message: "Product not found for update",
        });
      }

      // Retrieve the updated document with populated category and brand names.
      const updatedDoc = await Product.findOne({ _id: req.params.id })
        .populate("categoryId", "name")
        .populate("brandId", "name");
      console.log("Updated document (populated):", updatedDoc);

      return res.status(200).json({
        error: false,
        updated: data,
        new: updatedDoc,
      });
    } catch (err) {
      console.error("Error updating product:", err.message, err.stack);
      return res.status(500).json({
        error: true,
        message: "Error updating product",
      });
    }
  },

  // DELETE PRODUCT
  delete: async (req, res) => {
    try {
      const data = await Product.deleteOne({ _id: req.params.id });
      if (!data.deletedCount) {
        console.warn(
          `Product not found for deletion with ID '${req.params.id}'`
        );
        return res.status(404).json({
          error: true,
          message: "Product not found for deletion",
        });
      }
      console.log(`Product with ID '${req.params.id}' deleted successfully.`);
      return res.status(200).json({
        error: false,
        message: "Product successfully deleted",
        data,
      });
    } catch (err) {
      console.error("Error deleting product:", err.message, err.stack);
      return res.status(500).json({
        error: true,
        message: "Error deleting product",
      });
    }
  },
};
