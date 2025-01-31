"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const Product = require("../models/productModel");
const Purchase = require("../models/purchaseModel");

// Purchase Controller:
module.exports = {
  // ----------------------------------------------------
  // LIST
  // ----------------------------------------------------
  list: async (req, res) => {
    /*
       #swagger.tags = ["Purchases"]
       #swagger.summary = "List Purchases"
       #swagger.description = "You can use filter[], search[], sort[], page, limit queries..."
    */
    const data = await res.getModelList(Purchase, {}, [
      "firmId",
      "brandId",
      "productId",
    ]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Purchase),
      data,
    });
  },

  // ----------------------------------------------------
  // CREATE
  // ----------------------------------------------------
  create: async (req, res) => {
    /*
       #swagger.tags = ["Purchases"]
       #swagger.summary = "Create Purchase"
       #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           "firmId": "65343222b67e9681f937f304",
           "brandId": "65343222b67e9681f937f107",
           "productId": "65343222b67e9681f937f422",
           "quantity": 1,
           "purchasePrice": 9.99
         }
       }
    */

    // Auto add userId from auth middleware:
    req.body.userId = req.user?._id;

    // Now create the new Purchase
    const data = await Purchase.create(req.body);

    // If we want to also increment product quantity:
    // (this adds to the total stock on hand for that product)
    await Product.updateOne(
      { _id: data.productId },
      { $inc: { quantity: +data.quantity } }
    );

    res.status(201).send({
      error: false,
      data,
    });
  },

  // ----------------------------------------------------
  // READ
  // ----------------------------------------------------
  read: async (req, res) => {
    /*
       #swagger.tags = ["Purchases"]
       #swagger.summary = "Get Single Purchase"
    */
    const data = await Purchase.findOne({ _id: req.params.id }).populate([
      "firmId",
      "brandId",
      "productId",
    ]);

    res.status(200).send({
      error: false,
      data,
    });
  },

  // ----------------------------------------------------
  // UPDATE
  // ----------------------------------------------------
  update: async (req, res) => {
    /*
       #swagger.tags = ["Purchases"]
       #swagger.summary = "Update Purchase"
       #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           "firmId": "65343222b67e9681f937f304",
           "brandId": "65343222b67e9681f937f107",
           "productId": "65343222b67e9681f937f422",
           "quantity": 1,
           "purchasePrice": 9.99
         }
       }
    */

    // If quantity changed, we adjust product quantity
    if (req.body?.quantity !== undefined) {
      const currentPurchase = await Purchase.findOne({ _id: req.params.id });
      if (currentPurchase) {
        // difference in quantity from old to new
        const quantityDiff = req.body.quantity - currentPurchase.quantity;

        // If quantityDiff is positive, it means we are adding more
        // If negative, we remove from product quantity
        await Product.updateOne(
          { _id: currentPurchase.productId },
          { $inc: { quantity: +quantityDiff } }
        );
      }
    }

    // Perform the update
    await Purchase.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    // Return the updated doc
    const newDoc = await Purchase.findOne({ _id: req.params.id });
    res.status(202).send({
      error: false,
      data: newDoc,
    });
  },

  // ----------------------------------------------------
  // DELETE
  // ----------------------------------------------------
  delete: async (req, res) => {
    /*
       #swagger.tags = ["Purchases"]
       #swagger.summary = "Delete Purchase"
    */

    // find the purchase first
    const currentPurchase = await Purchase.findOne({ _id: req.params.id });
    if (!currentPurchase) {
      return res.status(404).send({
        error: true,
        data: null,
        message: "Purchase not found",
      });
    }

    // delete the purchase doc
    const data = await Purchase.deleteOne({ _id: req.params.id });

    // subtract that quantity from product
    await Product.updateOne(
      { _id: currentPurchase.productId },
      { $inc: { quantity: -currentPurchase.quantity } }
    );

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
