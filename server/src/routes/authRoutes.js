"use strict";
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3-v3");
const authController = require("../controllers/authController");

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
    acl: "", // Disable ACL header
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

// Define auth routes
router.post(
  "/register",
  upload.fields([{ name: "image", maxCount: 1 }]),
  authController.register
);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.requestPasswordReset);
router.post("/resetPassword", authController.resetPassword);

module.exports = router;
