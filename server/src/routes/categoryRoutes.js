"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authentication");
const category = require("../controllers/categoryController");

// URL: /categories

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), category.list) // Admin and staff can list categories
  .post(authenticate, authorizeRoles("admin"), category.create); // Only admin can create categories

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), category.read) // Admin and staff can read a category
  .put(authenticate, authorizeRoles("admin"), category.update) // Only admin can update a category
  .patch(authenticate, authorizeRoles("admin"), category.update) // Only admin can partially update a category
  .delete(authenticate, authorizeRoles("admin"), category.delete); // Only admin can delete a category

/* ------------------------------------------------------- */
module.exports = router;
