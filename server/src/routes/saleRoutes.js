"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authentication");
const saleController = require("../controllers/saleController");

// URL: /sales

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), saleController.list) // Admin and staff can list sales
  .post(authenticate, authorizeRoles("admin", "staff"), saleController.create); // Admin and staff can create sales

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), saleController.read) // Admin and staff can read a specific sale
  .put(authenticate, authorizeRoles("admin", "staff"), saleController.update) // Admin and staff can update a sale
  .patch(authenticate, authorizeRoles("admin", "staff"), saleController.update) // Admin and staff can partially update a sale
  .delete(
    authenticate,
    authorizeRoles("admin", "staff"),
    saleController.delete
  ); // Admin and staff can delete a sale

/* ------------------------------------------------------- */
module.exports = router;
