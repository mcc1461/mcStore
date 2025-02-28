"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev | authRoutes.js
------------------------------------------------------- */
const router = require("express").Router();
const multer = require("multer");
const upload = multer(); // Use multer with default configuration to parse multipart form fields

// Controllers
const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);

const purchaseController = require("../controllers/purchaseController");
const { authenticate } = require("../middlewares/findSearchSortPage");
// Alternatively, use the "authentication.js" if that is the correct path

// URL: /auth
console.log("[DEBUG] auth.register", auth.register);

// Use multer middleware (upload.none()) on the /register route so that multipart/form-data
// requests are parsed and text fields are available in req.body.
router.post("/register", upload.none(), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

// NOTE: Lines below are commented out to remove purchase creation from /auth
// router.post("/purchases", authenticate, purchaseController.create);
// router.get("/purchases", authenticate, purchaseController.list);

module.exports = router;
