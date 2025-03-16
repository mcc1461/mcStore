"use strict";
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const sellController = require("../controllers/sellController");

// URL: /sells
router
  .route("/")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.list
  )
  .post(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.create
  );

router
  .route("/:id")
  .get(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.read
  )
  .put(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.update
  )
  .patch(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.update
  )
  .delete(
    authenticate,
    authorizeRoles("admin", "staff", "user"),
    sellController.delete
  );

module.exports = router;
