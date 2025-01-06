"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();

/* ------------------------------------------------------- */
// Base URL: /
// Import and Register Route Modules

// Auth:
router.use("/auth", require("./authRoutes"));

// User:
router.use("/users", require("./userRoutes"));

// Token:
router.use("/tokens", require("./tokenRoutes"));

// Category:
router.use("/categories", require("./categoryRoutes"));

// Brand:
router.use("/brands", require("./brandRoutes"));

// Firm:
router.use("/firms", require("./firmRoutes"));

// Product:
router.use("/products", require("./productRoutes"));

// Purchase:
router.use("/purchases", require("./purchaseRoutes"));

// Sale:
router.use("/sales", require("./saleRoutes"));

// Document:
router.use("/documents", require("./documentRoutes"));

/* ------------------------------------------------------- */
module.exports = router;
