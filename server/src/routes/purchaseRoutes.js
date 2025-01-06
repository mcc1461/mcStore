"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authentication");
const purchaseController = require("../controllers/purchaseController");

// URL: /purchases

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), purchaseController.list) // Admin and staff can list purchases
  .post(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.create
  ); // Admin and staff can create purchases

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), purchaseController.read) // Admin and staff can read a specific purchase
  .put(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.update
  ) // Admin and staff can update a purchase
  .patch(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.update
  ) // Admin and staff can partially update a purchase
  .delete(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.delete
  ); // Admin and staff can delete a purchase

/* ------------------------------------------------------- */
module.exports = router;
