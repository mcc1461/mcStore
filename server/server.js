"use strict";

/* -------------------------------------------------------
    NODEJS EXPRESS SERVER - server.js | MusCo Dev
------------------------------------------------------- */

const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

// IMPORTANT: Ensure your .env file is located at the project root (one level above the server folder)
// and that it defines MONGODB_URI, JWT_SECRET, etc.
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({
    path: path.join(__dirname, ".env.production"),
  });
} else {
  require("dotenv").config({ path: path.join(__dirname, ".env") });
}

let HOST = process.env.HOST || "127.0.0.1";
let PORT = process.env.PORT || 8061;
PORT = 8061;
HOST = "127.0.0.1";

/* ------------------------------------------------------- */
// Global CORS Setup using the cors package
const allowedOrigins = [
  "http://localhost:3061",
  "http://127.0.0.1:3061",
  "https://tailwindui.com",
  "https://store.musco.dev",
  // ... add others as needed
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl or mobile apps)
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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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

// Database Connection (ensure your .env has MONGODB_URI defined)
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

/* ------------------------------------------------------- */
// Application Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ------------------------------------------------------- */
// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve your client build from the "client/dist" folder
app.use(express.static(path.join(__dirname, "client/dist")));

app.use(findSearchSortPage);

/* ------------------------------------------------------- */
// Routes

// Forgotten Password Routes (no authentication required)
app.post("/forgotPassword", requestPasswordReset);
app.post("/reset-password", resetPassword);

// Authentication Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

// Protected routes: For routes that require authentication, we assume the token is sent
app.use("/api/users", authenticate, require("./src/routes/userRoutes"));
app.use("/api", authenticate, require("./src/routes"));

// API Documentation Route
app.all("/api/documents", (req, res) => {
  res.render("documents", {
    title: "Stock Management API Service for MusCo",
  });
});

// Frontend Catch-all Route for non-API requests.
// (Ensure that your clientDistPath points to the correct production build.)
const clientDistPath = path.join(__dirname, "../client");
console.log("Serving client build from:", clientDistPath);
console.log("__dirname:", __dirname);
app.use(express.static(clientDistPath));
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

// Centralized Error Handler (this wrapper ensures CORS headers are preserved on errors)
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
  }
  errorHandler(err, req, res, next);
});

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
