"use strict";
const Sell = require("../models/sellModel");
const Product = require("../models/productModel");

/**
 * CREATE a Sell
 *   - Decrements product quantity
 *   - Parallels "purchaseController.create"
 */
exports.create = async (req, res) => {
  try {
    // 1) Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "No userId in token. Are you logged in?",
      });
    }

    // 2) If admin, allow separate sellerId. Otherwise use the current user
    let sellerId = req.user._id;
    if (req.user.role === "admin" && req.body.sellerId) {
      sellerId = req.body.sellerId;
    }

    // 3) Prepare the sell data
    const sellData = {
      userId: req.user._id, // who created this record
      sellerId, // staff/admin who made the sell
      productId: req.body.productId,
      brandId: req.body.brandId,
      quantity: req.body.quantity,
      sellPrice: req.body.sellPrice,
    };

    // 4) Create & save the sell
    const newSell = new Sell(sellData);
    await newSell.save();

    // 5) Find the product
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // 6) Check stock
    const qtyToSubtract = Number(req.body.quantity) || 0;
    if (product.quantity < qtyToSubtract) {
      return res.status(400).json({
        message: "Not enough stock available.",
        availableStock: product.quantity,
      });
    }

    // 7) Decrement product quantity
    product.quantity = (product.quantity || 0) - qtyToSubtract;

    // 8) Push a mini-log to `product.sells`
    if (!product.sells) {
      product.sells = [];
    }
    product.sells.push({
      price: req.body.sellPrice,
      quantity: qtyToSubtract,
      date: new Date(),
    });

    await product.save();

    // 9) Return
    return res.status(201).json({ data: newSell });
  } catch (err) {
    console.error("Error creating sell:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * LIST (GET /sells)
 *   - If user is admin => see all
 *   - If user is not admin => only see sells by userId or sellerId = current user
 */
exports.list = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let filters = {};
    // Non-admin => only sells where userId or sellerId is the current user
    if (userRole !== "admin") {
      filters = { $or: [{ userId }, { sellerId: userId }] };
    }

    const sells = await Sell.find(filters)
      .populate("sellerId", "username email _id")
      .populate("userId", "username email _id");

    return res.status(200).json({ error: false, data: sells });
  } catch (err) {
    console.error("Error listing sells:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

/**
 * READ SINGLE (GET /sells/:id)
 *   - If user not admin => must be userId or sellerId
 */
exports.read = async (req, res) => {
  try {
    const sellId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const sell = await Sell.findById(sellId)
      .populate("sellerId", "username email _id")
      .populate("userId", "username email _id");

    if (!sell) {
      return res.status(404).json({ error: true, message: "Sell not found." });
    }

    // Non-admin => must match userId or sellerId
    if (
      userRole !== "admin" &&
      !sell.userId.equals(userId) &&
      !sell.sellerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Access denied for this sell." });
    }

    return res.status(200).json({ error: false, data: sell });
  } catch (err) {
    console.error("Error reading sell:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

/**
 * UPDATE (PUT/PATCH /sells/:id)
 *   - Adjust product quantity by the difference
 *   - Parallel to purchaseController.update
 */
exports.update = async (req, res) => {
  try {
    const sellId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const sell = await Sell.findById(sellId);
    if (!sell) {
      return res.status(404).json({ error: true, message: "Sell not found." });
    }

    // Non-admin => must be userId or sellerId
    if (
      userRole !== "admin" &&
      !sell.userId.equals(userId) &&
      !sell.sellerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Not allowed to update this sell." });
    }

    // Store old quantity
    const oldQty = sell.quantity;

    // Update fields if provided
    if (req.body.quantity !== undefined) {
      sell.quantity = Number(req.body.quantity);
    }
    if (req.body.sellPrice !== undefined) {
      sell.sellPrice = req.body.sellPrice;
    }

    // Admin can reassign sellerId
    if (userRole === "admin" && req.body.sellerId) {
      sell.sellerId = req.body.sellerId;
    }

    // Save the updated sell
    await sell.save();

    // Adjust the product quantity by the difference
    const product = await Product.findById(sell.productId);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found." });
    }

    const newQty = sell.quantity;
    const diff = newQty - oldQty;

    // If diff > 0 => we are increasing the sell quantity => must check stock
    if (diff > 0 && product.quantity < diff) {
      return res.status(400).json({
        message: `Not enough stock to increase sell quantity by ${diff}. Only ${product.quantity} left.`,
      });
    }

    // Subtract or add to product quantity
    product.quantity = (product.quantity || 0) - diff;

    // Optionally push a subdoc log to product.sells
    if (!product.sells) {
      product.sells = [];
    }
    product.sells.push({
      price: sell.sellPrice,
      quantity: diff,
      date: new Date(),
    });

    await product.save();

    return res.status(200).json({
      error: false,
      message: "Sell updated.",
      data: sell,
    });
  } catch (err) {
    console.error("Error updating sell:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

/**
 * DELETE (DELETE /sells/:id)
 *   - Revert product quantity
 *   - Parallel to purchaseController.delete
 */
exports.delete = async (req, res) => {
  try {
    const sellId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const sell = await Sell.findById(sellId);
    if (!sell) {
      return res.status(404).json({ error: true, message: "Sell not found." });
    }

    // Non-admin => must be userId or sellerId
    if (
      userRole !== "admin" &&
      !sell.userId.equals(userId) &&
      !sell.sellerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Not allowed to delete this sell." });
    }

    // Revert product quantity
    const product = await Product.findById(sell.productId);
    if (product) {
      product.quantity = (product.quantity || 0) + sell.quantity;

      // Optionally log the revert in product.sells
      if (!product.sells) {
        product.sells = [];
      }
      product.sells.push({
        price: sell.sellPrice,
        quantity: -sell.quantity, // negative means revert
        date: new Date(),
      });

      await product.save();
    }

    await Sell.findByIdAndDelete(sellId);

    return res
      .status(200)
      .json({ error: false, message: "Sell deleted successfully." });
  } catch (err) {
    console.error("Error deleting sell:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};
