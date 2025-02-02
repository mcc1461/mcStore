"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev | authRoutes.js
------------------------------------------------------- */
const router = require("express").Router();

// Controllers
const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);

const purchaseController = require("../controllers/purchaseController");
const { authenticate } = require("../middlewares/findSearchSortPage");
// or use the "authentication.js" if that is the correct path

// URL: /auth
console.log("[DEBUG] auth.register", auth.register);
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

// NOTE: Lines below are commented out to remove purchase creation from /auth
// router.post("/purchases", authenticate, purchaseController.create);
// router.get("/purchases", authenticate, purchaseController.list);

// export
module.exports = router;
