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
  .get(authenticate, authorizeRoles("admin", "staff"), firm.list)
  // Admin and staff can list firms
  .post(authenticate, authorizeRoles("admin"), firm.create);
// Only admin can create a firm

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), firm.read)
  // Admin and staff can read a firm
  .put(authenticate, authorizeRoles("admin"), firm.update)
  // Only admin can update a firm
  .patch(authenticate, authorizeRoles("admin"), firm.update)
  // Only admin can partially update a firm
  .delete(authenticate, authorizeRoles("admin"), firm.delete);
// Only admin can delete a firm

module.exports = router;
