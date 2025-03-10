// server/config/multerConfig.js
const multer = require("multer");

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|svg|webp/;
  const extname = fileTypes.test(
    file.originalname.toLowerCase().split(".").pop()
  );
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
// server/src/controllers/userController.js
