"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const productController = require("../controllers/productController");

// URL: /products

router
  .route("/")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.list
  ) // Admin, staff, and users can list products
  .post(
    authenticate,
    authorizeRoles("admin", "staff"),
    productController.create
  ); // Only admin and staff can create products

router
  .route("/:id")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.read
  ) // Admin, staff, and users can read a product
  .put(authenticate, authorizeRoles("admin", "staff"), productController.update) // Only admin and staff can update a product
  .patch(
    authenticate,
    authorizeRoles("admin", "staff"),
    productController.update
  ) // Only admin and staff can partially update a product
  .delete(authenticate, authorizeRoles("admin"), productController.delete); // Only admin can delete a product

/* ------------------------------------------------------- */
module.exports = router;
