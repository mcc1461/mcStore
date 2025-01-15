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
  .get(brand.list)
  .post(authenticate, authorizeRoles("admin", "staff"), brand.create); // Admin and staff can create brands

router
  .route("/:id")
  .get(brand.read)
  .put(authenticate, authorizeRoles("admin", "staff"), brand.update) // Only admin can update a brand
  .patch(authenticate, authorizeRoles("admin"), brand.update) // Only admin can patch a brand
  .delete(authenticate, authorizeRoles("admin"), brand.delete); // Only admin can delete a brand

/* ------------------------------------------------------- */
module.exports = router;
