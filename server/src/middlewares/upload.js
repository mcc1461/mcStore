"use strict";

const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

// Ensure the upload directory exists
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Define storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || "./uploads";
    createUploadDir(uploadPath); // Ensure the directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

// Define file filter for validation
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedFileTypes.test(fileExtension) && mimeType.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else if (!allowedFileTypes.test(fileExtension)) {
    cb(
      new Error("Invalid file extension. Only jpeg, jpg, png, gif are allowed.")
    );
  } else {
    cb(new Error("Invalid MIME type. File is not an image."));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
});

// Middleware for processing uploaded files
const uploadMiddleware = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res.status(400).json({ error: true, message: err.message });
      } else if (err) {
        // Other errors
        return res.status(400).json({ error: true, message: err.message });
      }
      next();
    });
  };
};

// Optional: Thumbnail generation using sharp
const generateThumbnail = async (filePath, outputFilePath) => {
  try {
    await sharp(filePath)
      .resize(300, 300) // Example: 300x300 thumbnail
      .toFile(outputFilePath);
  } catch (error) {
    console.error("Error generating thumbnail:", error);
  }
};

module.exports = {
  upload,
  uploadMiddleware,
  generateThumbnail,
};
