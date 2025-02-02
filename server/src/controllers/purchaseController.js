"use strict";
const Purchase = require("../models/purchaseModel");
const Product = require("../models/productModel");

// CREATE
exports.create = async (req, res) => {
  try {
    // 1) Make sure we have a user in token
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "No userId in token. Are you logged in?",
      });
    }

    // 2) If admin, allow separate buyerId. Otherwise use the current user
    let buyerId = req.user._id;
    if (req.user.role === "admin" && req.body.buyerId) {
      buyerId = req.body.buyerId;
    }

    // 3) Prepare the purchase data
    const purchaseData = {
      userId: req.user._id,
      buyerId,
      productId: req.body.productId,
      brandId: req.body.brandId,
      firmId: req.body.firmId,
      quantity: req.body.quantity,
      purchasePrice: req.body.purchasePrice,
    };

    // 4) Create & save the purchase
    const newPurchase = new Purchase(purchaseData);
    await newPurchase.save();

    // 5) Find the product to update quantity & push a subdoc
    const product = await Product.findById(req.body.productId);
    console.log("Product found:", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // 6) Increase product.quantity
    const qtyToAdd = Number(req.body.quantity) || 0;
    product.quantity = (product.quantity || 0) + qtyToAdd;

    // 7) Push a mini-log to product.purchases
    // Make sure product.purchases is an array (which it is from the schema).
    product.purchases.push({
      vendor: req.body.firmId,
      price: req.body.purchasePrice,
      quantity: qtyToAdd,
      date: new Date(),
    });

    // 8) Save product
    await product.save();

    // 9) Return
    return res.status(201).json({ data: newPurchase });
  } catch (err) {
    console.error("Error creating purchase:", err);
    return res.status(500).json({ message: err.message });
  }
};

// LIST (for your GET /purchases route)
exports.list = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    // Non-admin => only see purchases by userId or buyerId
    let filters = {};
    if (userRole !== "admin") {
      filters = { $or: [{ userId }, { buyerId: userId }] };
    }

    const purchases = await Purchase.find(filters)
      .populate("buyerId", "username email _id")
      .populate("userId", "username email _id");

    return res.status(200).json({ error: false, data: purchases });
  } catch (err) {
    console.error("Error listing purchases:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

// READ SINGLE
exports.read = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const purchase = await Purchase.findById(purchaseId)
      .populate("buyerId", "username email _id")
      .populate("userId", "username email _id");

    if (!purchase) {
      return res
        .status(404)
        .json({ error: true, message: "Purchase not found." });
    }

    // Non-admin => must be userId or buyerId
    if (
      userRole !== "admin" &&
      !purchase.userId.equals(userId) &&
      !purchase.buyerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Access denied for this purchase." });
    }

    return res.status(200).json({ error: false, data: purchase });
  } catch (err) {
    console.error("Error reading purchase:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res
        .status(404)
        .json({ error: true, message: "Purchase not found." });
    }

    // Non-admin => must be userId or buyerId
    if (
      userRole !== "admin" &&
      !purchase.userId.equals(userId) &&
      !purchase.buyerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Not allowed to update this purchase." });
    }

    // Store old quantity
    const oldQty = purchase.quantity;

    // Update fields if provided
    if (req.body.quantity !== undefined) {
      purchase.quantity = Number(req.body.quantity);
    }
    if (req.body.purchasePrice !== undefined) {
      purchase.purchasePrice = req.body.purchasePrice;
    }

    // Admin can reassign buyerId
    if (userRole === "admin" && req.body.buyerId) {
      purchase.buyerId = req.body.buyerId;
    }

    // Save the updated purchase
    await purchase.save();

    // Adjust the product quantity by the difference
    const product = await Product.findById(purchase.productId);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found." });
    }

    const newQty = purchase.quantity;
    const diff = newQty - oldQty;
    product.quantity = (product.quantity || 0) + diff;

    // OPTIONAL: If you want to record changes in the subdoc array,
    // you might push a second subdoc or update an existing one. Typically
    // you'd keep them as a simple log of events. But for now, you can skip or
    // do something like:
    /*
      product.purchases.push({
        vendor: purchase.firmId,
        price: purchase.purchasePrice,
        quantity: diff, // or newQty
        date: new Date(),
      });
    */

    await product.save();

    return res
      .status(200)
      .json({ error: false, message: "Purchase updated.", data: purchase });
  } catch (err) {
    console.error("Error updating purchase:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res
        .status(404)
        .json({ error: true, message: "Purchase not found." });
    }

    // Non-admin => must be userId or buyerId
    if (
      userRole !== "admin" &&
      !purchase.userId.equals(userId) &&
      !purchase.buyerId.equals(userId)
    ) {
      return res
        .status(403)
        .json({ error: true, message: "Not allowed to delete this purchase." });
    }

    // Revert product quantity
    const product = await Product.findById(purchase.productId);
    if (product) {
      product.quantity = (product.quantity || 0) - purchase.quantity;

      // Optionally remove the subdocument from product.purchases. But that
      // can be more complicated if you want to find the correct subdoc by date, etc.
      // For now we can simply do an additional log entry or skip.

      await product.save();
    }

    await Purchase.findByIdAndDelete(purchaseId);

    return res
      .status(200)
      .json({ error: false, message: "Purchase deleted successfully." });
  } catch (err) {
    console.error("Error deleting purchase:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
};
