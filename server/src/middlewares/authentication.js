"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: true, message: "No Bearer token provided." });
    }

    const token = authHeader.substring(7).trim(); // after "Bearer "
    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "No token found after Bearer." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        return res.status(401).json({
          error: true,
          message: "Invalid or expired token. Please log in again.",
        });
      }

      // LOG: SEE WHAT'S INSIDE THE DECODED TOKEN
      console.log("[DEBUG] authenticate -> Decoded token:", decoded);

      // If token has "id" but not "_id", fix it
      if (decoded.id && !decoded._id) {
        decoded._id = decoded.id;
      }

      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal authentication error." });
  }
};

/**
 * Middleware to check for specific roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: "Access denied. You are not logged in.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Requires one of the following roles: ${roles.join(
          ", "
        )}.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
