"use strict";
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/.authMiddleware");
const categoryController = require("../controllers/categoryController");

// URL: /categories
router
  .route("/")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    categoryController.list
  )
  .post(authenticate, authorizeRoles("admin"), categoryController.create);

router
  .route("/:id")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    categoryController.read
  )
  .put(authenticate, authorizeRoles("admin"), categoryController.update)
  .patch(authenticate, authorizeRoles("admin"), categoryController.update)
  .delete(authenticate, authorizeRoles("admin"), categoryController.delete);

// New route for category summary using actual product data
router.get(
  "/:id/summary",
  authenticate,
  authorizeRoles("admin", "staff", "user"),
  categoryController.summary
);

module.exports = router;
