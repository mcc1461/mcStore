"use strict";

const router = require("express").Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

// Configure AWS SDK using environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Access Key
  region: process.env.AWS_REGION, // AWS Region (e.g., "us-east-1")
});
const s3 = new AWS.S3();

// Ensure that AWS_S3_BUCKET is defined
if (!process.env.AWS_S3_BUCKET) {
  console.error("Error: AWS_S3_BUCKET is not defined in your environment.");
  process.exit(1);
}

// Configure multer to use multer-s3 for storage in the S3 bucket.
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name from .env
    acl: "public-read", // Adjust ACL as needed
    key: (req, file, cb) => {
      // Generate a unique filename
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

// Import your auth controller (adjust the path if needed)
const auth = require("../controllers/authController");
console.log("[DEBUG] authController", auth);
console.log("[DEBUG] auth.register", auth.register);

// Define auth routes using multer's upload middleware for file handling.
router.post("/register", upload.single("image"), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.get("/logout", auth.logout);

module.exports = router;
