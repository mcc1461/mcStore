const mongoose = require("mongoose");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");

/**
 * Resolves a brand or category reference by checking if `value` is
 * a valid ObjectId. If not, try finding a doc by `name`.
 *
 * @param {String} value - An ObjectId string or a name, e.g. "Nike"
 * @param {String} type - "brand" or "category"
 * @returns {String|undefined} The resolved ObjectId as string if found, else undefined
 */
async function resolveId(value, type) {
  if (!value) return undefined;

  // 1) Check if value is a valid ObjectId
  const isObjectId = mongoose.Types.ObjectId.isValid(value);
  if (isObjectId) {
    // Return value as-is (it's already an ObjectId string)
    return value;
  }

  // 2) Not an ObjectId => assume it's a name
  let doc;
  if (type === "brand") {
    doc = await Brand.findOne({ name: value });
  } else {
    doc = await Category.findOne({ name: value });
  }

  // 3) If found by name, return the doc's _id
  if (doc) {
    return doc._id.toString();
  }

  // If no doc found, return undefined (let controller decide how to handle)
  return undefined;
}

module.exports = {
  resolveId,
};
