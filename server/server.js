"use strict";

/* -------------------------------------------------------
    NODEJS EXPRESS SERVER - server.js | MusCo Dev
------------------------------------------------------- */

// Load environment variables immediately.
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({
    path: require("path").join(__dirname, "../.env.production"),
  });
} else {
  require("dotenv").config({
    path: require("path").join(__dirname, "../.env"),
  });
}

const express = require("express");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const app = express();

// Define allowed origins early.
const allowedOrigins = [
  "http://localhost:3061",
  "http://127.0.0.1:3061",
  "https://tailwindui.com",
  "https://store.musco.dev",
  // ... add others as needed.
];

/* --- Global CORS Middleware --- */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());

/* --- Deploy Webhook Route --- */
// This route listens for GitHub webhooks to trigger deployment.
// It uses express.raw so that we can verify the GitHub signature.
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
    // Trigger your deployment script here, e.g.:
    // const { exec } = require("child_process");
    // exec("sh /path/to/deploy.sh", (error, stdout, stderr) => { ... });
    console.log("Deploy webhook received. Payload:", req.body.toString());
    res.status(200).send("Deployment triggered.");
  }
);

/* --- Global Configuration --- */
let HOST = process.env.HOST || "127.0.0.1";
let PORT = process.env.PORT || 8061;
PORT = 8061;
HOST = "127.0.0.1";

/* --- Handle async errors --- */
require("express-async-errors");

// Import additional middlewares and utilities.
const {
  authenticate,
  authorizeRoles,
} = require("./src/middlewares/authentication");
const errorHandler = require("./src/middlewares/errorHandler");
const { findSearchSortPage } = require("./src/middlewares/findSearchSortPage");

// Import controllers.
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

/* --- Application Settings --- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* --- Standard Middlewares --- */
// (Note: /deploy already used express.raw; now we use JSON parser.)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files for uploads.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve your client build from the "client/dist" folder.
app.use(express.static(path.join(__dirname, "client/dist")));

app.use(findSearchSortPage);

/* --- Routes --- */
// Forgotten Password Routes (no authentication required)
app.post("/forgotPassword", requestPasswordReset);
app.post("/reset-password", resetPassword);

// Authentication Routes.
app.use("/api/auth", require("./src/routes/authRoutes"));

// Protected routes: For routes that require authentication.
app.use("/api/users", authenticate, require("./src/routes/userRoutes"));
app.use("/api", authenticate, require("./src/routes"));

// API Documentation Route.
app.all("/api/documents", (req, res) => {
  res.render("documents", {
    title: "Stock Management API Service for MusCo",
  });
});

// Frontend Catch-all Route for non-API requests.
// Assume the built client is in "../client/dist".
const clientDistPath = path.join(__dirname, "../client/dist");
console.log("Serving client build from:", clientDistPath);
console.log("__dirname:", __dirname);
app.use(express.static(clientDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDistPath, "index.html"));
});

/* --- Error Handlers --- */
// 404 Not Found for undefined API routes.
app.use("/api", (req, res) => {
  res.status(404).json({ msg: "API route not found" });
});

// Centralized Error Handler (preserving CORS headers)
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
  }
  errorHandler(err, req, res, next);
});

/* --- Start the Server --- */
app.listen(PORT, () =>
  console.log(`Server is running at http://${HOST}:${PORT}`)
);

/* ------------------------------------------------------- */
// Uncomment for production sync (if applicable)
// if (process.env.NODE_ENV === "production") {
//   require("./src/configs/sync")();
// }
