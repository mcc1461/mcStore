"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const firm = require("../controllers/firmController");

// URL: /firms

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff", "user"), firm.list)
  // Admin and staff can list firms
  .post(authenticate, authorizeRoles("admin", "user"), firm.create);
// Only admin can create a firm

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff", "user"), firm.read)
  // Admin and staff can read a firm
  .put(authenticate, authorizeRoles("admin", "user"), firm.update)
  // Only admin can update a firm
  .patch(authenticate, authorizeRoles("admin", "user"), firm.update)
  // Only admin can partially update a firm
  .delete(authenticate, authorizeRoles("admin", "user"), firm.delete);
// Only admin can delete a firm

module.exports = router;
