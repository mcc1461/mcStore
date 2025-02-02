"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();
const multer = require("multer"); // Import multer for file uploads
const path = require("path");
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

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory for uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
    }
  },
});

// URL: /users

// List all users (Admin only)
router.get("/", authenticate, authorizeRoles("admin"), list);

// Create a new user (Admin only)
router.post("/", authenticate, authorizeRoles("admin"), create);

// Fetch, update, and delete user
router
  .route("/:id")
  .get(authenticate, read) // any authenticated user can see profile, or admin can see others
  .put(authenticate, upload.single("image"), update)
  .patch(authenticate, upload.single("image"), update)
  .delete(authenticate, authorizeRoles("admin"), remove);

module.exports = router;
