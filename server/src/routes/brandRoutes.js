"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const brand = require("../controllers/brandController");

// URL: /brands

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), brand.list) // Admin and staff can list brands
  .post(authenticate, authorizeRoles("admin", "staff"), brand.create); // Admin and staff can create brands

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), brand.read) // Admin and staff can read a brand
  .put(authenticate, authorizeRoles("admin"), brand.update) // Only admin can update a brand
  .patch(authenticate, authorizeRoles("admin"), brand.update) // Only admin can patch a brand
  .delete(authenticate, authorizeRoles("admin"), brand.delete); // Only admin can delete a brand

/* ------------------------------------------------------- */
module.exports = router;
