"use strict";

/* -------------------------------------------------------
    NODEJS EXPRESS SERVER - server.js | MusCo Dev
------------------------------------------------------- */

const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

// Load environment variables from the project root
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({
    path: path.join(__dirname, "../.env.production"),
  });
} else {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
}

let HOST = process.env.HOST || "127.0.0.1";
let PORT = process.env.PORT || 8061;
PORT = 8061;
HOST = "127.0.0.1";
/* ------------------------------------------------------- */

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

app.use(
  cors({
    origin: [
      "http://localhost:3061",
      "http://127.0.0.1:3061",
      "https://tailwindui.com",
      "https://store.musco.dev",
      "https://www.store.musco.dev",
      "https://store.musco.dev:3061",
      "https://www.store.musco.dev:3061",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

// Serve static files for uploads directory (prioritize this middleware)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom Middleware
app.use(findSearchSortPage);

/* ------------------------------------------------------- */
// Routes

// Forgotten Password Routes (no authentication required)
app.post("/forgotPassword", requestPasswordReset);
app.post("/reset-password", resetPassword);

// Authentication Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

// User Routes
app.use("/api/users", authenticate, require("./src/routes/userRoutes"));

// Product and Other Entity Routes
app.use("/api", authenticate, require("./src/routes"));

// API Documentation Route
app.all("/api/documents", (req, res) => {
  res.render("documents", {
    title: "Stock Management API Service for MusCo",
  });
});

/* ------------------------------------------------------- */
// Serve frontend static files from the client's production build ("dist")
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// Frontend Catch-all Route for non-API requests
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDistPath, "index.html"));
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
