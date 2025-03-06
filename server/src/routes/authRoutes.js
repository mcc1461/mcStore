"use strict";

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  list,
  create,
  read,
  update,
  remove,
} = require("../controllers/userController");

// Configure AWS SDK using environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Access Key
  region: process.env.AWS_REGION, // AWS Region (e.g., "us-east-1")
});
const s3 = new AWS.S3();

// Ensure AWS_S3_BUCKET is defined
if (!process.env.AWS_S3_BUCKET) {
  console.error("Error: AWS_S3_BUCKET is not defined in your environment.");
  process.exit(1);
}

// Configure multer to use multer-s3 for storage in the S3 bucket.
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
    acl: "public-read", // Adjust ACL as needed
    key: (req, file, cb) => {
      // Generate a unique filename using current time and a random number
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
  },
});

// Routes for user management

// List all users (Admin only)
router.get("/", authenticate, authorizeRoles("admin"), list);

// Create a new user (Admin only)
router.post("/", authenticate, authorizeRoles("admin"), create);

// Fetch, update, and delete user
router
  .route("/:id")
  .get(authenticate, read) // Any authenticated user can view their own profile; admin can view others.
  // Use the S3 upload configuration for profile image updates.
  .put(authenticate, upload.single("image"), update)
  .patch(authenticate, upload.single("image"), update)
  .delete(authenticate, authorizeRoles("admin"), remove);

module.exports = router;
