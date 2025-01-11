"use strict";

/* -------------------------------------------------------
    NODEJS EXPRESS SERVER - server.js | MusCo Dev
------------------------------------------------------- */

const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8061;

// Handle async errors
require("express-async-errors");

// Import middlewares and utilities
const {
  authenticate,
  authorizeRoles,
} = require("./src/middlewares/authentication");
const errorHandler = require("./src/middlewares/errorHandler");
const { findSearchSortPage } = require("./src/middlewares/findSearchSortPage");

// Import controllers
const {
  resetPassword,
  requestPasswordReset,
} = require("./src/controllers/authController");

// Database Connection
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

/* ------------------------------------------------------- */
// Application Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ------------------------------------------------------- */
// Middlewares

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3061",
      "http://127.0.0.1:3061",
      "https://tailwindui.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors()); // Preflight request handling

// Serve static files for uploads directory (prioritize this middleware)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom Middleware
app.use(findSearchSortPage);

/* ------------------------------------------------------- */
// Routes

// Authentication Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

// User Routes
app.use("/api/users", authenticate, require("./src/routes/userRoutes"));

// Product and Other Entity Routes
app.use("/api", authenticate, require("./src/routes"));

// Forgotten Password Routes
app.post("/api/users/forgotPassword", requestPasswordReset);
app.post("/api/users/reset-password", resetPassword);

// API Documentation Route
app.all("/api/documents", (req, res) => {
  res.render("documents", {
    title: "Stock Management API Service for MusCo",
  });
});

// Welcome Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MusCo Dev API!" });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Frontend Catch-all Route
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next(); // Avoid serving index.html for API routes
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

/* ------------------------------------------------------- */
// Error Handlers

// 404 Not Found Handler for undefined API routes
app.use("/api", (req, res) => {
  res.status(404).json({ msg: "API route not found" });
});

// Centralized Error Handler
app.use(errorHandler);

/* ------------------------------------------------------- */
// Start the Server
app.listen(PORT, () =>
  console.log(`Server is running at http://${HOST}:${PORT}`)
);

/* ------------------------------------------------------- */
// Uncomment for production sync (if applicable)
// if (process.env.NODE_ENV === "production") {
//   require("./src/configs/sync")();
// }
