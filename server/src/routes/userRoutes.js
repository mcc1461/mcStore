"use strict";

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3-v3");
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

// Create an S3 client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Ensure AWS_S3_BUCKET is defined
if (!process.env.AWS_S3_BUCKET) {
  console.error("Error: AWS_S3_BUCKET is not defined in your environment.");
  process.exit(1);
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // Note: No ACL option is set (since the bucket does not allow ACLs)
    key: (req, file, cb) => {
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

// Define user routes
router.get("/", authenticate, authorizeRoles("admin"), list);
router.post("/", authenticate, authorizeRoles("admin"), create);
router
  .route("/:id")
  .get(authenticate, read)
  .put(authenticate, upload.single("image"), update)
  .patch(authenticate, upload.single("image"), update)
  .delete(authenticate, authorizeRoles("admin"), remove);

module.exports = router;
