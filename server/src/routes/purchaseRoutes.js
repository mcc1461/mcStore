"use strict";
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const purchaseController = require("../controllers/purchaseController");

// URL: /purchases

router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), purchaseController.list)
  .post(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.create
  );
// "create" matches purchaseController.create

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), purchaseController.read)
  .put(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.update
  )
  .patch(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.update
  )
  .delete(
    authenticate,
    authorizeRoles("admin", "staff"),
    purchaseController.delete
  );

module.exports = router;
