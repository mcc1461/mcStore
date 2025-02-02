"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();

// Base URL: /
router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/tokens", require("./tokenRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/brands", require("./brandRoutes"));
router.use("/firms", require("./firmRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/purchases", require("./purchaseRoutes"));
router.use("/sells", require("./sellRoutes"));
router.use("/documents", require("./documentRoutes"));

module.exports = router;
