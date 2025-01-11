const fs = require("fs");
const path = require("path");

// Path to the file you want to delete
const filePath = path.join(
  __dirname,
  "uploads",
  "image-1736513620935-55193682.png"
);

// Check if the file exists
if (fs.existsSync(filePath)) {
  try {
    // Attempt to delete the file
    fs.unlinkSync(filePath);
    console.log("File deleted successfully:", filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
} else {
  console.warn("File does not exist:", filePath);
}
