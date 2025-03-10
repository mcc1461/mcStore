"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/.authMiddleware");
const tokenController = require("../controllers/tokenController");

// URL: /tokens

// All routes require admin authentication
router.use(authenticate, authorizeRoles("admin"));

router
  .route("/")
  .get(tokenController.list) // Admin can list all tokens
  .post(tokenController.create); // Admin can create a new token

router
  .route("/:id")
  .get(tokenController.read) // Admin can read a specific token
  .put(tokenController.update) // Admin can update a token
  .patch(tokenController.update) // Admin can partially update a token
  .delete(tokenController.delete); // Admin can delete a token

/* ------------------------------------------------------- */
module.exports = router;
