// server/utils/imageProcessor.js

const sharp = require("sharp");
const path = require("path");

async function resizeImage(inputPath, outputPath, options = {}) {
  const { width = 300, height = 300, fit = "inside" } = options;
  return sharp(inputPath).resize({ width, height, fit }).toFile(outputPath);
}

module.exports = { resizeImage };
