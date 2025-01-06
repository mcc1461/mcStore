"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authentication");
const {
  list,
  create,
  read,
  update,
  remove,
} = require("../controllers/userController");

/* ------------------------------------------------------- */
// URL: /users

// List users (Admin only)
router.get("/", authenticate, authorizeRoles("admin"), list);

// Create a new user (Admin only)
router.post("/", authenticate, authorizeRoles("admin"), create);

// User-specific routes
router
  .route("/:id")
  .get(authenticate, read) // Any logged-in user can view their profile or admin can view others
  .put(authenticate, authorizeRoles("admin", "staff"), update) // Admin or staff can update user info
  .patch(authenticate, authorizeRoles("admin", "staff"), update) // Support partial updates
  .delete(authenticate, authorizeRoles("admin"), remove); // Only admin can delete users

/* ------------------------------------------------------- */
module.exports = router;
