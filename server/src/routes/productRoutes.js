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
  )
  // Admin, staff, and user can list products
  .post(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.create
  );
// Only admin and staff can create products

router
  .route("/:id")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.read
  )
  // Admin, staff, and user can read a product
  .put(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.update
  )
  .patch(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    productController.update
  )
  // Only admin and staff can partially or fully update a product
  .delete(
    authenticate,
    authorizeRoles("admin", "user"),
    productController.delete
  );
// Only admin can delete a product

module.exports = router;
