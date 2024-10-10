"use strict";

/* -------------------------------------------------------
    NODEJS EXPRESS SERVER - server.js | MusCo Dev
------------------------------------------------------- */
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

/* ------------------------------------------------------- */
// Required Modules:

// envVariables to process.env:
require("dotenv").config({ path: path.join(__dirname, ".env") });
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8061;

// asyncErrors to errorHandler:
require("express-async-errors");

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ------------------------------------------------------- */
// Configurations:

// Connect to DB:
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

/* ------------------------------------------------------- */
// Middlewares:

// CORS:
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://tailwindui.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Add CORS headers for static files
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static files (including CSS)
app.use(express.static(path.join(__dirname, "public")));

// Accept JSON and URL Encoded Requests:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Check Authentication:
app.use(require("./src/middlewares/authentication"));

// res.getModelList():
app.use(require("./src/middlewares/findSearchSortPage"));

/* ------------------------------------------------------- */
// Routes:

// HomePath:
app.all("/api/documents", (req, res) => {
  res.render("documents", {
    title: "Stock Management API Service for MusCo",
  });
});

// API Routes:
app.use("/api", require("./src/routes"));

// Catch-all route for serving index.html if needed:
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Simple Welcome Message
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ message: "Hello MusCo" });
});

/* ------------------------------------------------------- */
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ msg: "not found" });
});

// Error Handler Middleware
app.use(require("./src/middlewares/errorHandler"));

// RUN SERVER:
app.listen(PORT, () => console.log(`http://${HOST}:${PORT}`));

// // Sync if in production
// if (process.env.NODE_ENV === "production") {
//   require("./src/configs/sync")();
// }
