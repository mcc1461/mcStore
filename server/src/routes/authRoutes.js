"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev | authRoutes.js
------------------------------------------------------- */
const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// Configure Multer storage using a direct absolute path for the uploads folder.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "/home/ubuntu/mcStore/server/uploads";
    console.log("[DEBUG] uploadPath", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Prepend a timestamp to avoid filename conflicts
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);

// const purchaseController = require("../controllers/purchaseController");
// const { authenticate } = require("../middlewares/findSearchSortPage");

console.log("[DEBUG] auth.register", auth.register);

// Use multer's upload.single("image") on the /register route so that multipart/form-data
// requests are parsed and any uploaded file is saved in the absolute uploads folder.
router.post("/register", upload.single("image"), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

module.exports = router;
