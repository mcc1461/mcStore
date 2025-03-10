"use strict";
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/.authMiddleware");
const sellController = require("../controllers/sellController");

// URL: /sells
router
  .route("/")
  .get(authenticate, authorizeRoles("admin", "staff"), sellController.list)
  .post(authenticate, authorizeRoles("admin", "staff"), sellController.create);

router
  .route("/:id")
  .get(authenticate, authorizeRoles("admin", "staff"), sellController.read)
  .put(authenticate, authorizeRoles("admin", "staff"), sellController.update)
  .patch(authenticate, authorizeRoles("admin", "staff"), sellController.update)
  .delete(
    authenticate,
    authorizeRoles("admin", "staff"),
    sellController.delete
  );

module.exports = router;
