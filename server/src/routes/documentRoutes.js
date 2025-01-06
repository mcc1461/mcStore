"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const express = require("express");
const path = require("path");
const router = express.Router();

/* ------------------------------------------------------- */
// Import Dependencies
const redoc = require("redoc-express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../configs/swagger.json");

/* ------------------------------------------------------- */
// Base Route: /documents
router.all("/", (req, res) => {
  res.json({
    swagger: "/documents/swagger",
    redoc: "/documents/redoc",
    json: "/documents/json",
  });
});

// JSON Route: Serves the Swagger JSON
router.get("/json", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../configs/swagger.json"));
});

// Redoc Route: Serves API documentation via ReDoc
router.get(
  "/redoc",
  redoc({
    specUrl: "/documents/json",
    title: "API Documentation - MusCo Dev",
  })
);

// Swagger UI Route: Serves API documentation via Swagger UI
router.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  })
);

/* ------------------------------------------------------- */
module.exports = router;
