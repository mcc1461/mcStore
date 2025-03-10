"use strict";

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3-v3");

// Create an S3 client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g., "us-east-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Ensure that AWS_S3_BUCKET is defined
if (!process.env.AWS_S3_BUCKET) {
  console.error("Error: AWS_S3_BUCKET is not defined in your environment.");
  process.exit(1);
}

// Configure multer to use multer-s3-v3 for storage in the S3 bucket.
// Explicitly set acl to an empty string so that no ACL header is sent.
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: "", // Explicitly set to an empty string to disable ACL headers
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|svg|webp/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only .jpeg, .jpg, .svg, .webp and .png files are allowed!"));
  },
});

// Import your auth controller (ensure it uses req.file.location for images)
const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);
console.log("[DEBUG] auth.register", auth.register);

// Define auth routes using the upload middleware for file handling.
router.post("/register", upload.single("image"), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

module.exports = router;
