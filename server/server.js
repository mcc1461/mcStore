"use strict";

// Load environment variables from .env or .env.production
const path = require("path");
const dotenv = require("dotenv");
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.join(__dirname, ".env.production") });
} else {
  dotenv.config({ path: path.join(__dirname, ".env") });
}

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
// Removed express-fileupload to avoid conflicts with multer
const multer = require("multer");
const multerS3 = require("multer-s3");

require("express-async-errors"); // catch async errors automatically

// Import additional middlewares and utilities
const {
  authenticate,
  authorizeRoles,
} = require("./src/middlewares/authMiddleware");
const errorHandler = require("./src/middlewares/errorHandler");
const { findSearchSortPage } = require("./src/middlewares/findSearchSortPage");

// Controllers
const {
  resetPassword,
  requestPasswordReset,
} = require("./src/controllers/authController");

// Database Connection (ensure your .env has MONGODB_URI defined)
const { dbConnection } = require("./src/configs/dbConnection");
if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in your .env file.");
  process.exit(1);
}
dbConnection();

const app = express();

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3061",
  "http://127.0.0.1:3061",
  "https://tailwindui.com",
  "https://store.musco.dev",
  "https://softrealizer.com",
  "https://www.softrealizer.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());

// Deploy Webhook Route (for GitHub)
function verifyGitHubSignature(req, res, buf, encoding) {
  const signature = req.headers["x-hub-signature-256"];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!signature || !secret) {
    throw new Error("Missing signature or secret");
  }
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(buf);
  const digest = "sha256=" + hmac.digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    throw new Error("Invalid signature");
  }
}
app.post(
  "/deploy",
  express.raw({ type: "application/json", verify: verifyGitHubSignature }),
  (req, res) => {
    console.log("Deploy webhook received. Payload:", req.body.toString());
    res.status(200).send("Deployment triggered.");
  }
);

// Global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve client build static assets (if any)
app.use(express.static(path.join(__dirname, "client/dist")));

// Use findSearchSortPage middleware for any additional query parsing
app.use(findSearchSortPage);

// Public API route for documentation
app.all("/api/documents", (req, res) => {
  res.render("documents", { title: "Stock Management API Service for MusCo" });
});

// Protected API Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", authenticate, require("./src/routes/userRoutes"));
app.use("/api", authenticate, require("./src/routes"));

// Frontend Catch-all Route (serve client build)
const clientDistPath = path.join(__dirname, "../client/dist");
console.log("Serving client build from:", clientDistPath);
console.log("__dirname:", __dirname);
app.use(express.static(clientDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// 404 Error for undefined API routes
app.use("/api", (req, res) => {
  res.status(404).json({ msg: "API route not found" });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
  }
  errorHandler(err, req, res, next);
});

// Start the server
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 8061;
app.listen(PORT, () =>
  console.log(`Server is running at http://${HOST}:${PORT}`)
);
