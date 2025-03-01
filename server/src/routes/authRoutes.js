"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev | authRoutes.js
------------------------------------------------------- */
const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// Configure disk storage to save files in the uploads folder (assumed to be one level above in the project structure)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Adjust the path to your uploads folder as needed
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // You can change the filename format as you like
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Controllers
const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);

const purchaseController = require("../controllers/purchaseController");
const { authenticate } = require("../middlewares/findSearchSortPage");
// Alternatively, use the "authentication.js" if that is the correct path

// URL: /auth
console.log("[DEBUG] auth.register", auth.register);

// Use multer's upload.single() on the /register route to process file uploads.
// Expect the file field to be named "image".
// This will parse multipart/form-data and store any uploaded file.
router.post("/register", upload.single("image"), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

// NOTE: Purchase routes are commented out as before.
// router.post("/purchases", authenticate, purchaseController.create);
// router.get("/purchases", authenticate, purchaseController.list);

module.exports = router;
