const fs = require("fs");
const path = require("path");

const deleteFileSync = (relativeFilePath) => {
  const filePath = path.join(__dirname, "..", relativeFilePath);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath); // Synchronous deletion
      console.log("File deleted successfully:", filePath);
      return true; // Indicates successful deletion
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error; // Rethrow to handle in the calling function
    }
  } else {
    console.warn("File does not exist:", filePath);
    return false; // Indicates file did not exist
  }
};

module.exports = deleteFileSync;
